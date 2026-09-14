import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

import { fetchGmailMessages, normalizeGmailMessagePayload } from '../src/lib/imports/gmail/client.ts';
import { equalState, openPrivatePayload, sealPrivatePayload } from '../src/lib/imports/gmail/crypto.ts';
import { isSameOriginMutation, readBoundedJson } from '../src/lib/imports/gmail/http.ts';
import { buildNarrowTravelQuery, GmailPreviewInputError, parseGmailPreviewRequest } from '../src/lib/imports/gmail/input.ts';
import { createOAuthFlow, exchangeAuthorizationCode, GMAIL_READONLY_SCOPE } from '../src/lib/imports/gmail/oauth.ts';
import { buildImportCandidates } from '../src/lib/imports/gmail/parser.ts';
import { containsForbiddenMailData, redactPrivateMailText } from '../src/lib/imports/gmail/redaction.ts';

const sessionSecret = 'x'.repeat(48);

test('encrypted cookie payloads are authenticated, purpose-bound, and do not expose plaintext', () => {
  const payload = { access: ['private', 'credential'].join('-'), expiresAt: 12345 };
  const sealed = sealPrivatePayload(payload, sessionSecret, 'test-session');
  assert.equal(sealed.includes(payload.access), false);
  assert.deepEqual(openPrivatePayload(sealed, sessionSecret, 'test-session'), payload);
  assert.equal(openPrivatePayload(sealed, 'y'.repeat(48), 'test-session'), null);
  assert.equal(openPrivatePayload(sealed, sessionSecret, 'different-purpose'), null);
  const tamperedParts = sealed.split('.');
  const tamperedCiphertext = Buffer.from(tamperedParts[2], 'base64url');
  tamperedCiphertext[0] ^= 1;
  tamperedParts[2] = tamperedCiphertext.toString('base64url');
  assert.equal(openPrivatePayload(tamperedParts.join('.'), sessionSecret, 'test-session'), null);
  assert.equal(equalState('same-value', 'same-value'), true);
  assert.equal(equalState('same-value', 'other-value'), false);
});

test('OAuth authorization uses exact read-only scope, state, and S256 PKCE without offline access', () => {
  const config = {
    clientId: 'placeholder-client-id',
    clientSecret: 'placeholder-client-secret',
    sessionSecret,
    baseUrl: new URL('http://localhost:3000'),
    redirectUri: 'http://localhost:3000/api/integrations/gmail/callback',
  };
  const { authorizationUrl, flow } = createOAuthFlow(config, 1_000);
  const url = new URL(authorizationUrl);
  assert.equal(url.searchParams.get('scope'), GMAIL_READONLY_SCOPE);
  assert.equal(url.searchParams.get('state'), flow.state);
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(url.searchParams.get('access_type'), 'online');
  assert.equal(url.searchParams.has('include_granted_scopes'), false);
  assert.equal(url.searchParams.get('code_challenge'), createHash('sha256').update(flow.verifier).digest('base64url'));
  assert.equal(flow.expiresAt, 601_000);
});

test('travel queries are bounded and cannot inject Gmail search operators', () => {
  const parsed = parseGmailPreviewRequest({ searchTerm: 'Paris museum', after: '2026-09-01', before: '2026-10-01', maxMessages: 5 });
  const query = buildNarrowTravelQuery(parsed);
  assert.match(query, /^\{subject:reservation/);
  assert.match(query, /after:2026\/09\/01/);
  assert.match(query, /before:2026\/10\/01/);
  assert.match(query, /"Paris museum"$/);
  assert.throws(() => parseGmailPreviewRequest({ searchTerm: 'from:private' }), GmailPreviewInputError);
  assert.throws(() => parseGmailPreviewRequest({ maxMessages: 21 }), GmailPreviewInputError);
  assert.throws(() => parseGmailPreviewRequest({ after: '2026-10-01', before: '2026-09-01' }), GmailPreviewInputError);
});

test('same-origin JSON gate rejects cross-site and non-JSON requests, and request bodies are capped', async () => {
  const config = { baseUrl: new URL('https://trippy.example') };
  assert.equal(isSameOriginMutation(new Request('https://trippy.example/api', {
    method: 'POST', headers: { Origin: 'https://trippy.example', 'Content-Type': 'application/json' }, body: '{}',
  }), config), true);
  assert.equal(isSameOriginMutation(new Request('https://trippy.example/api', {
    method: 'POST', headers: { Origin: 'https://other.example', 'Content-Type': 'application/json' }, body: '{}',
  }), config), false);
  assert.equal(isSameOriginMutation(new Request('https://trippy.example/api', {
    method: 'POST', headers: { Origin: 'https://trippy.example', 'Content-Type': 'text/plain' }, body: '{}',
  }), config), false);
  await assert.rejects(readBoundedJson(new Request('https://trippy.example/api', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: 'x'.repeat(17_000) }),
  })));
});

test('token exchange fails closed when the provider grants missing or additional scopes', async () => {
  const config = {
    clientId: 'placeholder-client-id', clientSecret: 'placeholder-client-secret', sessionSecret,
    baseUrl: new URL('http://localhost:3000'), redirectUri: 'http://localhost:3000/api/integrations/gmail/callback',
  };
  const tokenField = ['access', 'token'].join('_');
  const fetchWithScope = (scope) => async () => Response.json({ [tokenField]: 'not-a-credential', expires_in: 3_600, scope });
  await assert.rejects(exchangeAuthorizationCode(config, 'placeholder-code', 'placeholder-verifier', fetchWithScope('')));
  await assert.rejects(exchangeAuthorizationCode(config, 'placeholder-code', 'placeholder-verifier', fetchWithScope(`${GMAIL_READONLY_SCOPE} openid`)));
  const session = await exchangeAuthorizationCode(config, 'placeholder-code', 'placeholder-verifier', fetchWithScope(GMAIL_READONLY_SCOPE));
  assert.equal(session.scope, GMAIL_READONLY_SCOPE);
});

test('mocked Gmail list/detail responses are parsed in memory and normalized to redacted review candidates', async () => {
  const privateCode = ['ZX', '91', 'QP'].join('');
  const privateAddress = ['traveler', 'example.test'].join('@');
  const privateLink = ['https://mail.', 'google.com/mail/u/0/#inbox/', 'private-source'].join('');
  const rawText = `Flight UA109 from SFO to JFK on September 22, 2026. Confirmation number: ${privateCode}. Seat 12A. ${privateAddress} ${privateLink}`;
  const detailPayload = {
    payload: {
      mimeType: 'multipart/alternative',
      headers: [
        { name: 'Subject', value: `United flight confirmation number: ${privateCode}` },
        { name: 'Date', value: 'Tue, 01 Sep 2026 12:00:00 +0000' },
      ],
      parts: [{ mimeType: 'text/plain', body: { data: Buffer.from(rawText).toString('base64url') } }],
    },
  };
  const calls = [];
  const fetchMock = async (input, init) => {
    const url = new URL(input);
    calls.push({ url, authorization: init.headers.Authorization });
    return url.pathname.endsWith('/messages')
      ? Response.json({ messages: [{ id: 'private-source-id', threadId: 'private-thread-id' }] })
      : Response.json(detailPayload);
  };
  const credentialPlaceholder = ['not', 'a', 'credential'].join('-');
  const messages = await fetchGmailMessages(credentialPlaceholder, 'newer_than:1y subject:flight', 5, fetchMock);
  assert.equal(messages.length, 1);
  assert.equal(messages[0].text, rawText);
  assert.equal(calls.length, 2);
  assert.ok(calls.every((call) => call.authorization === `Bearer ${credentialPlaceholder}`));

  const candidates = buildImportCandidates(messages, [], sessionSecret);
  assert.equal(candidates.length, 1);
  assert.deepEqual(candidates[0], {
    id: candidates[0].id,
    kind: 'flight',
    title: 'Flight booking candidate',
    provider: 'United Airlines',
    startDate: '2026-09-22',
    endDate: null,
    originCode: 'SFO',
    destinationCode: 'JFK',
    flightNumber: 'UA109',
    suggestedBookingState: 'missing',
    confidence: 'high',
    confidenceReasons: ['travel type recognized', 'travel date recognized', 'route recognized', 'provider recognized'],
    duplicate: false,
    conflicts: [],
  });
  const serialized = JSON.stringify(candidates);
  assert.equal(serialized.includes(privateCode), false);
  assert.equal(serialized.includes(privateAddress), false);
  assert.equal(serialized.includes(privateLink), false);
  assert.equal(serialized.includes('private-source-id'), false);
  assert.equal(containsForbiddenMailData(candidates), false);
});

test('candidate deduplication and conflict fields compare only normalized trip facts', () => {
  const message = {
    privateSourceId: 'source-a',
    subject: 'Lufthansa flight itinerary',
    sentAt: '',
    text: 'Flight LH400 from FRA to JFK on 2026-09-22',
  };
  const duplicate = buildImportCandidates([message, { ...message, privateSourceId: 'source-b' }], [{
    kind: 'flight', startDate: '2026-09-22', originCode: 'FRA', destinationCode: 'JFK', provider: 'Lufthansa',
  }], sessionSecret);
  assert.equal(duplicate.length, 1);
  assert.equal(duplicate[0].duplicate, true);
  assert.deepEqual(duplicate[0].conflicts, []);

  const conflict = buildImportCandidates([message], [{
    kind: 'flight', startDate: '2026-09-23', originCode: 'FRA', destinationCode: 'JFK', provider: 'Lufthansa',
  }], sessionSecret)[0];
  assert.equal(conflict.suggestedBookingState, 'conflict');
  assert.deepEqual(conflict.conflicts, [{ field: 'date', existingIndex: 0 }]);
});

test('redaction removes private identifiers and malformed Gmail payloads fail closed', () => {
  const privateCode = ['PRIVATE', '42'].join('');
  const privateAddress = ['name', 'example.test'].join('@');
  const text = `Confirmation code: ${privateCode}; ${privateAddress}; Seat 19C`;
  const redacted = redactPrivateMailText(text);
  assert.equal(redacted.includes(privateCode), false);
  assert.equal(redacted.includes(privateAddress), false);
  assert.equal(redacted.includes('19C'), false);
  assert.equal(normalizeGmailMessagePayload('source', { payload: { headers: [], parts: [] } }), null);
});
