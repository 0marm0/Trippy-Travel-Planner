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
test('reviewed sharing retains bundled photo sources and zero pins without copying external photos or owner sidecars',()=>{
 const workspace=createWorkspace(createNormalizedTrip({name:'Invented map day',start:'2030-04-01',end:'2030-04-03',cities:['Harbor'],origins:['AAA'],adults:2,flexDays:0,pace:'balanced',themes:[]}));
 const placeId=workspace.trip.destinations[0].id,checkedAt='2030-03-01T12:00:00Z';
 workspace.activities=[{id:'bundled-venue',placeId,title:'Bundled venue',date:'2030-04-01',time:'10:00',durationMinutes:60,notes:'',photo:{url:'/media/invented-venue.webp',credit:'Invented photographer',sourceUrl:'https://example.test/source',checkedAt},coordinates:{lat:0,lng:0,source:'Invented map note',checkedAt}},{id:'external-venue',placeId,title:'External venue',date:'2030-04-02',time:'10:00',durationMinutes:60,notes:'',photo:{url:'https://images.unsplash.com/invented-photo',credit:'Invented photographer',sourceUrl:'https://example.test/source',checkedAt}}];
 const before=structuredClone(workspace),board=genericCollaborationBoard(workspace);
 assert.equal(board.activities[0].image,'/media/invented-venue.webp');assert.equal(board.activities[0].sourceUrl,'https://example.test/source');assert.equal(board.activities[0].lat,0);assert.equal(board.activities[0].lng,0);
 assert.equal('photo' in board.activities[0],false);assert.equal('image' in board.activities[1],false);assert.equal('coordinates' in board.activities[0],false);assert.equal('checkedAt' in board.activities[0],false);assert.deepEqual(workspace,before);
});
