/** Bundled assets only. This allowlist is shared with reading-copy exports. */
export function isBundledTripImage(value: string): boolean {
  return /^\/guide-images\/[a-f0-9]{12,64}\.webp$/.test(value) || /^\/media\/[a-z0-9][a-z0-9-]*\.webp$/.test(value);
}
const MAX_ASSET = 8 * 1024 * 1024, MAX_TOTAL = 48 * 1024 * 1024;
const MAX_HTML = 16 * 1024 * 1024, MAX_RESULT = 96 * 1024 * 1024;
const failure = () => new Error('Bundled photos could not be included. No reading copy was created.');
// Skip comments and raw-text elements: a textual example of an image is not an image.
const imageTokens = () => /<!--[\s\S]*?(?:-->|$)|<(script|style|textarea|title|xmp|iframe|noembed|noframes)\b(?:[^"'<>]|"[^"]*"|'[^']*')*>[\s\S]*?(?:<\/\1\s*>|$)|<plaintext\b[\s\S]*$|<[a-z][a-z0-9:-]*\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi;
const attributes = () => /(\s)([^\s"'<>/=]+)(\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
function imagePaths(tag: string): string[] {
  return [...tag.matchAll(attributes())].filter(match => ['src','data-fallback'].includes(match[2].toLowerCase())).map(match => match[4] ?? match[5] ?? match[6]).filter(isBundledTripImage);
}
function originFor(value: string): string {
  const origin = new URL(value);
  const loopback = origin.hostname === 'localhost' || origin.hostname === '[::1]' || /^127\.\d+\.\d+\.\d+$/.test(origin.hostname);
  if (origin.username || origin.password || origin.search || origin.hash || origin.pathname !== '/' || !(origin.protocol === 'https:' || origin.protocol === 'http:' && loopback)) throw failure();
  return origin.origin;
}
function validWebp(bytes: Uint8Array): boolean {
  const word = (offset: number) => String.fromCharCode(...bytes.subarray(offset,offset+4));
  if (bytes.length < 20 || word(0) !== 'RIFF' || word(8) !== 'WEBP') return false;
  const view = new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  if (view.getUint32(4,true) + 8 !== bytes.length) return false;
  let image = false;
  for(let offset=12;offset<bytes.length;) {
    if(offset+8>bytes.length) return false;
    const kind=word(offset), size=view.getUint32(offset+4,true), data=offset+8;
    if(data+size+size%2>bytes.length) return false;
    if(kind==='VP8 ') {
      if(size<10 || word(data+3).slice(0,3)!=='\x9d\x01\x2a' || !(view.getUint16(data+6,true)&0x3fff) || !(view.getUint16(data+8,true)&0x3fff)) return false;
      image=true;
    } else if(kind==='VP8L') {
      if(size<5 || bytes[data]!==0x2f || (bytes[data+4]&0xe0)!==0) return false;
      image=true;
    } else if(kind==='VP8X' && (size!==10 || (bytes[data]&0xc1)!==0 || bytes[data+1]!==0 || bytes[data+2]!==0 || bytes[data+3]!==0)) return false;
    offset=data+size+size%2;
  }
  return image;

}
function base64(bytes: Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const parts: string[] = [];
  for (let start=0;start<bytes.length;start+=12288) {
    let part = '';
    for (let i=start;i<Math.min(start+12288,bytes.length);i+=3) {
      const a=bytes[i], b=bytes[i+1], c=bytes[i+2];
      part += alphabet[a>>2]+alphabet[((a&3)<<4)|((b??0)>>4)]+(i+1<bytes.length?alphabet[((b&15)<<2)|((c??0)>>6)]:'=')+(i+2<bytes.length?alphabet[c&63]:'=');
    }
    parts.push(part);
  }
  return parts.join('');
}

/** All-or-nothing browser-safe embedding; external and existing data images stay unchanged. */
export async function embedBundledReadingPhotos(html: string, appOrigin: string, fetcher: typeof fetch, signal?: AbortSignal): Promise<string> {
  const controllers = new Set<AbortController>();
  try {
    if (typeof html !== 'string' || html.length > MAX_HTML || signal?.aborted) throw failure();
    const origin = originFor(appOrigin);
    const paths = new Set<string>();
    for (const token of html.matchAll(imageTokens())) if (/^<img\b/i.test(token[0])) for (const path of imagePaths(token[0])) { paths.add(path); if(paths.size>600) throw failure(); }
    const pending = [...paths], embedded = new Map<string,string>();
    let next=0, total=0;
    const abortAll = () => { for(const controller of controllers) controller.abort(); };
    signal?.addEventListener('abort',abortAll,{once:true});
    try {
      await Promise.all(Array.from({length:Math.min(3,pending.length)},async()=>{
        while(next<pending.length) {
          if(signal?.aborted) throw failure();
          const path = pending[next++], controller = new AbortController();controllers.add(controller);
          let timer: ReturnType<typeof setTimeout> | undefined;
          let rejectAborted: (()=>void) | undefined;
          const deadline = new Promise<never>((_,reject)=>{ rejectAborted=()=>reject(failure()); timer=setTimeout(()=>{controller.abort();reject(failure());},10000); });
          controller.signal.addEventListener('abort',rejectAborted!,{once:true});
          let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
          try {
            const response = await Promise.race([fetcher(origin+path,{credentials:'omit',redirect:'error',signal:controller.signal}),deadline]);
            const length=response.headers.get('content-length');
            if(!response.ok || response.redirected || response.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='image/webp' || length!==null && (!/^\d+$/.test(length) || Number(length)>MAX_ASSET) || !response.body) throw failure();
            reader=response.body.getReader();const chunks:Uint8Array[]=[];let size=0;
            while(true) {
              const {value,done}=await Promise.race([reader.read(),deadline]);
              if(done) break;
              if(!(value instanceof Uint8Array)) throw failure();
              size+=value.byteLength;total+=value.byteLength;
              if(size>MAX_ASSET || total>MAX_TOTAL) throw failure();
              chunks.push(value);
            }
            const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
            if(length!==null && Number(length)!==size || !validWebp(bytes) || signal?.aborted) throw failure();
            embedded.set(path,'data:image/webp;base64,'+base64(bytes));
          } finally {
            if(timer!==undefined) clearTimeout(timer);
            controller.signal.removeEventListener('abort',rejectAborted!);
            controllers.delete(controller);
            if(reader) { void reader.cancel().catch(()=>{});reader.releaseLock(); }
          }
        }
      }));
    } finally { signal?.removeEventListener('abort',abortAll); }
    if(signal?.aborted) throw failure();
    let resultSize=html.length;
    const result=html.replace(imageTokens(),token=>{
      if(!/^<img\b/i.test(token)) return token;
      return token.replace(attributes(),(whole:string,space:string,name:string,equal:string,double:string|undefined,single:string|undefined,unquoted:string|undefined)=>{
        if(!['src','data-fallback'].includes(name.toLowerCase())) return whole;
        const data=embedded.get(double??single??unquoted??'');if(!data) return whole;
        const replacement=`${space}${name}${equal}"${data}"`;resultSize+=replacement.length-whole.length;
        if(resultSize>MAX_RESULT) throw failure();return replacement;
      });
    });
    return result;
  } catch { for(const controller of controllers) controller.abort();throw failure(); }
}
