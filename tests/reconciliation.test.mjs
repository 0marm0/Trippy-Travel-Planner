import test from 'node:test';
import assert from 'node:assert/strict';
import { reconciliationChanges, resolveReconciliation, parseRecovery, serializeRecovery } from '../src/lib/collaboration/reconciliation.ts';
const base = () => ({ title: 'A museum weekend', startDate: '2026-11-01', endDate: '2026-11-03', cities: [{ id: 'city-a', name: 'Paris' }], activities: [{ id: 'idea-a', cityId: 'city-a', title: 'Museum', notes: 'Morning', durationMinutes: 60 }, { id: 'idea-b', cityId: 'city-a', title: 'Park', notes: '' }], days: { '2026-11-01': ['idea-a', 'idea-b'] } });
const choices = changes => Object.fromEntries(changes.map(change => [change.key, change.suggested]));
test('independent fields on one activity and independent new entities survive review', () => {
  const b = base(), l = base(), r = base(); l.activities[0].title = 'Art museum'; r.activities[0].notes = 'Afternoon';
  l.activities.push({ id: 'local-idea', cityId: 'city-a', title: 'Cafe', notes: '' }); r.activities.push({ id: 'remote-idea', cityId: 'city-a', title: 'Garden', notes: '' });
  const changes = reconciliationChanges(b, l, r);
  assert.ok(changes.every(change => !change.conflict));
  const result = resolveReconciliation(b, l, r, choices(changes));
  assert.equal(result.activities[0].title, 'Art museum'); assert.equal(result.activities[0].notes, 'Afternoon');
  assert.equal(result.activities.length, 4);
  assert.deepEqual(b, base());
});
test('same field conflict requires explicit choice and retains both values', () => {
  const b = base(), l = base(), r = base(); l.activities[0].notes = 'Local morning'; r.activities[0].notes = 'Shared afternoon';
  const changes = reconciliationChanges(b, l, r); assert.equal(changes[0].conflict, true); assert.equal(changes[0].base, 'Morning');
  assert.throws(() => resolveReconciliation(b, l, r, {}), /Choose/);
  assert.equal(resolveReconciliation(b, l, r, { [changes[0].key]: 'latest' }).activities[0].notes, 'Shared afternoon');
});
test('delete versus edit is an entity conflict; deletion never silently drops references', () => {
  const b = base(), l = base(), r = base(); l.activities = l.activities.slice(1); l.days['2026-11-01'] = ['idea-b']; r.activities[0].title = 'Edited museum';
  const changes = reconciliationChanges(b, l, r), deletion = changes.find(change => change.key === 'activities/idea-a');
  assert.equal(deletion.conflict, true);
  const selected = choices(changes); selected[deletion.key] = 'latest';
  assert.equal(resolveReconciliation(b, l, r, selected).activities.find(item => item.id === 'idea-a').title, 'Edited museum');
  selected[deletion.key] = 'local'; selected['days/2026-11-01'] = 'latest';
  assert.throws(() => resolveReconciliation(b, l, r, selected));
});
test('day order conflicts and cross-day duplicate assignments require compatible choices', () => {
  const b = base(), l = base(), r = base(); l.days = { '2026-11-01': ['idea-b'], '2026-11-02': ['idea-a'] }; r.days = { '2026-11-01': ['idea-b'], '2026-11-03': ['idea-a'] };
  const changes = reconciliationChanges(b, l, r), selected = choices(changes);
  assert.throws(() => resolveReconciliation(b, l, r, selected));
  selected['days/2026-11-03'] = 'local';
  assert.deepEqual(resolveReconciliation(b, l, r, selected).days['2026-11-02'], ['idea-a']);
  const reordered = base(); reordered.days['2026-11-01'].reverse();
  assert.equal(reconciliationChanges(b, reordered, b)[0].key, 'days/2026-11-01');
});
test('date and city changes cannot silently remove incompatible references', () => {
  const b = base(), l = base(), r = base(); l.endDate = '2026-11-01'; r.days['2026-11-02'] = r.days['2026-11-01']; delete r.days['2026-11-01'];
  assert.throws(() => resolveReconciliation(b, l, r, choices(reconciliationChanges(b, l, r))));
});
test('optional field deletion is retained', () => {
  const b = base(), l = base(), r = base(); delete l.activities[0].durationMinutes;
  assert.equal(resolveReconciliation(b, l, r, choices(reconciliationChanges(b, l, r))).activities[0].durationMinutes, undefined);
});
test('recovery round trips safe board and base without credentials or unsubmitted form fields', () => {
  const b = base(), l = base(); l.title = 'Reviewed draft';
  const raw = serializeRecovery(l, b, 4, 'room-a'); assert.deepEqual(parseRecovery(raw, 'room-a').state, l);
  const local = serializeRecovery(l, null, 0); assert.equal(parseRecovery(local).base, null);
  assert.throws(() => parseRecovery(raw, 'room-b'));
  const envelope = JSON.parse(raw); envelope.token = 'invented-capability'; assert.throws(() => parseRecovery(JSON.stringify(envelope), 'room-a'));
  delete envelope.token; envelope.draftActivity = { title: 'Unsubmitted' }; assert.throws(() => parseRecovery(JSON.stringify(envelope), 'room-a'));
});
test('recovery rejects malformed, unsupported, private-shaped, missing base and oversized input', () => {
  assert.throws(() => parseRecovery('{'));
  const l = base(); l.activities[0].notes = 'seat number'; assert.throws(() => serializeRecovery(l, base(), 1, 'room-a'));
  assert.throws(() => serializeRecovery(base(), null, 1, 'room-a'));
  assert.throws(() => serializeRecovery(base(), base(), 0));
  assert.throws(() => parseRecovery(' '.repeat(600001)));
  const envelope = JSON.parse(serializeRecovery(base(), base(), 1, 'room-a')); envelope.state.activities[0].email = 'invented@example.test';
  assert.throws(() => parseRecovery(JSON.stringify(envelope), 'room-a'));
});
