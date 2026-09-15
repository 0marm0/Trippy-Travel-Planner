import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildTrippyWorkspaceBundle,
  parseTrippyUpdateFile,
  parseTrippyUpdateText,
  reviewTrippyUpdate,
  sanitizeTrippyBundleText,
  serializeTrippyWorkspaceBundle,
  TRIPPY_BUNDLE_MAX_BYTES,
} from '../src/lib/trippy-bundle.ts';

const scope = {
  tripId: 'europe-2026',
  dates: ['2026-09-22', '2026-09-23'],
  activityIds: ['museum', 'gate'],
  transportOptions: { 'leg-1': ['train', 'car'] },
  hotelOptions: { berlin: ['hotel-1', 'hotel-2'] },
};

const current = {
  assignments: { '2026-09-22': ['museum'], '2026-09-23': [] },
  activityPriority: { museum: 'should' },
  savedActivities: ['museum'],
  selectedTransport: { 'leg-1': 'train' },
  savedHotels: ['hotel-1'],
  selectedHotel: { berlin: 'hotel-1' },
  researchEvidence: [],
};

function bundle(changes, extra = {}) {
  return {
    format: 'trippy-workspace-update',
    version: 1,
    kind: 'update',
    bundleId: 'agent-pass-1',
    tripId: 'europe-2026',
    createdAt: '2026-09-14T12:30:00.000Z',
    summary: 'A safer day plan',
    changes,
    ...extra,
  };
}

test('parses supported decisions and applies only identifiers in the current trip scope', () => {
  const parsed = parseTrippyUpdateText(JSON.stringify(bundle({
    assignments: { '2026-09-22': ['gate', 'unknown-activity'] },
    activityPriority: { museum: 'must', gate: 'could' },
    savedActivities: ['gate', 'unknown-activity'],
    selectedTransport: { 'leg-1': 'car', 'unknown-leg': 'train' },
    savedHotels: ['hotel-2', 'hotel-elsewhere'],
    selectedHotel: { berlin: 'hotel-2', paris: 'hotel-elsewhere' },
  })));
  assert.equal(parsed.ok, true);
  const review = reviewTrippyUpdate(parsed.bundle, current, scope);
  assert.deepEqual(review.nextState.assignments['2026-09-22'], ['gate']);
  assert.equal(review.nextState.activityPriority.museum, 'must');
  assert.equal(review.nextState.activityPriority.gate, 'could');
  assert.deepEqual(review.nextState.savedActivities, ['gate']);
  assert.equal(review.nextState.selectedTransport['leg-1'], 'car');
  assert.equal(review.nextState.selectedTransport['unknown-leg'], undefined);
  assert.deepEqual(review.nextState.savedHotels, ['hotel-2']);
  assert.equal(review.nextState.selectedHotel.berlin, 'hotel-2');
  assert.equal(review.nextState.selectedHotel.paris, undefined);
  assert.ok(review.diff.length >= 6);
  assert.ok(review.rejectedChangeCount >= 4);
  for (const untrustedId of ['hotel-elsewhere', 'unknown-leg', 'unknown-activity']) assert.equal(JSON.stringify(review.issues).includes(untrustedId), false);
});

test('sanitizes hostile and private prose and drops unsupported fields before review', () => {
  const raw = bundle({
    selectedTransport: { 'leg-1': 'car' },
    confirmationRef: 'ABC123',
    researchEvidence: [{
      id: 'fare-check-1',
      subjectKind: 'transport',
      subjectId: 'leg-1',
      kind: 'quote',
      source: 'Agent <b onclick="steal()">research</b>',
      checkedAt: '2026-09-14T12:00:00Z',
      summary: 'See https://tracker.example/x; contact person@example.com; token=very-secret',
      limitations: ['<script>alert(1)</script> Inventory changes'],
      url: 'https://tracker.example/private',
    }],
  }, {
    summary: '<img src=x onerror=steal()> Confirmation number ABC123',
    providerToken: 'do-not-keep-me',
    bookings: [{ status: 'confirmed', confirmationRef: 'ABC123' }],
  });
  const parsed = parseTrippyUpdateText(JSON.stringify(raw));
  assert.equal(parsed.ok, true);
  assert.ok(parsed.issues.filter((entry) => entry.path.endsWith('.[unsupported]')).length >= 3);
  const serialized = JSON.stringify(parsed.bundle);
  for (const forbidden of ['ABC123', 'person@example.com', 'tracker.example', 'very-secret', '<img', '<script', 'providerToken', 'confirmationRef', 'bookings', 'onclick']) {
    assert.equal(serialized.includes(forbidden), false, forbidden);
  }
  assert.equal(parsed.bundle.changes.researchEvidence[0].source, 'Agent research');
  assert.match(parsed.bundle.changes.researchEvidence[0].summary, /removed/);
});

test('rejects malformed, oversized, and structurally invalid bundles without echoing values', () => {
  const malformed = parseTrippyUpdateText('{"token":"secret"');
  assert.deepEqual(malformed, { ok: false, issues: [{ path: '$', message: 'The file is not valid JSON.', severity: 'error' }] });
  const invalid = parseTrippyUpdateText(JSON.stringify(bundle({ activityPriority: { museum: 'confirmed' } })));
  assert.equal(invalid.ok, false);
  assert.equal(JSON.stringify(invalid.issues).includes('confirmed'), false);
  const oversized = parseTrippyUpdateText(' '.repeat(TRIPPY_BUNDLE_MAX_BYTES + 1));
  assert.equal(oversized.ok, false);
  assert.match(oversized.issues[0].message, /192 KB/);
});

test('file reader accepts only bounded JSON or .trippy files', async () => {
  const validBlob = new Blob([JSON.stringify(bundle({ savedActivities: ['gate'] }))], { type: 'application/json' });
  Object.defineProperty(validBlob, 'name', { value: 'agent-update.trippy' });
  assert.equal((await parseTrippyUpdateFile(validBlob)).ok, true);
  const wrongExtension = new Blob(['{}'], { type: 'application/json' });
  Object.defineProperty(wrongExtension, 'name', { value: 'agent-update.html' });
  const rejected = await parseTrippyUpdateFile(wrongExtension);
  assert.equal(rejected.ok, false);
  assert.match(rejected.issues[0].message, /.json or .trippy/);
});

test('exports a complete sanitized snapshot and excludes out-of-scope state', () => {
  const state = {
    ...current,
    assignments: { ...current.assignments, '2027-01-01': ['museum'], '2026-09-22': ['museum', 'not-in-trip'] },
    selectedTransport: { ...current.selectedTransport, 'bad-leg': 'bad-option' },
    researchEvidence: [{
      id: 'hotel-check-1', subjectKind: 'hotel', subjectId: 'hotel-1', kind: 'fact', checkedAt: '2026-09-14T12:00:00Z',
      source: 'Hotel site <em>listing</em>', summary: 'Contact private@example.com at https://example.com', limitations: ['No live inventory'],
    }],
  };
  const snapshot = buildTrippyWorkspaceBundle(state, { scope, bundleId: 'safe-snapshot', createdAt: '2026-09-14T13:00:00Z' });
  assert.equal(snapshot.kind, 'snapshot');
  assert.deepEqual(snapshot.changes.assignments['2026-09-22'], ['museum']);
  assert.equal(snapshot.changes.assignments['2027-01-01'], undefined);
  assert.equal(snapshot.changes.selectedTransport['bad-leg'], undefined);
  const serialized = serializeTrippyWorkspaceBundle(state, { scope, bundleId: 'safe-snapshot', createdAt: '2026-09-14T13:00:00Z' });
  for (const forbidden of ['private@example.com', 'https://example.com', '<em>', 'not-in-trip', 'bad-option']) assert.equal(serialized.includes(forbidden), false, forbidden);
  assert.match(serialized, /private detail removed/);
  assert.doesNotMatch(serialized, /booking|confirmed|confirmationRef/i);
});

test('text sanitizer removes active markup, links, contacts, and credential labels', () => {
  const sanitized = sanitizeTrippyBundleText('<a href="https://bad.example">Read</a> person@example.com API key: top-secret');
  assert.equal(sanitized.includes('<'), false);
  assert.equal(sanitized.includes('bad.example'), false);
  assert.equal(sanitized.includes('@'), false);
  assert.equal(sanitized.includes('top-secret'), false);
});
