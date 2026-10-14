import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, realpath, mkdir, symlink, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { createAccountSystem } from '../src/lib/accounts/system.ts';
import { revision } from '../src/lib/accounts/http.ts';
import { accountConfiguration } from '../src/lib/accounts/config.ts';
import { createWorkspace } from '../src/lib/generic-trip-workspace.ts';
const trip = { schemaVersion: 1, id: 'synthetic-trip', name: 'Synthetic planning trip', status: 'planning', dateWindow: { earliestDeparture: '2030-01-01', latestReturn: '2030-01-03', flexDays: 0 }, travelers: { adults: 1, childrenAges: [] }, origins: [{ kind: 'airport', code: 'AAA' }], destinations: [{ id: 'city', name: 'Synthetic City', priority: 'required' }], preferences: { pace: 'balanced', directFlightBias: 0.5, hotelLocationBias: 0.5, activityThemes: [] }, anchors: [], routeCandidates: [], bookings: [] };
const origin = 'http://localhost:3000';
const cookie = response => response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
const email = label => [label, 'example.invalid'].join('@');
async function authRequest(system, endpoint, body, cookies = '') { return system.auth.handler(new Request(`${origin}/api/auth/${endpoint}`, { method: 'POST', headers: { 'content-type': 'application/json', origin, cookie: cookies }, body: JSON.stringify(body) })); }
test('accounts disabled by default and fail closed when key/storage configuration missing', () => {
 assert.equal(accountConfiguration({}).ready, false);
 assert.equal(accountConfiguration({ PRIVATE_ACCOUNTS_ENABLED: 'true' }).ready, false);
 assert.equal(accountConfiguration({ PRIVATE_ACCOUNTS_ENABLED: 'true', BETTER_AUTH_URL: origin, BETTER_AUTH_SECRET: 'x'.repeat(40), PRIVATE_ACCOUNTS_ENCRYPTION_KEY: 'a'.repeat(64), VERCEL: '1' }).ready, false);
});
test('real Better Auth signup/signin/session/logout, tenant isolation, encrypted CAS persistence and deletion', async () => {
 const directory = await realpath(await mkdtemp(join(tmpdir(), 'trippy-accounts-'))), path = join(directory, 'accounts.sqlite');
 const options = { secret: randomBytes(48).toString('hex'), key: randomBytes(32), origin, sqlitePath: path };
 let system = await createAccountSystem(options);
 try {
  const password = randomBytes(24).toString('base64url');
  const a = await authRequest(system, 'sign-up/email', { name: 'Synthetic A', email: email('synthetic-a'), password }); assert.equal(a.status, 200); const userA = (await a.json()).user.id, cookieA = cookie(a);
  const b = await authRequest(system, 'sign-up/email', { name: 'Synthetic B', email: email('synthetic-b'), password }); assert.equal(b.status, 200); const userB = (await b.json()).user.id;
  assert.equal((await system.auth.api.getSession({ headers: new Headers({ cookie: cookieA }) })).user.id, userA);
  assert.equal(await system.auth.api.getSession({ headers: new Headers({ cookie: 'invalid=session' }) }), null);
  const bad = await authRequest(system, 'sign-in/email', { email: email('synthetic-a'), password: 'wrong-password' }); assert.equal(bad.status, 401);
  const plan = await system.create(userA, createWorkspace(trip));
  assert.equal(plan.revision, 1); assert.equal((await system.list(userB)).length, 0);
  await assert.rejects(system.read(userB, plan.id), error => error.status === 404);
  await assert.rejects(system.update(userB, plan.id, 1, plan.workspace), error => error.status === 404);
  await assert.rejects(system.remove(userB, plan.id, 1), error => error.status === 404);
  const updated = await system.update(userA, plan.id, 1, plan.workspace); assert.equal(updated.revision, 2);
  await assert.rejects(system.update(userA, plan.id, 1, plan.workspace), error => error.status === 412);
  await assert.rejects(system.remove(userA, plan.id, 1), error => error.status === 412);
  const unsafe = structuredClone(plan.workspace); unsafe.trip.name = email('private-contact'); await assert.rejects(system.create(userA, unsafe), error => error.status === 400);
  const bytes = Buffer.concat([await readFile(path), await readFile(path + '-wal')]); assert.equal(bytes.includes(Buffer.from(trip.name)), false);
  await system.close(); system = await createAccountSystem(options); assert.equal((await system.read(userA, plan.id)).revision, 2);
  const signIn = await authRequest(system, 'sign-in/email', { email: email('synthetic-a'), password }); assert.equal(signIn.status, 200); const cookieIn = cookie(signIn);
  const signOut = await authRequest(system, 'sign-out', {}, cookieIn); assert.equal(signOut.status, 200); assert.equal(await system.auth.api.getSession({ headers: new Headers({ cookie: cookieIn }) }), null);
  const signInAgain = await authRequest(system, 'sign-in/email', { email: email('synthetic-a'), password });
  const withoutPassword = await authRequest(system, 'delete-user', {}, cookie(signInAgain)); assert.equal(withoutPassword.status, 400); assert.equal((await system.list(userA)).length, 1);
  const incorrectPassword = await authRequest(system, 'delete-user', { password: 'incorrect-current-password' }, cookie(signInAgain)); assert.equal(incorrectPassword.status, 400); assert.equal((await system.list(userA)).length, 1);
  const deletion = await authRequest(system, 'delete-user', { password }, cookie(signInAgain)); assert.equal(deletion.status, 200);
  assert.equal((await system.list(userA)).length, 0); assert.equal(await system.auth.api.getSession({ headers: new Headers({ cookie: cookie(signInAgain) }) }), null);
 } finally { await system.close(); await rm(directory, { recursive: true, force: true }); }
});
test('optional reset transport is mocked; reset invalidates previous sessions', async () => {
 const directory = await realpath(await mkdtemp(join(tmpdir(), 'trippy-accounts-reset-'))); let message;
 const system = await createAccountSystem({ secret: randomBytes(48).toString('hex'), key: randomBytes(32), origin, sqlitePath: join(directory, 'accounts.sqlite'), sendPasswordReset: async value => { message = value; } });
 try {
  const password = randomBytes(24).toString('base64url'); const signup = await authRequest(system, 'sign-up/email', { name: 'Synthetic reset', email: email('reset'), password }); const cookies = cookie(signup);
  const requested = await authRequest(system, 'request-password-reset', { email: email('reset'), redirectTo: origin + '/account' }); assert.equal(requested.status, 200); assert.equal(message.recipient, email('reset'));
  const token = new URL(message.url).pathname.split('/').at(-1); const newPassword = randomBytes(24).toString('base64url');
  const reset = await authRequest(system, 'reset-password', { token, newPassword }); assert.equal(reset.status, 200);
  assert.equal(await system.auth.api.getSession({ headers: new Headers({ cookie: cookies }) }), null);
  assert.equal((await authRequest(system, 'sign-in/email', { email: email('reset'), password: newPassword })).status, 200);
 } finally { await system.close(); await rm(directory, { recursive: true, force: true }); }
});

test('default storage rejects a symlinked private root before opening any public database', async () => {
 const directory = await realpath(await mkdtemp(join(tmpdir(), 'trippy-accounts-path-'))), previous = process.cwd();
 await mkdir(join(directory, 'public')); await symlink(join(directory, 'public'), join(directory, '.private'));
 try { process.chdir(directory); await assert.rejects(createAccountSystem({ secret: randomBytes(48).toString('hex'), key: randomBytes(32), origin }), /symlinks/); await assert.rejects(access(join(directory, 'public/accounts/accounts.sqlite'))); }
 finally { process.chdir(previous); await rm(directory, { recursive: true, force: true }); }
});

test('conditional plan writes require a valid current revision header', () => {
 for (const header of ['1', '"1"', '42']) assert.equal(revision(new Request(origin, { headers: { 'if-match': header } })), Number(header.replaceAll('"', '')));
 for (const header of ['', '0', '"1', '1"', 'NaN', '9007199254740992']) assert.throws(() => revision(new Request(origin, { headers: { 'if-match': header } })), error => error.status === 428);
});

test('atomic per-account plan cap holds under concurrent saves on two SQLite connections and counts UTF-8 bytes', async () => {
 const directory = await realpath(await mkdtemp(join(tmpdir(), 'trippy-accounts-quota-')));
 const options = { secret: randomBytes(48).toString('hex'), key: randomBytes(32), origin, sqlitePath: join(directory, 'accounts.sqlite') };
 const first = await createAccountSystem(options), second = await createAccountSystem(options);
 try {
  const signup = await authRequest(first, 'sign-up/email', { name: 'Synthetic quota', email: email('quota'), password: randomBytes(24).toString('base64url') }); assert.equal(signup.status, 200); const owner = (await signup.json()).user.id;
  const workspace = createWorkspace(trip);
  for (let index = 0; index < 19; index++) await first.create(owner, workspace);
  const saves = await Promise.allSettled(Array.from({ length: 8 }, (_, index) => (index % 2 ? first : second).create(owner, workspace)));
  assert.equal(saves.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(saves.filter(result => result.status === 'rejected' && result.reason.status === 429).length, 7);
  const plans = await first.list(owner); assert.equal(plans.length, 20);
  const updated = await first.update(owner, plans[0].id, plans[0].revision, workspace); assert.equal(updated.revision, 2);
  await first.remove(owner, plans[0].id, updated.revision); await second.create(owner, workspace); assert.equal((await first.list(owner)).length, 20);
  const oversized = createWorkspace(trip);
  oversized.activities = Array.from({ length: 800 }, (_, index) => ({ id: `activity-${index}`, placeId: 'city', title: 'Synthetic visit', date: '2030-01-01', time: '10:00', durationMinutes: 30, notes: '界'.repeat(1000) }));
  assert.ok(JSON.stringify(oversized).length < 2_000_000); assert.ok(Buffer.byteLength(JSON.stringify(oversized), 'utf8') > 2_000_000);
  await assert.rejects(first.create(owner, oversized), error => error.status === 400);
 } finally { await first.close(); await second.close(); await rm(directory, { recursive: true, force: true }); }
});
