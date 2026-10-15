import {embedBundledReadingPhotos} from './bundled-reading-photos.ts';
import type { TripExportSnapshot } from './trip-exports.ts';
import { validateExportPreviewSnapshot, type ExportPreviewOptions } from './export-preview.ts';

export async function downloadReadingFile(filename: string, content: string | Blob, type = 'text/html;charset=utf-8') {
  const ready=typeof content==='string' && type.startsWith('text/html') ? await embedBundledReadingPhotos(content,window.location.origin,fetch) : content;
  const url=URL.createObjectURL(typeof ready==='string'?new Blob([ready],{type}):ready);
  const link=document.createElement('a');link.href=url;link.download=filename.replace(/[^a-zA-Z0-9_.-]/g,'-');link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function downloadReadingPdf(name:string,snapshot:TripExportSnapshot,options:ExportPreviewOptions) {
  if(validateExportPreviewSnapshot(snapshot).length)throw new Error('Validate the full reading copy before exporting.');
  const response=await fetch('/api/exports/trip-pdf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({snapshot,scope:options.scope,visual:options.visual,theme:options.theme})});
  if(!response.ok)throw new Error('The PDF server could not prepare this reading copy. Try a compact scope.');
  await downloadReadingFile(`${name}-${options.scope}-${options.visual?'visual':'compact'}.pdf`,await response.blob());
}
