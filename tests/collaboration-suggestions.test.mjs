import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openCollaborationStore } from "../src/lib/collaboration/store.ts";
import { validateCollaborationState } from "../src/lib/collaboration/schema.ts";
import { reviewCollaborationSuggestion } from "../src/lib/collaboration/suggestions.ts";
import { reconciliationChanges, resolveReconciliation } from "../src/lib/collaboration/reconciliation.ts";

const board = () => ({ title: "Invented museum weekend", startDate: "2027-04-01", endDate: "2027-04-03", cities: [{ id: "example-city", name: "Example City" }], activities: [{ id: "river-walk", cityId: "example-city", title: "River walk", notes: "Bring water" }], days: { "2027-04-01": ["river-walk"] } });
const suggestion = (overrides = {}) => ({ id: "proposal-museum", kind: "activity", status: "pending", activity: { id: "museum", cityId: "example-city", title: "Museum morning", notes: "Compare opening times" }, day: "2027-04-02", ...overrides });
const fails = status => error => error.status === status;

test("legacy boards remain compatible; proposal validation bounds data and rejects private or broken references", () => {
  assert.deepEqual(validateCollaborationState(board()), board());
  const valid = { ...board(), suggestions: [suggestion()] };
  assert.deepEqual(validateCollaborationState(valid), valid);
  for (const proposal of [suggestion({ id: "proposal-extra", ownerToken: "invented" }), suggestion({ day: "2027-04-04" }), suggestion({ activity: { ...suggestion().activity, notes: "Traveler email traveler@example.com" } }), suggestion({ activity: { ...suggestion().activity, cityId: "absent-city" } }), { id: "missing-idea", kind: "day", status: "pending", activityId: "absent", day: "2027-04-02" }]) assert.throws(() => validateCollaborationState({ ...board(), suggestions: [proposal] }), fails(400));
  assert.throws(() => validateCollaborationState({ ...board(), suggestions: Array.from({ length: 101 }, (_, i) => suggestion({ id: `proposal-${i}` })) }), fails(400));
});

test("review derives only the proposed activity/day and retains rejected proposals separately", () => {
  const original = { ...board(), suggestions: [suggestion()] };
  const applied = reviewCollaborationSuggestion(original, "proposal-museum", "apply");
  assert.equal(original.activities.length, 1);
  assert.equal(applied.activities.length, 2);
  assert.deepEqual(applied.days["2027-04-02"], ["museum"]);
  assert.deepEqual(applied.cities, original.cities);
  assert.equal(applied.suggestions[0].status, "applied");
  assert.throws(() => reviewCollaborationSuggestion(applied, "proposal-museum", "apply"), fails(409));
  const rejected = reviewCollaborationSuggestion(original, "proposal-museum", "reject");
  assert.deepEqual(rejected.activities, original.activities);
  assert.deepEqual(rejected.days, original.days);
  assert.equal(rejected.suggestions[0].status, "rejected");
});

test("moving a proposed day removes the original assignment without duplication", () => {
  const result = reviewCollaborationSuggestion({ ...board(), suggestions: [{ id: "move-walk", kind: "day", status: "pending", activityId: "river-walk", day: "2027-04-03" }] }, "move-walk", "apply");
  assert.deepEqual(result.days["2027-04-01"], []);
  assert.deepEqual(result.days["2027-04-03"], ["river-walk"]);
});

test("durable owner review enforces roles, immutable pending data, conflict safety and one application", async () => {
  const directory = await mkdtemp(join(tmpdir(), "trippy-suggestions-"));
  let store = await openCollaborationStore({ sqlitePath: join(directory, "rooms.sqlite") });
  try {
    const room = await store.create(board());
    const editor = await store.invite(room.roomId, room.ownerToken, "editor");
    const viewer = await store.invite(room.roomId, room.ownerToken, "viewer");
    const proposed = { ...board(), suggestions: [suggestion()] };
    await assert.rejects(store.update(room.roomId, viewer.token, 1, proposed), fails(403));
    const saved = await store.update(room.roomId, editor.token, 1, proposed);
    assert.deepEqual(saved.state.activities, board().activities, "submitting does not mutate the board");
    for (const capability of [editor.token, viewer.token]) await assert.rejects(store.reviewSuggestion(room.roomId, capability, 2, "proposal-museum", "apply"), fails(403));
    await assert.rejects(store.update(room.roomId, editor.token, 2, { ...proposed, suggestions: [] }), fails(403));
    await assert.rejects(store.update(room.roomId, room.ownerToken, 2, { ...proposed, suggestions: [suggestion({ status: "applied" })] }), fails(403));
    await assert.rejects(store.update(room.roomId, editor.token, 2, { ...proposed, suggestions: [suggestion({ day: "2027-04-03" })] }), fails(403));
    await assert.rejects(store.reviewSuggestion(room.roomId, room.ownerToken, 1, "proposal-museum", "apply"), error => error.status === 412 && error.latest.state.suggestions[0].status === "pending");
    const applied = await store.reviewSuggestion(room.roomId, room.ownerToken, 2, "proposal-museum", "apply");
    assert.equal(applied.revision, 3);
    assert.equal(applied.state.suggestions[0].status, "applied");
    await assert.rejects(store.reviewSuggestion(room.roomId, room.ownerToken, 3, "proposal-museum", "apply"), fails(409));
    await store.close(); store = await openCollaborationStore({ sqlitePath: join(directory, "rooms.sqlite") });
    assert.equal((await store.read(room.roomId, viewer.token)).state.suggestions[0].status, "applied");
  } finally { await store.close(); await rm(directory, { recursive: true, force: true }); }
});

test("reconciliation preserves independent local and latest proposals instead of dropping a queue", () => {
  const base = board();
  const local = { ...base, suggestions: [suggestion()] };
  const latest = { ...base, suggestions: [{ id: "move-walk", kind: "day", status: "pending", activityId: "river-walk", day: "2027-04-03" }] };
  const changes = reconciliationChanges(base, local, latest);
  assert.equal(changes.length, 2);
  assert.ok(changes.every(change => !change.conflict));
  const merged = resolveReconciliation(base, local, latest, Object.fromEntries(changes.map(change => [change.key, change.suggested])));
  assert.equal(merged.suggestions.length, 2);
  assert.deepEqual(merged.activities, base.activities);
});
