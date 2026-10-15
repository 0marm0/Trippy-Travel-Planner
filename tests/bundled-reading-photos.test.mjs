import test from 'node:test';
import assert from 'node:assert/strict';
import {embedBundledReadingPhotos,isBundledTripImage} from '../src/lib/bundled-reading-photos.ts';
const generic='Bundled photos could not be included. No reading copy was created.';
function webp(size=30){const b=new Uint8Array(size);b.set(new TextEncoder().encode('RIFF'));new DataView(b.buffer).setUint32(4,size-8,true);b.set(new TextEncoder().encode('WEBPVP8 '),8);new DataView(b.buffer).setUint32(16,size-20,true);b.set([0x9d,1,0x2a],23);b[26]=1;b[28]=1;return b;}
const response=(bytes=webp(),headers={})=>new Response(bytes,{headers:{'content-type':'image/webp',...headers}});
const rejects=async(action)=>assert.rejects(action,error=>error.message===generic);
test('bundled path allowlist is narrow and origin restricted',async()=>{
  for(const path of ['/media/a.webp','/guide-images/abcdef123456.webp'])assert.equal(isBundledTripImage(path),true);
  for(const path of ['/media/../a.webp','/media/a.webp?key=x','https://example.test/media/a.webp','//example.test/a.webp','/media/A.webp','/guide-images/short.webp'])assert.equal(isBundledTripImage(path),false);
  for(const origin of ['http://example.test','https://user:pass@example.test','https://example.test/path','https://example.test?x=y','file:///tmp/test'])await rejects(()=>embedBundledReadingPhotos('<img src="/media/a.webp">',origin,()=>{throw Error('must not fetch');}));
  for(const origin of ['http://localhost:3000','http://127.0.0.1:3000','http://[::1]:3000','https://example.test'])assert.match(await embedBundledReadingPhotos('<img src="/media/a.webp">',origin,async()=>response()),/data:image\/webp;base64,/);
});
test('deduplicates src and fallback, rewrites image attributes only and omits credentials and redirects',async()=>{
  const html=`<p>/media/a.webp</p><div title="<img src='/media/not-an-image.webp'>"></div><!-- <img src="/media/a.webp"> --><script>const image='<img src="/media/a.webp">'</script><img alt="/media/a.webp" data-src="/media/a.webp" src='/media/a.webp' data-fallback=/media/a.webp><IMG SRC="/guide-images/abcdef123456.webp">`;
  const calls=[];const output=await embedBundledReadingPhotos(html,'https://example.test',async(url,options)=>{calls.push({url,options});return response();});
  assert.equal(calls.length,2);assert.equal(calls[0].url,'https://example.test/media/a.webp');
  for(const {options} of calls){assert.equal(options.credentials,'omit');assert.equal(options.redirect,'error');assert.ok(options.signal instanceof AbortSignal);}
  assert.equal((output.match(/data:image\/webp;base64,/g)||[]).length,3);assert.ok(output.includes('<p>/media/a.webp</p>'));assert.ok(output.includes('data-src="/media/a.webp"'));assert.ok(output.includes('alt="/media/a.webp"'));assert.ok(output.includes("const image='<img src=\"/media/a.webp\">'"));assert.equal(html.includes('base64'),false);
  const embedded=output.match(/base64,([^"']+)/)[1];assert.deepEqual(new Uint8Array(Buffer.from(embedded,'base64')),webp());
});
test('remote and existing data images remain unchanged without fetching',async()=>{
  const html='<img src="https://example.test/photo.webp"><img src="data:image/webp;base64,AAAA"><a href="/media/a.webp">photo</a>';
  assert.equal(await embedBundledReadingPhotos(html,'https://example.test',()=>{throw Error('unexpected');}),html);
});
test('bad response, signatures, size and truncated chunks fail generically',async()=>{
  for(const fetcher of [async()=>new Response('missing',{status:404}),async()=>response(webp(),{'content-type':'text/html'}),async()=>response(webp(),{'content-length':String(8*1024*1024+1)}),async()=>response(new Uint8Array(30)),async()=>response(webp().subarray(0,29)),async()=>{throw Error('sensitive provider error');},async()=>response(new Uint8Array(8*1024*1024+2))])await rejects(()=>embedBundledReadingPhotos('<img src="/media/a.webp">','https://example.test',fetcher));
});
test('streaming bytes are bounded independently from content length and aggregate asset bytes',async()=>{
  let canceled=false;const fetcher=async()=>new Response(new ReadableStream({start(controller){for(let i=0;i<9;i++)controller.enqueue(new Uint8Array(1024*1024));},cancel(){canceled=true;}}),{headers:{'content-type':'image/webp','content-length':'30'}});
  await rejects(()=>embedBundledReadingPhotos('<img src="/media/a.webp">','https://example.test',fetcher));assert.equal(canceled,true);
  const html=Array.from({length:7},(_,i)=>`<img src="/media/asset-${i}.webp">`).join('');
  await rejects(()=>embedBundledReadingPhotos(html,'https://example.test',async()=>response(webp(8*1024*1024))));
});
test('asset count, HTML and replacement size bounds fail all-or-nothing',async()=>{
  await rejects(()=>embedBundledReadingPhotos('x'.repeat(16*1024*1024+1),'https://example.test',async()=>response()));
  let calls=0;await rejects(()=>embedBundledReadingPhotos(Array.from({length:601},(_,i)=>`<img src="/media/asset-${i}.webp">`).join(''),'https://example.test',async()=>{calls++;return response();}));assert.equal(calls,0);
  await rejects(()=>embedBundledReadingPhotos('<img src="/media/a.webp">'.repeat(10),'https://example.test',async()=>response(webp(8*1024*1024))));
});
test('abort before and during read is generic and never returns a partial copy',async()=>{
  const controller=new AbortController();controller.abort();let calls=0;await rejects(()=>embedBundledReadingPhotos('<img src="/media/a.webp">','https://example.test',async()=>{calls++;return response();},controller.signal));assert.equal(calls,0);
  const mid=new AbortController();let signal;
  await rejects(()=>embedBundledReadingPhotos('<img src="/media/a.webp">','https://example.test',async(_url,options)=>{signal=options.signal;return new Response(new ReadableStream({start(){queueMicrotask(()=>mid.abort());}}),{headers:{'content-type':'image/webp'}});},mid.signal));assert.equal(signal.aborted,true);
});
test('concurrency stays at three and one failure aborts sibling work',async()=>{
  let active=0,max=0;const html=Array.from({length:8},(_,i)=>`<img src="/media/asset-${i}.webp">`).join('');
  await embedBundledReadingPhotos(html,'https://example.test',async()=>{active++;max=Math.max(max,active);await new Promise(resolve=>setTimeout(resolve,2));active--;return response();});assert.equal(max,3);
  const signals=[];await rejects(()=>embedBundledReadingPhotos(html,'https://example.test',async(_url,options)=>{signals.push(options.signal);if(signals.length===1)throw Error('failure');return new Promise(()=>{});}));assert.ok(signals.slice(1).every(signal=>signal.aborted));
});
test('per-asset deadline rejects even when a fetch ignores its abort signal',async(t)=>{
  t.mock.timers.enable({apis:['setTimeout']});
  let signal;const pending=embedBundledReadingPhotos('<img src="/media/a.webp">','https://example.test',async(_url,options)=>{signal=options.signal;return new Promise(()=>{});});
  const rejected=rejects(()=>pending);t.mock.timers.tick(10000);await rejected;assert.equal(signal.aborted,true);
});
test('a RIFF label or extended header without an image chunk is not an image',async()=>{
  const bytes=new Uint8Array(30);bytes.set(new TextEncoder().encode('RIFF'));new DataView(bytes.buffer).setUint32(4,22,true);bytes.set(new TextEncoder().encode('WEBPVP8X'),8);new DataView(bytes.buffer).setUint32(16,10,true);
  await rejects(()=>embedBundledReadingPhotos('<img src="/media/a.webp">','https://example.test',async()=>response(bytes)));
});
