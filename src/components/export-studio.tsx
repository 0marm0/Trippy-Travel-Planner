"use client";

import { useEffect, useState } from "react";
import DetailDrawer from "./detail-drawer";
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
  const [busy, setBusy] = useState<"html" | "pdf" | null>(null);
  const [message, setMessage] = useState("");
  const [photoPreview, setPhotoPreview] = useState<{ source: string; result?: PreviewPhotoResult; failed?: boolean } | null>(null);
  const options: ExportPreviewOptions = { scope, visual, theme: supportedThemes.includes(theme) ? theme : supportedThemes[0] || "light" };
  // Intentionally derive on every render: parent edits and evidence changes must invalidate the preview immediately.
  let html = "";
  let summary: ReturnType<typeof buildExportPreviewSummary> | undefined;
  let failure = "";
  try {
    const errors = validateExportPreviewSnapshot(snapshot);
    if (errors.length) throw new Error(errors.join(" "));
    html = renderHtml ? renderHtml(options) : renderTripHtml(snapshot, options);
    summary = buildExportPreviewSummary(snapshot, options, html);
  } catch { failure = "Export blocked: a current record is incomplete, invalid or exceeds export limits. Resolve it in the workspace before downloading."; }

  useEffect(() => {
    if (!loadImages || !html || failure || summary?.overBudget) return;
    const controller = new AbortController();
    let current = true;
    void embedSandboxPreviewPhotos(html, window.location.origin, fetch, controller.signal).then(result => {
      if (current && !controller.signal.aborted) setPhotoPreview({ source: html, result });
    }).catch(() => { if (current && !controller.signal.aborted) setPhotoPreview({ source: html, failed: true }); });
    return () => { current = false; controller.abort(); };
  }, [loadImages, html, failure, summary?.overBudget]);
  const currentPhotos = loadImages && photoPreview?.source === html ? photoPreview : null;
  const previewHtml = currentPhotos?.result?.html || maskSandboxLocalPhotos(html);

  async function download(format: "html" | "pdf") {
    setMessage("");
    setBusy(format);
    try {
      const errors = validateExportPreviewSnapshot(snapshot);
      if (errors.length) throw new Error("Invalid current snapshot");
      const currentHtml = renderHtml ? renderHtml(options) : renderTripHtml(snapshot, options);
      const current = buildExportPreviewSummary(snapshot, options, currentHtml);
      if (current.overBudget) throw new Error("HTML exceeds preview budget");
      if (format === "html") await downloadHtml(currentHtml, options);
      else await downloadPdf(sanitizeTripExportSnapshot(snapshot), options);
      setMessage(`${format.toUpperCase()} prepared from the current selection. Reading copies do not change bookings or verify inventory.`);
    } catch { setMessage("Download could not be completed. No incomplete copy was substituted. Review the records, size budget and PDF server availability."); }
    finally { setBusy(null); }
  }

  return <DetailDrawer wide title="Export studio" close={close}><section className="export-studio" aria-label="Export settings and preview"><div className="export-studio-settings">
    <p>Review a sanitized reading copy of the current workspace. Keep editable JSON and evidence downloads in the workspace.</p>
    <div className="export-studio-actions"><button disabled={!!busy || !!failure || !summary || summary.overBudget} onClick={() => void download("html")}>{busy === "html" ? "Preparing HTML…" : "Download HTML"}</button><button disabled={!!busy || !!failure || !summary || summary.overBudget} onClick={() => void download("pdf")}>{busy === "pdf" ? "Preparing PDF…" : "Download PDF"}</button></div>
    {message && <p role="status">{message}</p>}
    <div className="export-studio-controls">
      <label>Scope<GlassSelect aria-label="Export scope" value={scope} disabled={!!busy} onChange={event => { setScope(event.target.value as ExportPreviewOptions["scope"]); setMessage(""); }}><option value="all">Whole itinerary</option><option value="travel">Travel essentials</option><option value="transit">Transit only</option><option value="hotels">Hotels only</option></GlassSelect></label>
      <label>Layout<GlassSelect aria-label="Export layout" value={visual ? "visual" : "compact"} disabled={!!busy} onChange={event => { setVisual(event.target.value === "visual"); setMessage(""); }}><option value="visual">Visual dossier</option><option value="compact">Compact reading copy</option></GlassSelect></label>
      <label>Theme<GlassSelect aria-label="Export theme" value={options.theme} disabled={!!busy || supportedThemes.length < 2} onChange={event => { setTheme(event.target.value as TripExportTheme); setMessage(""); }}>{supportedThemes.map(item => <option key={item} value={item}>{item === "light" ? "Light" : "Dark"}</option>)}</GlassSelect></label>
    </div>
    {failure && <p className="export-studio-error" role="alert">{failure}</p>}
    {summary && <>
      <dl className="export-studio-counts">{Object.entries(summary.counts).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <p className="export-studio-note">Counts use the selected scope. Transit and hotel briefs retain route/date context; travel briefs exclude activity guides. Invalid records are checked before scoping.</p>
      <div className="export-studio-assets"><b>Photo candidates</b><p>{summary.photos.local} local · {summary.photos.external} external · {summary.photos.embedded} embedded, unique assets. Compact layout uses no photos. The renderer may reuse or omit candidates.</p><p>Reading HTML: {(summary.htmlBytes / 1024).toFixed(1)} KiB / {(EXPORT_PREVIEW_HTML_BUDGET / 1024).toFixed(0)} KiB studio budget. Linked image bytes and final PDF size are unknown until loaded; HTML size excludes those files.</p></div>
      {summary.overBudget && <p className="export-studio-error" role="alert">This reading copy exceeds the studio size budget. Choose a smaller scope or compact layout; no records will be silently dropped.</p>}
      <label className="export-studio-image-choice"><input type="checkbox" checked={loadImages} onChange={event => setLoadImages(event.target.checked)} />Load linked photos in this preview (may contact image hosts)</label>
      {loadImages && <p className="export-studio-note" role="status">{currentPhotos?.result ? `Local preview photos: ${currentPhotos.result.embedded} embedded, ${currentPhotos.result.failed} failed, ${currentPhotos.result.omitted} omitted of ${currentPhotos.result.candidates} eligible rendered assets; ${(currentPhotos.result.embeddedBytes / 1_000_000).toFixed(2)} MB embedded source bytes. Preview data URLs are separate from the reading HTML size and download.` : currentPhotos?.failed ? "Local preview photos could not be loaded; neutral placeholders are shown." : "Preparing local preview photos…"} Maximum 40 local assets, 1 MB each, 8 MB total accepted bytes, three concurrent reads. External images remain linked and are outside these local-photo counts.</p>}
      <details className="export-studio-limits"><summary>Images, offline use & PDF limits</summary><p className="export-studio-note">Preview starts without network images. Scripts, forms and navigation are disabled. HTML downloads keep linked photo paths: external images need internet, and local /media paths need this app or separately bundled assets. Visual PDF generation may ask the server to retrieve approved images; missing images may be omitted. PDF needs a running export server and its upload/image limits still apply. HTML preview is not a PDF page proof.</p></details>
    </>}

    </div><div className="export-studio-preview">{summary && !summary.overBudget && !failure ? <iframe title={`Itinerary reading preview: ${scope}, ${visual ? "visual" : "compact"}, ${options.theme}`} sandbox="" referrerPolicy="no-referrer" srcDoc={sandboxExportPreviewHtml(previewHtml, loadImages, typeof window === "undefined" ? "" : window.location.origin)} /> : <p>Resolve the export checks to preview this reading copy.</p>}</div>
  </section></DetailDrawer>;
}
