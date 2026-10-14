# Public images

Trippy keeps private originals outside the publishable tree. Public files are reviewed derivatives; provider photos may remain remote references. Image failure always needs a readable placeholder or list fallback.

## Owner permission and licensing

On 2026-10-13 the owner stated that licenses had already been acquired for all existing photos and explicitly requested preparation of the repository with those photos. The owner will provide license evidence later. `public/media-manifest.json` records this attestation against a SHA-256 digest of the exact current photo-reference inventory. Existing branding/category artwork is approved for the intended public repository by the owner; its original creation method is unknown.

This is owner-attested permission. The repository does not independently verify the deferred license documents, infer redistribution permission from a provider URL, or claim that every image is MIT licensed. The root MIT license covers repository code and original code artwork; third-party photos retain their own terms. Per-photo license identifiers, required attribution, modification conditions and redistribution scope should be mapped when the retained license documents are supplied. Existing provider source/credit fields remain attached to remote hotel photos.

`verified` on historical provider media denotes source association; it is not a copyright or license verdict. Wikimedia, hotel/provider CDNs, and other photo hosts are not blanket licenses.

## Existing guide photos

The current preparation recovered 136 photos whose original byte hashes exactly matched image references in the public trip sample. Only referenced WebP image bytes were extracted from the owner-authorized local itinerary, treated as inert text. No itinerary HTML, traveler text, alt text, filenames from the source, booking records, or source document was copied into public files.

All 136 images received a contact-sheet pixel review. They show public landmarks, museums, food, landscapes, and ordinary public scenes. No traveler booking documents or private contact references were visible at the reviewed scale. Sharp then applied orientation, bounded the output to 1600 pixels, re-encoded WebP, and removed embedded EXIF, GPS, XMP, IPTC and color-profile metadata. A thumbnail review cannot guarantee that every incidental detail is absent; it is recorded separately from the mechanical metadata check.

A parity check against the deployed dashboard then recovered 18 additional Egypt photos from a second owner-authorized guide and two automotive photos from the original public image host. Their exact intended activity associations are restored. The new derivatives retain at most 1800 pixels and do not enlarge small originals. Seventeen Egypt originals are only 160–420 pixels wide; these are faithful recovered images, not high-resolution replacements. Never substitute an unrelated location photo and represent it as the intended destination.

The existing public brand and app icon were reduced to 512 pixels and stripped of metadata. Together they now occupy about 133 KB instead of more than 13 MB; the original creation method is not asserted. The five category icons are explicitly included despite a host-global icon ignore rule.

## Add public images

1. Put originals under ignored `.private/media/`. Keep filenames and source documents private.
2. Review the pixels for visible traveler names, tickets, contact details, identifiers, faces or documents that need consent. Confirm the intended redistribution permission and required credit.
3. Create ignored `.private/media-plan.json` with `version: 1` and an `assets` array. Every entry needs `source` (relative to `.private/media/`), `output` (`public/media/descriptive-name.webp`), `credit`, `sourceUrl` (public HTTPS source page or repository reference), `license`, `rightsStatus: "approved"`, `privacyStatus: "approved"` and `reviewedAt` (`YYYY-MM-DD`). Use public source references only; no emails, authenticated/signed URLs or private original paths in review fields.
4. Run `node scripts/prepare-public-media.mjs`. It validates the batch before writing new files, rejects traversal and escaping symlinks, strips metadata, and records output hashes. Existing output files require separate review; it does not silently replace them.
5. Run `node scripts/validate-public-media.mjs`, the sample checks and `npm run release:check`. Review the exact proposed repository artifact before publishing.

For previously reviewed matching guide images, `node scripts/restore-guide-media.mjs <authorized-local-html> --pixels-reviewed` extracts only hash-matched image bytes. The switch acknowledges completed pixel review; metadata stripping alone cannot provide that review. Source HTML is never executed or copied. This migration refuses to replace existing derivatives.

## Automated gate

`npm run privacy:check` invokes the media validator. It checks every local image in `public/`, Next app image assets, media references in public trip samples and the generated hotel-photo catalogue. A changed derivative hash, missing referenced file, unsafe SVG, retained metadata, unreviewed local asset, or unsafe/authenticated image URL fails the release gate. A new remote photo set needs a reviewed record or renewed owner attestation; adding references invalidates the current inventory digest.

The validator reports counts, categories and public filenames. It never prints private original paths, metadata values, image URLs or matching sensitive content. It does not download remote photos or inspect their pixels. Remote availability and remote content changes remain operational/provider risks; the manual/placeholder view must continue to work.

The current photo inventory contains 154 bundled guide photos, 2 bundled automotive photos, 8 existing local visual assets and 1,074 distinct remote photo references. All bundled images pass the metadata and byte-hash check. A separate sanitized sample review inspected 6,604 strings and 7,744 keys: no forbidden private keys, remaining redaction changes, authenticated/malformed URLs, or booking links were found. This describes automated/text and thumbnail review scope, and does not replace the owner's final review of the exact artifact.

Runtime rendering and release readiness are separate. A working gallery does not authorize publishing, creating a remote, or deploying. The owner reviews the exact prepared candidate and authorizes those actions separately.

## Portable itinerary photos

The dashboard serves the restored guide photos from this checkout's `public/guide-images` and `public/media` directories. Downloaded HTML dossiers embed reviewed bundled WebP images so they do not depend on the maintainer's website. Visual PDF exports read only approved public filename patterns and convert local WebP to JPEG in memory; Next.js file tracing includes those assets for hosted functions. Remote provider photos retain their source URLs and may become unavailable; bundling them requires a separate reviewed media plan and license/credit mapping.

## App screenshots

The README showcases the application itself, with **23 captures** listed in [the screenshot gallery](SCREENSHOTS.md). Captures use verified public sample mode, blank new-trip/shared-room forms or invented generic/reconciliation records. The final three images are `generic-workspace.webp`, `visual-export.webp` and `reconciliation.webp`, captured from the local candidate; account/session values and real traveler confirmations are excluded. Existing photos/screenshots remain preserved.

Pixel review and metadata/hash validation are separate checks. The capture review found no visible private identifiers, credentials, confirmation codes or invitation capabilities. Reviewed WebP derivatives preserve map labels and UI text without embedded metadata. The 23 screenshot assets bring the local image inventory to **187**; the **156 travel photos** remain in their separate gallery. Map credits remain visible and depicted photography retains its separate terms. Adding screenshots does not alter or independently verify the deferred photo-license records.
