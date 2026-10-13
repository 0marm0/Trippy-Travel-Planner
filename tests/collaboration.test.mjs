import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, mkdir, symlink, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openCollaborationStore, collaborationConfiguration, confinedCollaborationSqlitePath } from "../src/lib/collaboration/store.ts";
import { validateCollaborationState, safeCollaborationSourceUrl } from "../src/lib/collaboration/schema.ts";
import { publicSampleCollaborationState } from "../src/lib/collaboration/sample.ts";
import { authorizeRoomCreation, creationConfiguration, body, handle, revision, sameOrigin, token } from "../src/lib/collaboration/http.ts";

const sample = () => ({ title: "Invented walking trip", startDate: "2027-04-01", endDate: "2027-04-03", cities: [{ id: "city-a", name: "Example City", lat: 48, lng: 2 }], activities: [{ id: "walk-a", cityId: "city-a", title: "River walk", notes: "Bring water" }], days: { "2027-04-01": ["walk-a"] } });
const fails = status => error => error.status === status;

test("durable rooms enforce roles, conditional writes, capability revocation and hashed custody", async () => {
  const directory = await mkdtemp(join(tmpdir(), "trippy-collaboration-test-"));
  const path = join(directory, "rooms.sqlite");
  let store = await openCollaborationStore({ sqlitePath: path });
  try {
    const room = await store.create(sample());
    assert.equal((await stat(path)).mode & 0o777, 0o600);
    const editor = await store.invite(room.roomId, room.ownerToken, "editor");
    const viewer = await store.invite(room.roomId, room.ownerToken, "viewer");
    assert.equal((await store.read(room.roomId, editor.token)).role, "editor");
    const changed = sample(); changed.activities[0].notes = "Afternoon walk";
    await assert.rejects(store.update(room.roomId, viewer.token, 1, changed), fails(403));
    await assert.rejects(store.invite(room.roomId, editor.token, "viewer"), fails(403));
    await assert.rejects(store.revoke(room.roomId, viewer.token, editor.inviteId), fails(403));
    const changedDates = sample(); changedDates.startDate = "2027-03-31";
    await assert.rejects(store.update(room.roomId, editor.token, 1, changedDates), fails(403));
    const results = await Promise.allSettled([store.update(room.roomId, editor.token, 1, changed), store.update(room.roomId, room.ownerToken, 1, sample())]);
    assert.equal(results.filter(result => result.status === "fulfilled").length, 1);
    const rejected = results.find(result => result.status === "rejected");
    assert.equal(rejected.reason.status, 412);
    assert.equal(rejected.reason.latest.revision, 2);
    assert.equal(rejected.reason.latest.state.activities[0].notes, "Afternoon walk");
    assert.equal("ownerToken" in rejected.reason.latest, false);
    await store.revoke(room.roomId, room.ownerToken, editor.inviteId);
    await assert.rejects(store.read(room.roomId, editor.token), fails(403));
    await assert.rejects(store.update(room.roomId, editor.token, 2, changed), fails(403));
    await store.close();
    store = await openCollaborationStore({ sqlitePath: path });
    const restored = await store.read(room.roomId, room.ownerToken);
    assert.equal(restored.revision, 2);
    assert.equal(restored.state.activities[0].notes, "Afternoon walk");
    assert.equal(restored.invites.find(invite => invite.inviteId === editor.inviteId).revoked, true);
    assert.equal(restored.invites.find(invite => invite.inviteId === viewer.inviteId).role, "viewer");
    assert.equal("invites" in await store.read(room.roomId, viewer.token), false);
    await assert.rejects(store.read(room.roomId, editor.token), fails(403));
    const disk = (await readFile(path)).toString();
    assert.equal(disk.includes(room.ownerToken), false);
    assert.equal(disk.includes(editor.token), false);
    assert.equal(disk.includes(viewer.token), false);
    await assert.rejects(store.read(room.roomId, "invented-invalid-capability"), fails(403));
  } finally { await store.close(); await rm(directory, { recursive: true, force: true }); }
});

test("schema rejects booking/private fields, identifier text and invalid references", () => {
  assert.deepEqual(validateCollaborationState(sample()), sample());
  for (const field of ["bookings", "confirmationNumber", "email", "ownerToken", "href", "loyaltyId", "seat"]) {
    assert.throws(() => validateCollaborationState({ ...sample(), [field]: "invented" }), fails(400));
  }
  for (const value of ["invented@example.test", "https://mail.google.com/test", "booking reference invented", "API key invented", "seat assignment invented", "sk-inventedTestValue", "ghp_inventedTestValue", "github_pat_invented_test", "AIzaInventedTestValue", "ya29.invented", "PNR invented", "seat12A", "123456789", "ｓｋ-inventedTestValue"]) {
    const state = sample(); state.activities[0].notes = value;
    assert.throws(() => validateCollaborationState(state), fails(400));
  }
  const identifier = sample(); identifier.activities[0].id = "sk-inventedTestValue";
  assert.throws(() => validateCollaborationState(identifier), fails(400));
  const locatorId = sample(); locatorId.activities[0].id = "ABC123";
  assert.throws(() => validateCollaborationState(locatorId), fails(400));
  const image = sample(); image.activities[0].image = "/media/sk-inventedTestValue.webp";
  assert.throws(() => validateCollaborationState(image), fails(400));
  const unknown = sample(); unknown.days["2027-04-01"] = ["missing-id"];
  assert.throws(() => validateCollaborationState(unknown), fails(400));
  const duplicate = sample(); duplicate.days["2027-04-02"] = ["walk-a"];
  assert.throws(() => validateCollaborationState(duplicate), fails(400));
  const outside = sample(); outside.days["2027-04-04"] = ["walk-a"];
  assert.throws(() => validateCollaborationState(outside), fails(400));
  assert.equal(safeCollaborationSourceUrl("https://example.org/museum"), "https://example.org/museum");
  for (const url of ["https://example.org/?token=invented", "https://example.org/#invented", "https://invented@example.org/", "javascript:alert(1)", "https://mail.google.com/invented", "https://example.org/%73%6b-invented", "https://example.org/%2573%256b-invented", "https://example.org/ｓｋ-invented", "https://example.org/123456789"]) assert.equal(safeCollaborationSourceUrl(url), undefined);
});

test("public sample projection never shares bookings, raw links or private-mode input", () => {
  const trip = { dataMode: "sample", title: "Sample trip", start: "2027-04-01", end: "2027-04-03", stops: [{ id: "city-a", name: "Example City", lat: 48, lng: 2, checkIn: "2027-04-01", nights: 2 }], activities: [{ id: "walk-a", city: "city-a", title: "River walk", description: "Public catalogue", image: "/media/river-walk.webp", url: "https://example.org/walk", status: "confirmed", details: "booking reference invented" }], cityPlans: { "city-a": [{ blocks: [{ id: "walk-a" }, { id: "unknown-private-id" }] }, { blocks: [{ id: "walk-a" }] }] }, bookings: [{ ref: "invented-ref", href: "invented-private-link" }] };
  const result = publicSampleCollaborationState(trip);
  assert.equal(result.activities.length, 1);
  assert.equal(result.activities[0].image, "/media/river-walk.webp");
  assert.deepEqual(result.days, { "2027-04-01": ["walk-a"] });
  assert.equal(JSON.stringify(result).includes("invented-ref"), false);
  assert.equal(JSON.stringify(result).includes("confirmed"), false);
  assert.throws(() => publicSampleCollaborationState({ ...trip, dataMode: "private" }));
});

test("remote room creation requires a configured bounded creation code, never included in status", () => {
  const remote = new Request("https://example.org/api/collaboration/rooms");
  assert.throws(() => authorizeRoomCreation(remote, {}), fails(503));
  assert.doesNotThrow(() => authorizeRoomCreation(new Request("http://localhost:3000/api/collaboration/rooms"), {}));
  const env = { COLLABORATION_CREATE_CODE: "invented-creation-code-for-tests" };
  assert.throws(() => authorizeRoomCreation(remote, env), fails(403));
  assert.throws(() => authorizeRoomCreation(new Request(remote, { headers: { "X-Trippy-Create-Code": "incorrect-invented-creation-code" } }), env), fails(403));
  assert.throws(() => authorizeRoomCreation(new Request(remote, { headers: { "X-Trippy-Create-Code": "x".repeat(257) } }), env), fails(403));
  assert.doesNotThrow(() => authorizeRoomCreation(new Request(remote, { headers: { "X-Trippy-Create-Code": env.COLLABORATION_CREATE_CODE } }), env));
  assert.throws(() => authorizeRoomCreation(remote, { COLLABORATION_CREATE_CODE: "short" }), fails(503));
  assert.throws(() => authorizeRoomCreation(new Request("http://localhost:3000"), { VERCEL: "1" }), fails(503));
  const status = creationConfiguration(remote, env);
  assert.deepEqual(status, { creationCodeRequired: true, creationAvailable: true });
  assert.equal(JSON.stringify(status).includes(env.COLLABORATION_CREATE_CODE), false);
});

test("production SQLite path refuses symbolic-link ancestors, files and escaping paths", async () => {
  const directory = await mkdtemp(join(tmpdir(), "trippy-collaboration-path-test-"));
  try {
    const publicDirectory = join(directory, "public"); await mkdir(publicDirectory);
    await symlink(publicDirectory, join(directory, ".private"));
    assert.throws(() => confinedCollaborationSqlitePath(directory), fails(503));
    await rm(join(directory, ".private")); await mkdir(join(directory, ".private"));
    await symlink(publicDirectory, join(directory, ".private/collaboration"));
    assert.throws(() => confinedCollaborationSqlitePath(directory), fails(503));
    await rm(join(directory, ".private/collaboration"));
    const path = confinedCollaborationSqlitePath(directory);
    assert.equal(path, join(directory, ".private/collaboration/rooms.sqlite"));
    assert.equal(confinedCollaborationSqlitePath(directory, ""), path);
    await symlink(join(publicDirectory, "test.sqlite"), path);
    assert.throws(() => confinedCollaborationSqlitePath(directory), fails(503));
    assert.throws(() => confinedCollaborationSqlitePath(directory, join(publicDirectory, "test.sqlite")), fails(503));
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("hosted configuration fails closed without durable Postgres", () => {
  assert.equal(collaborationConfiguration({}).configured, false);
  assert.equal(collaborationConfiguration({ COLLABORATION_ENABLED: "true" }).mode, "sqlite");
  assert.equal(collaborationConfiguration({ COLLABORATION_ENABLED: "true", VERCEL: "1" }).configured, false);
  assert.equal(collaborationConfiguration({ COLLABORATION_ENABLED: "true", VERCEL: "1", COLLABORATION_DATABASE_URL: "invented-configured-presence" }).mode, "postgres");
});

test("HTTP rejects unversioned writes, cross-origin bodies, query capabilities and oversized input", async () => {
  assert.throws(() => revision(new Request("https://example.org")), fails(428));
  assert.throws(() => revision(new Request("https://example.org", { headers: { "If-Match": "*" } })), fails(428));
  assert.equal(revision(new Request("https://example.org", { headers: { "If-Match": '"2"' } })), 2);
  assert.throws(() => token(new Request("https://example.org")), fails(401));
  assert.throws(() => sameOrigin(new Request("https://example.org?token=invented")), fails(400));
  assert.throws(() => sameOrigin(new Request("https://example.org", { headers: { Origin: "https://elsewhere.example" } })), fails(403));
  await assert.rejects(body(new Request("https://example.org", { method: "POST", body: "{}", headers: { "Content-Type": "text/plain" } }), ["state"]), fails(415));
  await assert.rejects(body(new Request("https://example.org", { method: "POST", body: JSON.stringify({ value: "x".repeat(530000) }), headers: { "Content-Type": "application/json" } }), ["state"]), fails(413));
  const response = await handle(async () => { throw new Error("invented-sensitive-database-details"); });
  assert.equal(response.status, 503);
  assert.equal((await response.text()).includes("invented-sensitive"), false);
  assert.equal(response.headers.get("cache-control").includes("no-store"), true);
});
