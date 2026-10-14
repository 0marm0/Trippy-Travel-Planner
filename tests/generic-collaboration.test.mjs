import test from "node:test";
import assert from "node:assert/strict";
import { createNormalizedTrip } from "../src/lib/normalized-trip.ts";
import { createWorkspace } from "../src/lib/generic-trip-workspace.ts";
import { genericCollaborationBoard } from "../src/lib/generic-collaboration.ts";
test("sharing retains days and activities but excludes booking and account fields", () => {
  const workspace = createWorkspace(createNormalizedTrip({ name: "Example city weekend", start: "2030-04-01", end: "2030-04-04", cities: ["Lisbon", "Porto"], origins: ["AAA"], adults: 2, flexDays: 0, pace: "balanced", themes: [] }));
  workspace.activities.push({ id: "museum", placeId: workspace.trip.destinations[0].id, title: "Museum visit", date: "2030-04-02", time: "10:00", durationMinutes: 90, notes: "Bring water" });
  workspace.trip.bookings.push({ id: "stay", kind: "stay", status: "recommended", startAt: "2030-04-01T15:00:00Z", endAt: "2030-04-04T10:00:00Z", provider: "Example lodging" });
  const board = genericCollaborationBoard(workspace);
  assert.deepEqual(board.days["2030-04-02"], ["museum"]);
  assert.equal(board.activities[0].durationMinutes, 90);
  assert.equal(JSON.stringify(board).includes("Example lodging"), false);
  assert.equal("bookings" in board, false);
  workspace.activities[0].notes = "API key: inventedExampleValue";
  assert.throws(() => genericCollaborationBoard(workspace));
});
