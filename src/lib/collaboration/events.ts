import { collaborationHeaders } from './http.ts';
import { validatePresenceSummary, type PresenceSummary } from './presence.ts';
/** Every tick reauthorizes in the store transaction. No room state or access values enter the stream. */
export async function collaborationEventResponse(request: Request, read: () => Promise<PresenceSummary>, options: { intervalMs?: number; checks?: number } = {}): Promise<Response> {
  const interval = Math.max(1, Math.min(1000, options.intervalMs ?? 1000)), checks = Math.max(1, Math.min(25, options.checks ?? 25));
  const abort = new AbortController(); let cancelled = false;
  const onAbort = () => abort.abort(); request.signal.addEventListener('abort', onAbort, { once: true }); if (request.signal.aborted) abort.abort();
  const deadline = setTimeout(() => abort.abort(), 25000);
  const encoder = new TextEncoder();
  const wait = () => new Promise<void>(resolve => {
    if (abort.signal.aborted) { resolve(); return; }
    const finish = () => { clearTimeout(timer); abort.signal.removeEventListener('abort', finish); resolve(); };
    const timer = setTimeout(finish, interval); abort.signal.addEventListener('abort', finish, { once: true });
  });
  const nextSummary = () => new Promise<PresenceSummary>((resolve, reject) => {
    const stopped = () => reject(new Error('Stream ended.'));
    abort.signal.addEventListener('abort', stopped, { once: true });
    if (abort.signal.aborted) { abort.signal.removeEventListener('abort', stopped); stopped(); return; }
    read().then(resolve, reject).finally(() => abort.signal.removeEventListener('abort', stopped));
  });
  let initial: PresenceSummary;
  try { initial = validatePresenceSummary(await nextSummary()); }
  catch (error) { clearTimeout(deadline); request.signal.removeEventListener('abort', onAbort); throw error; }
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let previous = '';
      try {
        for (let index = 0; index < checks && !abort.signal.aborted; index++) {
          const value = index === 0 ? initial : validatePresenceSummary(await nextSummary());
          if (abort.signal.aborted) break;
          const serialized = JSON.stringify(value);
          controller.enqueue(encoder.encode(serialized === previous ? ': keep-alive\n\n' : `event: update\ndata: ${serialized}\n\n`)); previous = serialized;
          if (index + 1 < checks) await wait();
        }
      } catch {
        if (!abort.signal.aborted && !cancelled) controller.enqueue(encoder.encode('event: stopped\ndata: {"reason":"access-or-storage-unavailable"}\n\n'));
      } finally {
        clearTimeout(deadline); request.signal.removeEventListener('abort', onAbort);
        if (!cancelled) controller.close();
      }
    },
    cancel() { cancelled = true; abort.abort(); },
  });
  return new Response(stream, { headers: { ...collaborationHeaders, 'Content-Type': 'text/event-stream', 'X-Accel-Buffering': 'no' } });
}
