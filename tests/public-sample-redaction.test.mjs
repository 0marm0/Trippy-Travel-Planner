import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizePublicSample } from '../scripts/public-sample-redaction.mjs';
test('sample sanitizer removes secret fields, contacts and sensitive source URLs', () => {
  const safe = sanitizePublicSample({ apiKey: 'placeholder', accessToken: 'placeholder', confirmationRef: 'FAKE123', personalEmail: 'person@example.com', nested: { description: 'Booking reference FAKE123; seat 12A; person@example.com', url: 'https://example.com/receipt?ref=FAKE123' }, image: 'https://images.example.com/photo.jpg?w=600', ordinary: 'UA109 flight on 2027-04-01' });
  assert.deepEqual(Object.keys(safe), ['nested', 'image', 'ordinary']);
  assert.equal(safe.nested.url, '');
  assert.doesNotMatch(safe.nested.description, /FAKE123|12A|person@example/);
  assert.match(safe.image, /w=600/); assert.match(safe.ordinary, /UA109/);
});
