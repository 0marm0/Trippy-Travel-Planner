import { sanitizeTripExportSnapshot, type TripExportSnapshot } from './trip-exports.ts';
import { validateExportPreviewSnapshot } from './export-preview.ts';

export type ExportDateRange = { start: string; end: string };
const date = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value+'T12:00:00Z')) && new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;

/** Select reading-copy dates without changing the dates or terms of an overlapping booking. */
export function selectExportDates(input: TripExportSnapshot, range?: ExportDateRange) {
  if (validateExportPreviewSnapshot(input).length) throw new Error('Validate the complete source before selecting export dates.');
  const snapshot = sanitizeTripExportSnapshot(input);
  if (!range) return { snapshot, omittedDays:0, omittedTransport:0, omittedBookings:0 };
  if (!date(range.start)||!date(range.end)||range.start>range.end||range.start<snapshot.start||range.end>snapshot.end) throw new Error('Choose dates inside this trip window, in chronological order.');
  const inside = (value:string) => value>=range.start&&value<=range.end;
  const overlaps = (start:string,end:string) => start<=range.end&&end>=range.start;
  const days=snapshot.days.filter(day=>inside(day.date));
  const stops=snapshot.stops.filter(stop=>!stop.checkIn||!stop.checkOut||overlaps(stop.checkIn,stop.checkOut));
  const cities=new Set([...days.map(day=>day.city),...stops.map(stop=>stop.name)]);
  const transport=snapshot.transport.filter(leg=>inside(leg.date));
  const bookings=snapshot.bookings.filter(item=>{
    if(item.endDate&&!date(item.endDate))throw new Error('A booking has an unknown end date. Review it before filtering dates.');
    return overlaps(item.dateIso,item.endDate||item.dateIso);
  });
  return { snapshot:{...snapshot,start:range.start,end:range.end,subtitle:`${snapshot.subtitle} · Selected reading dates ${range.start}–${range.end}. Overlapping stay dates and city windows retain their original recorded scope.`,days,stops,transport,bookings,catalogue:snapshot.catalogue.filter(item=>!item.city||cities.has(item.city)),hotels:snapshot.hotels.filter(item=>!item.city||cities.has(item.city))},omittedDays:snapshot.days.length-days.length,omittedTransport:snapshot.transport.length-transport.length,omittedBookings:snapshot.bookings.length-bookings.length };
}
