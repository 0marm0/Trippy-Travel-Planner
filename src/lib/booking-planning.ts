import type { NormalizedTrip } from './normalized-trip.ts';
import type { ActivityPhoto, ActivityCoordinates, GenericWorkspace } from './generic-trip-workspace.ts';
import { safeCollaborationImage, safeCollaborationSourceUrl } from './collaboration/schema.ts';
import { hasPrivatePlanningText } from './planning-privacy.ts';

export const bookingTransportModes = ['unknown','flight','rail','car','ferry','bus','other'] as const;
export type StayBookingPlan = { kind: 'stay'; bookingId: string; placeId: string; notes: string; photo?: ActivityPhoto; coordinates?: ActivityCoordinates };
export type TransportBookingPlan = { kind: 'transport'; bookingId: string; mode: typeof bookingTransportModes[number]; fromPlaceId: string; toPlaceId: string; from: string; to: string; elapsedMinutes: number | null; transferMinutes: number | null; notes: string };
export type BookingPlan = StayBookingPlan | TransportBookingPlan;
export type BookingPlanningData = { version: 1; items: BookingPlan[] };
export type BookingPlanPreview = { base: string; item: BookingPlan; itemSnapshot: string; remove: boolean };
function keys(value: unknown, required: string[], optional: string[] = []): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value) && required.every(key=>Object.hasOwn(value,key)) && Object.keys(value).every(key=>[...required,...optional].includes(key));
}
function text(value: unknown, max = 160): value is string {
  return typeof value === 'string' && value.length <= max && !hasPrivatePlanningText(value) && !/[@\u0000-\u0009\u000b\u000c\u000e-\u001f\u007f]|https?:|www\.|mail[t]o:|gmail|\+?\d[\d ()-]{6,}\d/i.test(value.normalize('NFKC'));
}
function checked(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value.slice(0,10)+'T00:00:00Z').toISOString().slice(0,10) === value.slice(0,10);
}
const minutes = (value: unknown) => value === null || typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 43200;
/** Same narrow public-media contract as workspace activities; no remote fetching. */
function safePhoto(value: string): boolean {
  if (safeCollaborationImage(value) === value) return /^\/guide-images\/[a-f0-9]{12,64}\.webp$/.test(value) || /^\/media\/[a-z0-9][a-z0-9-]*\.webp$/.test(value);
  if (safeCollaborationSourceUrl(value) !== value) return false;
  const url = new URL(value);
  return !url.port && ['images.unsplash.com','upload.wikimedia.org','commons.wikimedia.org','thumb.wikimedia.org'].includes(url.hostname);
}

/** Planning metadata references existing records; never changes booking status, rates or dates. */
export function validateBookingPlans(input: unknown, trip: NormalizedTrip): BookingPlanningData {
  const fail = (): never => { throw new Error('Invalid or unsafe booking planning details; no changes applied.'); };
  if (!keys(input,['version','items']) || input.version !== 1 || !Array.isArray(input.items) || input.items.length > trip.bookings.length) return fail();
  const seen = new Set<string>();
  const place = (value: unknown): value is string => typeof value === 'string' && (value === '' || trip.destinations.some(item=>item.id === value));
  for (const raw of input.items) {
    if (!keys(raw,['kind','bookingId','notes'],['placeId','photo','coordinates','mode','fromPlaceId','toPlaceId','from','to','elapsedMinutes','transferMinutes'])) return fail();
    const booking = trip.bookings.find(item=>item.id === raw.bookingId);
    if (!booking || seen.has(booking.id) || !text(raw.notes,1000)) return fail();
    seen.add(booking.id);
    if (raw.kind === 'stay') {
      if (booking.kind !== 'stay' || !keys(raw,['kind','bookingId','placeId','notes'],['photo','coordinates']) || !place(raw.placeId)) return fail();
      if (Object.hasOwn(raw,'photo')) {
        const photo = raw.photo;
        if (!keys(photo,['url','credit','sourceUrl','checkedAt']) || typeof photo.url !== 'string' || !safePhoto(photo.url) || !text(photo.credit) || !photo.credit.trim() || typeof photo.sourceUrl !== 'string' || safeCollaborationSourceUrl(photo.sourceUrl) !== photo.sourceUrl || !checked(photo.checkedAt)) return fail();
      }
      if (Object.hasOwn(raw,'coordinates')) {
        const pin = raw.coordinates;
        if (!keys(pin,['lat','lng','source','checkedAt']) || typeof pin.lat !== 'number' || !Number.isFinite(pin.lat) || Math.abs(pin.lat)>90 || typeof pin.lng !== 'number' || !Number.isFinite(pin.lng) || Math.abs(pin.lng)>180 || !text(pin.source) || !pin.source.trim() || !checked(pin.checkedAt)) return fail();
      }
    } else if (raw.kind === 'transport') {
      if (!['flight','rail','car','ferry','bus','other'].includes(booking.kind) || !keys(raw,['kind','bookingId','notes','mode','fromPlaceId','toPlaceId','from','to','elapsedMinutes','transferMinutes']) || !bookingTransportModes.includes(raw.mode as TransportBookingPlan['mode']) || (raw.mode !== 'unknown' && raw.mode !== booking.kind) || !place(raw.fromPlaceId) || !place(raw.toPlaceId) || !text(raw.from,120) || !text(raw.to,120) || !minutes(raw.elapsedMinutes) || !minutes(raw.transferMinutes)) return fail();
    } else return fail();
  }
  return structuredClone(input as unknown as BookingPlanningData);
}

export function emptyBookingPlan(booking: NormalizedTrip['bookings'][number]): BookingPlan {
  if (booking.kind === 'stay') return { kind:'stay',bookingId:booking.id,placeId:'',notes:'' };
  return { kind:'transport',bookingId:booking.id,mode:'unknown',fromPlaceId:'',toPlaceId:'',from:'',to:'',elapsedMinutes:null,transferMinutes:null,notes:'' };
}
export function previewBookingPlan(workspace: GenericWorkspace, item: BookingPlan): BookingPlanPreview {
  const validated = validateBookingPlans({version:1,items:[item]},workspace.trip);
  return {base:JSON.stringify(workspace),item:validated.items[0],itemSnapshot:JSON.stringify(validated.items[0]),remove:false};
}
export function previewBookingPlanRemoval(workspace: GenericWorkspace, bookingId: string): BookingPlanPreview {
  const item = workspace.bookingPlans?.items.find(item=>item.bookingId===bookingId);
  if (!item) throw new Error('Planning metadata no longer exists.');
  return {...previewBookingPlan(workspace,item),remove:true};
}
export function applyBookingPlanPreview(workspace: GenericWorkspace, preview: BookingPlanPreview): GenericWorkspace {
  if (JSON.stringify(workspace) !== preview.base) throw new Error('Workspace changed since preview. Review these details again before applying.');
  if (JSON.stringify(preview.item) !== preview.itemSnapshot) throw new Error('Planning details changed since preview. Review these details again before applying.');
  const items = workspace.bookingPlans?.items ?? [];
  const bookingPlans = validateBookingPlans({version:1,items:preview.remove?items.filter(item=>item.bookingId!==preview.item.bookingId):items.some(item=>item.bookingId===preview.item.bookingId)?items.map(item=>item.bookingId===preview.item.bookingId?preview.item:item):[...items,preview.item]},workspace.trip);
  const previous = items.find(item=>item.bookingId===preview.item.bookingId);
  const changed = JSON.stringify(previous) !== JSON.stringify(bookingPlans.items.find(item=>item.bookingId===preview.item.bookingId));
  return {...workspace,bookingPlans,...(workspace.itemEvidence && changed ? {itemEvidence:workspace.itemEvidence.map(item=>item.target==='booking' && item.targetId===preview.item.bookingId ? {...item,reviewRequired:true}:item)}:{})};
}
