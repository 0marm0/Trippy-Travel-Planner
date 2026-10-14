import type { TripExportSnapshot } from './trip-exports.ts';
import { validateExportPreviewSnapshot, type ExportPreviewOptions } from './export-preview.ts';

export function downloadReadingFile(filename: string, content: string | Blob, type = 'text/html;charset=utf-8') {
  const url=URL.createObjectURL(typeof content==='string'?new Blob([content],{type}):content);
  const link=document.createElement('a');link.href=url;link.download=filename.replace(/[^a-zA-Z0-9_.-]/g,'-');link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function downloadReadingPdf(name:string,snapshot:TripExportSnapshot,options:ExportPreviewOptions) {
  if(validateExportPreviewSnapshot(snapshot).length)throw new Error('Validate the full reading copy before exporting.');
  const response=await fetch('/api/exports/trip-pdf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({snapshot,...options})});
  if(!response.ok)throw new Error('The PDF server could not prepare this reading copy. Try a compact scope.');
  downloadReadingFile(`${name}-${options.scope}-${options.visual?'visual':'compact'}.pdf`,await response.blob());
}
