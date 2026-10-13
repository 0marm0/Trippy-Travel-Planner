import { createHash } from "node:crypto";
import { readFile, readdir, lstat, realpath } from "node:fs/promises";
import { resolve, relative, extname, sep } from "node:path";
import sharp from "sharp";

export const imageExtension = /\.(png|jpe?g|webp|avif|gif|svg)$/i;
export const sha256 = (data) => createHash("sha256").update(data).digest("hex");
const sensitiveText = /mail\.google\.com|mailto:|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b(?:confirmation number|booking reference|record locator|seat assignment)\b/i;
const credentialText = /AIza[\w-]{24,}|sk-[\w-]{20,}|ya29\.[\w-]{20,}/;

export function safePublicText(value) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 2000 && !sensitiveText.test(value) && !credentialText.test(value);
}

export function safeSourceUrl(value) {
  if (typeof value === "string" && /^repository:[a-z0-9][a-z0-9/._-]*$/i.test(value) && !value.includes("..")) return true;
  try {
    const url = new URL(value);
    const providerParameters = {
      "assets.pclncdn.com": ["k", "o", "a"],
      "images.trvl-media.com": ["impolicy", "p"],
      "images0.persgroep.net": ["appId", "quality"],
    };
    const safeQuery = [...url.searchParams.keys()].every((key) => /^(w|h|q|fit|crop|auto|fm|width|height)$/i.test(key) || providerParameters[url.hostname]?.includes(key));
    return url.protocol === "https:" && !url.username && !url.password && safeQuery && !url.hash && safePublicText(value);
  } catch { return false; }
}

export function reviewedRecord(record) {
  return record?.rightsStatus === "approved" && record?.privacyStatus === "approved"
    && safePublicText(record.credit) && safePublicText(record.license)
    && safeSourceUrl(record.sourceUrl)
    && /^\d{4}-\d{2}-\d{2}$/.test(record.reviewedAt || "")
    && Number.isFinite(Date.parse(record.reviewedAt));
}

export function inventoryDigest(references) {
  return sha256(Buffer.from([...new Set(references)].sort().join("\n")));
}

export async function containedPath(root, path, { mustExist = true } = {}) {
  const full = resolve(root, path);
  if (relative(resolve(root), full).split(sep).includes("..")) throw new Error("Path leaves the permitted directory");
  if (mustExist) {
    const actual = await realpath(full);
    if (relative(await realpath(root), actual).split(sep).includes("..")) throw new Error("Symlink leaves the permitted directory");
  }
  return full;
}

export async function listPublicImages(root) {
  const paths = [];
  if ((await lstat(resolve(root, "public"))).isSymbolicLink()) throw new Error("Public directory cannot be a symlink");
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error("Public symlinks require separate release review");
      if (entry.isDirectory()) await walk(path);
      else if (imageExtension.test(entry.name)) paths.push(relative(root, path).split(sep).join("/"));
    }
  }
  await walk(resolve(root, "public"));
  for (const name of ["icon.png", "apple-icon.png", "opengraph-image.png", "twitter-image.png"]) {
    try { if ((await lstat(resolve(root, "src/app", name))).isFile()) paths.push(`src/app/${name}`); } catch { /* optional file */ }
  }
  return paths.sort();
}

export async function mediaReferences(root) {
  const refs = new Set();
  function collect(value, field = "") {
    if (typeof value === "string" && /^(image|images|hero|src|thumbnail|thumbnailUrl)$/i.test(field) && value) refs.add(value);
    else if (Array.isArray(value)) value.forEach((item) => collect(item, field));
    else if (value && typeof value === "object") Object.entries(value).forEach(([key, item]) => collect(item, key));
  }
  for (const filename of await readdir(resolve(root, "examples/trips"))) {
    if (filename.endsWith(".json")) collect(JSON.parse(await readFile(resolve(root, "examples/trips", filename), "utf8")));
  }
  const source = await readFile(resolve(root, "src/lib/hotel-provider-media.generated.ts"), "utf8");
  for (const match of source.matchAll(/"src"\s*:\s*("(?:[^"\\]|\\.)*")/g)) refs.add(JSON.parse(match[1]));
  return [...refs].sort();
}

export async function imagePrivacyFacts(bytes, extension) {
  if (extension === ".svg") {
    const markup = bytes.toString("utf8");
    return { metadata: /<metadata\b|<script\b|<foreignObject\b|\son\w+\s*=|(?:href|src)\s*=\s*["'](?!#)|@import\b|url\(\s*["']?(?!#)/i.test(markup), sensitive: sensitiveText.test(markup) || credentialText.test(markup) };
  }
  const metadata = await sharp(bytes, { limitInputPixels: 40_000_000 }).metadata();
  return { metadata: Boolean(metadata.exif || metadata.iptc || metadata.xmp || metadata.icc || metadata.comments?.length), sensitive: false };
}

export async function validateMedia(root, manifest) {
  if (manifest?.version !== 1 || !Array.isArray(manifest.localAssets) || !Array.isArray(manifest.remoteAssets)) throw new Error("Unsupported media manifest");
  const local = new Map(manifest.localAssets.map((asset) => [asset.path, asset]));
  const remote = new Map(manifest.remoteAssets.map((asset) => [asset.url, asset]));
  const failures = [];
  const references = await mediaReferences(root);
  const attestation = manifest.ownerAttestation;
  const attestedPhotos = attestation?.rightsStatus === "owner-attested"
    && attestation?.scope === "existing-trip-photo-set"
    && attestation?.inventorySha256 === inventoryDigest(references)
    && /^\d{4}-\d{2}-\d{2}$/.test(attestation?.attestedAt || "");
  const counts = { local: 0, remote: 0, missingFiles: 0, pendingRights: 0, pendingPrivacy: 0, metadata: 0 };
  if (local.size !== manifest.localAssets.length || remote.size !== manifest.remoteAssets.length) failures.push("Duplicate manifest entries");
  for (const path of await listPublicImages(root)) {
    counts.local++;
    const asset = local.get(path);
    if (!asset || asset.rightsStatus !== "approved") counts.pendingRights++;
    if (!asset || asset.privacyStatus !== "approved") counts.pendingPrivacy++;
    if (!reviewedRecord(asset)) failures.push(`Local asset requires provenance/privacy review: ${path}`);
    const bytes = await readFile(await containedPath(root, path));
    if (asset?.sha256 !== sha256(bytes)) failures.push(`Local hash missing or changed: ${path}`);
    const facts = await imagePrivacyFacts(bytes, extname(path).toLowerCase());
    if (facts.metadata || facts.sensitive) { counts.metadata++; failures.push(`Embedded metadata or unsafe SVG content: ${path}`); }
  }
  for (const ref of references) {
    if (ref.startsWith("/")) {
      const path = `public${ref}`;
      if (ref.includes("?") || ref.includes("#") || ref.includes("..")) { failures.push("Unsafe local media reference"); continue; }
      try { await containedPath(root, path); } catch { counts.missingFiles++; failures.push("Referenced local media file is missing"); }
    } else {
      counts.remote++;
      const asset = remote.get(ref);
      if (!reviewedRecord(asset) && !attestedPhotos) counts.pendingRights++;
      const safeReference = ref.startsWith("https://") && safeSourceUrl(ref);
      if (!safeReference) counts.pendingPrivacy++;
      if ((!reviewedRecord(asset) && !attestedPhotos) || !safeReference) failures.push("Remote media requires safe references and owner-attested or reviewed rights");
    }
  }
  return { failures, counts, ownerAttestedPhotos: attestedPhotos };
}
