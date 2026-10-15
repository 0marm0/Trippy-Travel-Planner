"use client";

import { useEffect, useState } from "react";
import DetailDrawer from "./detail-drawer";
import { Icon } from "./planner-icon";
import { selectExportDates } from "@/lib/export-date-selection";
import GlassSelect from "./glass-select";
import { renderTripHtml, sanitizeTripExportSnapshot, type TripExportSnapshot, type TripExportTheme } from "@/lib/trip-exports";
import { embedSandboxPreviewPhotos, maskSandboxLocalPhotos, type PreviewPhotoResult, buildExportPreviewSummary, sandboxExportPreviewHtml, validateExportPreviewSnapshot, EXPORT_PREVIEW_HTML_BUDGET, type ExportPreviewOptions } from "@/lib/export-preview";
import "./export-studio.css";

export type ExportStudioProps = {
  snapshot: TripExportSnapshot;
  close: () => void;
  renderHtml?: (options: ExportPreviewOptions) => string;
  downloadHtml: (html: string, options: ExportPreviewOptions) => void | Promise<void>;
  downloadPdf: (snapshot: TripExportSnapshot, options: ExportPreviewOptions) => Promise<void>;
  supportedThemes?: readonly TripExportTheme[];
};

export default function ExportStudio({ snapshot, close, renderHtml, downloadHtml, downloadPdf, supportedThemes = ["light", "dark"] }: ExportStudioProps) {
  const [scope, setScope] = useState<ExportPreviewOptions["scope"]>("all");
  const [visual, setVisual] = useState(true);
  const [theme, setTheme] = useState<TripExportTheme>(supportedThemes[0] || "light");
  const [loadImages, setLoadImages] = useState(false);
  const [limitDates,setLimitDates] = useState(false);
  const [fromDate,setFromDate] = useState(snapshot.start);
  const [toDate,setToDate] = useState(snapshot.end);
  const [busy, setBusy] = useState<"html" | "pdf" | null>(null);
  const [message, setMessage] = useState("");
  const [photoPreview, setPhotoPreview] = useState<{ source: string; result?: PreviewPhotoResult; failed?: boolean } | null>(null);
  const options: ExportPreviewOptions = { scope, visual, theme: supportedThemes.includes(theme) ? theme : supportedThemes[0] || "light", ...(limitDates?{dateRange:{start:fromDate,end:toDate}}:{}) };
  // Intentionally derive on every render: parent edits and evidence changes must invalidate the preview immediately.
  let html = "";
  let selectedSnapshot = snapshot;
  let selectionNote = "";
  let summary: ReturnType<typeof buildExportPreviewSummary> | undefined;
  let failure = "";
  try {
    const errors = validateExportPreviewSnapshot(snapshot);
    if (errors.length) throw new Error(errors.join(" "));
    const selected=selectExportDates(snapshot,options.dateRange);
    selectedSnapshot=selected.snapshot;
    selectionNote=limitDates?`${selected.omittedDays} days, ${selected.omittedTransport} movements and ${selected.omittedBookings} booking records outside this window are excluded. Overlapping stays keep their original dates; city guides and windows are context.`:"The complete trip, with your current planning decisions.";
    html = renderHtml ? renderHtml(options) : renderTripHtml(selectedSnapshot, options);
    summary = buildExportPreviewSummary(selectedSnapshot, options, html);
  } catch { failure = "Export blocked: a current record is incomplete, invalid or exceeds export limits. Resolve it in the workspace before downloading."; }

  useEffect(() => {
    if (!loadImages || !visual || !html || failure || summary?.overBudget) return;
    const controller = new AbortController();
    let current = true;
    void embedSandboxPreviewPhotos(html, window.location.origin, fetch, controller.signal).then(result => {
      if (current && !controller.signal.aborted) setPhotoPreview({ source: html, result });
    }).catch(() => { if (current && !controller.signal.aborted) setPhotoPreview({ source: html, failed: true }); });
    return () => { current = false; controller.abort(); };
  }, [loadImages, visual, html, failure, summary?.overBudget]);
  const currentPhotos = loadImages && photoPreview?.source === html ? photoPreview : null;
  const previewHtml = currentPhotos?.result?.html || maskSandboxLocalPhotos(html);

  async function download(format: "html" | "pdf") {
    setMessage("");
    setBusy(format);
    try {
      const errors = validateExportPreviewSnapshot(snapshot);
      if (errors.length) throw new Error("Invalid current snapshot");
      const selected=selectExportDates(snapshot,options.dateRange);
      const currentHtml = renderHtml ? renderHtml(options) : renderTripHtml(selected.snapshot, options);
      const current = buildExportPreviewSummary(selected.snapshot, options, currentHtml);
      if (current.overBudget) throw new Error("HTML exceeds preview budget");
      if (format === "html") await downloadHtml(currentHtml, options);
      else await downloadPdf(sanitizeTripExportSnapshot(selected.snapshot), options);
      setMessage(`${format.toUpperCase()} prepared from the current selection. Reading copies do not change bookings or verify inventory.`);
    } catch { setMessage("Download could not be completed. No incomplete copy was substituted. Review the records, size budget and PDF server availability."); }
    finally { setBusy(null); }
  }

  return <DetailDrawer wide title="Export studio" close={close}><section className="export-studio" aria-label="Export settings and preview"><div className="export-studio-settings">
    <div className="studio-intro"><span className="studio-eyebrow"><Icon name="download" width="13"/> A COPY FOR THE JOURNEY</span><h3>Take the plan<br/>with you.</h3><p>A beautiful reading copy, shaped around what you need.</p></div>
    <div className="studio-section"><span className="studio-control-label">Presentation</span><div className="studio-layout-switch" role="group" aria-label="Export layout">{[{value:true,label:'Visual dossier',icon:'cities'},{value:false,label:'Compact brief',icon:'calendar'}].map(item=><button key={item.label} type="button" aria-pressed={visual===item.value} disabled={!!busy} onClick={()=>{setVisual(item.value);setMessage('');}}><Icon name={item.icon} width="17"/><span>{item.label}</span></button>)}</div></div>
    <div className="export-studio-controls"><label>Include<GlassSelect aria-label="Export scope" value={scope} disabled={!!busy} onChange={event=>{setScope(event.target.value as ExportPreviewOptions['scope']);setMessage('');}}><option value="all">Whole itinerary</option><option value="travel">Travel essentials</option><option value="transit">Transit only</option><option value="hotels">Hotels only</option></GlassSelect></label><label>Page style<GlassSelect aria-label="Export theme" value={options.theme} disabled={!!busy||supportedThemes.length<2} onChange={event=>{setTheme(event.target.value as TripExportTheme);setMessage('');}}>{supportedThemes.map(item=><option key={item} value={item}>{item==='light'?'Daylight':'After dark'}</option>)}</GlassSelect></label></div>
    <div className="studio-date-selection"><label className="studio-check"><input type="checkbox" checked={limitDates} disabled={!!busy} onChange={event=>setLimitDates(event.target.checked)}/><span>Choose specific dates</span></label>{limitDates&&<div className="studio-date-fields"><label>From<input type="date" aria-label="Export from date" min={snapshot.start} max={snapshot.end} value={fromDate} disabled={!!busy} onChange={event=>setFromDate(event.target.value)}/></label><label>Through<input type="date" aria-label="Export through date" min={snapshot.start} max={snapshot.end} value={toDate} disabled={!!busy} onChange={event=>setToDate(event.target.value)}/></label></div>}</div>
    {failure&&<p className="export-studio-error" role="alert">{failure}</p>}
    {summary&&<><div className="studio-content-summary"><span><strong>{summary.counts.days}</strong>days</span><span><strong>{summary.counts.activities}</strong>planned</span><span><strong>{summary.counts.bookings}</strong>records</span></div><p className="export-studio-note">{selectionNote}</p>
      <label className="studio-check studio-photo-optin"><input type="checkbox" checked={loadImages} disabled={!!busy||!visual} onChange={event=>setLoadImages(event.target.checked)}/><span>Show photos in preview<small>May contact image hosts</small></span></label>
      {loadImages&&visual&&<p className="studio-photo-status" role="status">{currentPhotos?.result?`${currentPhotos.result.embedded} local photos ready · ${currentPhotos.result.failed} unavailable · ${currentPhotos.result.omitted} beyond preview limits`:currentPhotos?.failed?'Photos unavailable. The reading preview remains usable.':'Preparing local photos…'}</p>}
      <details className="export-studio-limits"><summary>Contents & file details<Icon name="chevron" width="12"/></summary><dl className="export-studio-counts">{Object.entries(summary.counts).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><p className="export-studio-note">{summary.photos.local} local · {summary.photos.external} external · {summary.photos.embedded} embedded photo candidates. Compact briefs contain no photos.</p><p className="export-studio-note">Reading HTML {(summary.htmlBytes/1024).toFixed(1)} KiB / {(EXPORT_PREVIEW_HTML_BUDGET/1024).toFixed(0)} KiB. Linked photo bytes and final PDF size are separate.</p>{currentPhotos?.result&&<p className="export-studio-note">Preview source photos: {(currentPhotos.result.embeddedBytes/1_000_000).toFixed(2)} MB. Limited to 40 local photos, 1 MB each, 8 MB total and three concurrent reads. External images are outside these counts.</p>}<p className="export-studio-note">Scripts, forms and navigation are disabled in this preview. HTML downloads keep linked photos: local /media paths need the app or bundled assets, and external photos need internet. PDF uses the running export server and can omit unavailable images. This is a reading preview, not a PDF page proof. Editable workspace JSON remains a separate download. Scoped briefs retain route/date context.</p></details>
      {summary.overBudget&&<p className="export-studio-error" role="alert">The reading copy exceeds its size budget. Choose a narrower scope or compact brief; records are never silently dropped.</p>}</>}
    <div className="export-studio-actions"><button disabled={!!busy||!!failure||!summary||summary.overBudget} onClick={()=>void download('html')}><Icon name="download" width="15"/>{busy==='html'?'Preparing…':'Download HTML'}</button><button disabled={!!busy||!!failure||!summary||summary.overBudget} onClick={()=>void download('pdf')}><Icon name="download" width="15"/>{busy==='pdf'?'Preparing…':'Download PDF'}</button></div>{message&&<p className="studio-download-status" role="status">{message}</p>}
    </div><div className="export-studio-preview"><div className="studio-preview-label"><span><i/>READING PREVIEW</span><span>{visual?'Visual dossier':'Compact brief'} · {options.theme==='light'?'Daylight':'After dark'}</span></div>{summary&&!summary.overBudget&&!failure?<iframe title={`Itinerary reading preview: ${scope}, ${visual?'visual':'compact'}, ${options.theme}`} sandbox="" referrerPolicy="no-referrer" srcDoc={sandboxExportPreviewHtml(previewHtml,loadImages&&visual,typeof window==='undefined'?'':window.location.origin)}/>:<div className="studio-preview-empty"><Icon name="calendar" width="32"/><p>Review the selection to prepare your reading copy.</p></div>}</div>
  </section></DetailDrawer>;
}
