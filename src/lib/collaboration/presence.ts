import type { CollaborationRole } from './schema.ts';
export type PresenceSummary = { revision: number; presence: Array<{ id: string; role: CollaborationRole }>; leaseSeconds: 30 };
/** Strict stream decoding rejects board content, access values and arbitrary fields. */
export function validatePresenceSummary(input: unknown): PresenceSummary {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid presence summary.');
  const value = input as PresenceSummary;
  if (Object.keys(value).sort().join(',') !== 'leaseSeconds,presence,revision' || !Number.isSafeInteger(value.revision) || value.revision < 1 || value.leaseSeconds !== 30 || !Array.isArray(value.presence) || value.presence.length > 101) throw new Error('Invalid presence summary.');
  const ids = new Set<string>();
  for (const item of value.presence) {
    if (!item || typeof item !== 'object' || Object.keys(item).sort().join(',') !== 'id,role' || typeof item.id !== 'string' || !/^access-[a-f0-9-]{36}$/.test(item.id) || !['owner', 'editor', 'viewer'].includes(item.role) || ids.has(item.id)) throw new Error('Invalid presence summary.');
    ids.add(item.id);
  }
  return value;
}
/** Fetch streams use Authorization headers. EventSource would put capabilities in URLs. */
export async function consumePresenceStream(response: Response, onSummary: (summary: PresenceSummary) => void, signal: AbortSignal): Promise<void> {
  if (!response.ok || !response.headers.get('content-type')?.startsWith('text/event-stream') || !response.body) throw new Error('Live notifications unavailable.');
  const reader = response.body.getReader(), decoder = new TextDecoder(); let buffer = '';
  const abort = () => { void reader.cancel().catch(() => undefined); };
  signal.addEventListener('abort', abort, { once: true });
  try {
    while (!signal.aborted) {
      const part = await reader.read(); if (part.done || signal.aborted) return;
      buffer += decoder.decode(part.value, { stream: true });
      if (buffer.length > 32000) throw new Error('Live notification exceeds limits.');
      let boundary: number;
      while ((boundary = buffer.indexOf('\n\n')) !== -1) {
        const frame = buffer.slice(0, boundary); buffer = buffer.slice(boundary + 2);
        const event = frame.split('\n').find(line => line.startsWith('event: '))?.slice(7);
        if (event === 'stopped') throw new Error('Live notifications stopped.');
        if (event !== 'update') continue;
        const data = frame.split('\n').find(line => line.startsWith('data: '))?.slice(6);
        if (!data) throw new Error('Invalid live notification.');
        if (!signal.aborted) onSummary(validatePresenceSummary(JSON.parse(data)));
      }
    }
  } finally { signal.removeEventListener('abort', abort); await reader.cancel().catch(() => undefined); reader.releaseLock(); }
}
