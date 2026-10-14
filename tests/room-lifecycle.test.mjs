import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { createHash } from "node:crypto";
import { openCollaborationStore } from "../src/lib/collaboration/store.ts";
import { invitationExpiry, MAX_INVITATION_LIFETIME_MS } from "../src/lib/collaboration/lifecycle.ts";
const state = () => ({title:"Invented trip",startDate:"2027-04-01",endDate:"2027-04-02",cities:[{id:"city-a",name:"Example City",lat:48,lng:2}],activities:[],days:{}});
const fails = status => error => error.status === status;

test("expiry uses bounded canonical UTC dates", () => {
  const now = Date.parse("2027-01-01T00:00:00.000Z");
  assert.equal(invitationExpiry(undefined,now), now + 604800000);
  assert.equal(invitationExpiry(new Date(now+MAX_INVITATION_LIFETIME_MS).toISOString(),now),now+MAX_INVITATION_LIFETIME_MS);
  for (const expiry of [null,12,"2027-02-30T00:00:00.000Z","2027-01-01T00:00:00.000Z",new Date(now+MAX_INVITATION_LIFETIME_MS+1).toISOString(),"2027-01-02T00:00:00Z"]) assert.throws(()=>invitationExpiry(expiry,now),fails(400));
});

test("expired and revoked invitations cannot read or edit after restart", async () => {
  const dir = await mkdtemp(join(tmpdir(),"trippy-lifecycle-")), path=join(dir,"rooms.sqlite");
  let now=Date.parse("2027-01-01T00:00:00.000Z"), store=await openCollaborationStore({sqlitePath:path,now:()=>now});
  try {
    const room=await store.create(state());
    const editor=await store.invite(room.roomId,room.ownerToken,"editor",new Date(now+1000).toISOString());
    const viewer=await store.invite(room.roomId,room.ownerToken,"viewer");
    now+=999; assert.equal((await store.read(room.roomId,editor.token)).role,"editor");
    now++; await assert.rejects(store.read(room.roomId,editor.token),fails(403));
    await assert.rejects(store.update(room.roomId,editor.token,1,state()),fails(403));
    await store.revoke(room.roomId,room.ownerToken,viewer.inviteId);
    await store.close(); store=await openCollaborationStore({sqlitePath:path,now:()=>now});
    await assert.rejects(store.read(room.roomId,viewer.token),fails(403));
    await assert.rejects(store.read(room.roomId,editor.token),fails(403));
    const inventory=(await store.read(room.roomId,room.ownerToken)).invites;
    assert.equal(inventory.find(i=>i.inviteId===editor.inviteId).expired,true);
  } finally {await store.close();await rm(dir,{recursive:true,force:true});}
});

test("only owner rotates or deletes; old owner revoked; stale/concurrent operations fail closed", async () => {
  const dir=await mkdtemp(join(tmpdir(),"trippy-lifecycle-")), path=join(dir,"rooms.sqlite");
  let store=await openCollaborationStore({sqlitePath:path});
  try {
    const room=await store.create(state());
    const editor=await store.invite(room.roomId,room.ownerToken,"editor"), viewer=await store.invite(room.roomId,room.ownerToken,"viewer");
    for(const access of [editor.token,viewer.token]) {
      await assert.rejects(store.deleteRoom(room.roomId,access,1),fails(403));
      await assert.rejects(store.rotateOwner(room.roomId,access,1),fails(403));
    }
    await assert.rejects(store.deleteRoom(room.roomId,room.ownerToken,2),fails(412));
    const outcomes=await Promise.allSettled([store.rotateOwner(room.roomId,room.ownerToken,1),store.rotateOwner(room.roomId,room.ownerToken,1)]);
    assert.equal(outcomes.filter(r=>r.status==="fulfilled").length,1);
    assert.equal(outcomes.find(r=>r.status==="rejected").reason.status,403);
    const rotated=outcomes.find(r=>r.status==="fulfilled").value;
    assert.equal(rotated.revision,2);
    await assert.rejects(store.read(room.roomId,room.ownerToken),fails(403));
    await assert.rejects(store.update(room.roomId,room.ownerToken,2,state()),fails(403));
    await assert.rejects(store.invite(room.roomId,room.ownerToken,"viewer"),fails(403));
    await assert.rejects(store.deleteRoom(room.roomId,rotated.ownerToken,1),fails(412));
    assert.equal((await store.read(room.roomId,editor.token)).revision,2);
    const snapshot=await store.read(room.roomId,rotated.ownerToken);
    assert.equal(JSON.stringify(snapshot).includes(rotated.ownerToken),false);
    await store.close();store=await openCollaborationStore({sqlitePath:path});
    assert.equal((await store.read(room.roomId,rotated.ownerToken)).role,"owner");
    const race=await Promise.allSettled([store.update(room.roomId,editor.token,2,state()),store.deleteRoom(room.roomId,rotated.ownerToken,2)]);
    assert.equal(race.filter(r=>r.status==="fulfilled").length,1);
    if(race[0].status==="fulfilled") await store.deleteRoom(room.roomId,rotated.ownerToken,3);
    for(const access of [rotated.ownerToken,editor.token,viewer.token]) await assert.rejects(store.read(room.roomId,access),fails(404));
    await store.close();store=await openCollaborationStore({sqlitePath:path});
    await assert.rejects(store.read(room.roomId,rotated.ownerToken),fails(404));
    const inspect=new DatabaseSync(path);
    assert.equal(inspect.prepare("SELECT COUNT(*) AS count FROM collaboration_capabilities").get().count,0);
    assert.equal(inspect.prepare("SELECT COUNT(*) AS count FROM collaboration_rooms").get().count,0);
    inspect.close();
  } finally {await store.close();await rm(dir,{recursive:true,force:true});}
});

test("existing SQLite schema migrates without losing legacy capabilities",async()=>{
  const dir=await mkdtemp(join(tmpdir(),"trippy-lifecycle-")),path=join(dir,"rooms.sqlite");
  const legacy=new DatabaseSync(path), access="invented-legacy-token";
  legacy.exec("CREATE TABLE collaboration_rooms(id TEXT PRIMARY KEY,revision INTEGER NOT NULL,state TEXT NOT NULL); CREATE TABLE collaboration_capabilities(id TEXT PRIMARY KEY,room_id TEXT NOT NULL REFERENCES collaboration_rooms(id),token_hash TEXT NOT NULL UNIQUE,role TEXT NOT NULL,revoked INTEGER NOT NULL DEFAULT 0);");
  legacy.prepare("INSERT INTO collaboration_rooms VALUES ('legacy-room',1,?)").run(JSON.stringify(state()));
  legacy.prepare("INSERT INTO collaboration_capabilities VALUES ('legacy-cap','legacy-room',?,'owner',0)").run(createHash("sha256").update(access).digest("hex"));legacy.close();
  const store=await openCollaborationStore({sqlitePath:path});
  try {assert.equal((await store.read("legacy-room",access)).role,"owner");await store.deleteRoom("legacy-room",access,1);} finally {await store.close();await rm(dir,{recursive:true,force:true});}
});
