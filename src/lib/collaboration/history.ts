import type { CollaborationRole, CollaborationState } from './schema.ts';
export const historyLimit = 100 as const;
export const historyActions = ['board-update','proposal-interaction','proposal-review','invitation-created','invitation-revoked','owner-rotated'] as const;
export const historyCategories = ['trip','cities','activities','days','proposals','interactions','access'] as const;
export type HistoryChange = { category: typeof historyCategories[number]; added: number; changed: number; removed: number };
export type HistoryEntry = { sequence: number; revision: number; at: string; actor: {id:string;role:CollaborationRole}; action: typeof historyActions[number]; changes: HistoryChange[] };
export type HistorySummary = { revision: number; entries: HistoryEntry[]; retainedLimit: 100; startsAtRevision: number | null };
function exact(value: unknown, fields: string[]): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === fields.length && fields.every(field=>Object.hasOwn(value,field)); }
const positive = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
/** Fixed category names and counts only: no raw labels, notes, entity IDs or snapshots. */
export function summarizeBoardChanges(before: CollaborationState, after: CollaborationState): HistoryChange[] {
  const changes: HistoryChange[]=[];
  const compare=(category:HistoryChange['category'],previous:Record<string,unknown>,next:Record<string,unknown>)=>{
    const a=Object.keys(previous), b=Object.keys(next);
    const result={category,added:b.filter(key=>!Object.hasOwn(previous,key)).length,removed:a.filter(key=>!Object.hasOwn(next,key)).length,changed:a.filter(key=>Object.hasOwn(next,key)&&JSON.stringify(previous[key])!==JSON.stringify(next[key])).length};
    if(result.added||result.changed||result.removed)changes.push(result);
  };
  const records=(items:Array<{id:string}>)=>Object.fromEntries(items.map(item=>[item.id,item]));
  compare('trip',{title:before.title,startDate:before.startDate,endDate:before.endDate},{title:after.title,startDate:after.startDate,endDate:after.endDate});
  compare('cities',records(before.cities),records(after.cities));compare('activities',records(before.activities),records(after.activities));compare('days',before.days,after.days);compare('proposals',records(before.suggestions??[]),records(after.suggestions??[]));
  const interactions=(state:CollaborationState)=>Object.fromEntries([...(state.interactions?.votes??[]).map(item=>[`vote:${item.suggestionId}:${item.actor.id}`,item]),...(state.interactions?.comments??[]).map(item=>[`comment:${item.id}`,item])]);
  compare('interactions',interactions(before),interactions(after));
  return changes;
}
export function validateHistoryEntry(input:unknown):HistoryEntry {
  const fail=():never=>{throw new Error('Invalid room history summary.');};
  if(!exact(input,['sequence','revision','at','actor','action','changes'])||!positive(input.sequence)||!positive(input.revision)||typeof input.at!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(input.at)||!Number.isFinite(Date.parse(input.at))||new Date(input.at).toISOString()!==input.at||!exact(input.actor,['id','role'])||typeof input.actor.id!=='string'||!/^access-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(input.actor.id)||!['owner','editor','viewer'].includes(String(input.actor.role))||!historyActions.includes(input.action as HistoryEntry['action'])||!Array.isArray(input.changes)||input.changes.length>historyCategories.length)return fail();
  const categories=new Set<string>();
  for(const change of input.changes){if(!exact(change,['category','added','changed','removed'])||!historyCategories.includes(change.category as HistoryChange['category'])||categories.has(String(change.category))||![change.added,change.changed,change.removed].every(value=>typeof value==='number'&&Number.isInteger(value)&&value>=0&&value<=2000))return fail();categories.add(String(change.category));}
  if(JSON.stringify(input).length>2500)return fail();
  return input as unknown as HistoryEntry;
}
export function validateHistorySummary(input:unknown):HistorySummary {
  const fail=():never=>{throw new Error('Invalid room history summary.');};
  if(!exact(input,['revision','entries','retainedLimit','startsAtRevision'])||!positive(input.revision)||input.retainedLimit!==historyLimit||!Array.isArray(input.entries)||input.entries.length>historyLimit||!(input.startsAtRevision===null||positive(input.startsAtRevision)))return fail();
  let sequence=0,revision=0;
  for(const raw of input.entries){const entry=validateHistoryEntry(raw);if(entry.sequence<=sequence||entry.revision<revision||entry.revision>input.revision)return fail();sequence=entry.sequence;revision=entry.revision;}
  if(input.startsAtRevision!==(input.entries.length?(input.entries[0] as HistoryEntry).revision:null)||JSON.stringify(input).length>260000)return fail();
  return input as unknown as HistorySummary;
}
/** Bounded decoding keeps an untrusted response from becoming an unbounded client record. */
export async function readHistoryResponse(response:Response):Promise<HistorySummary> {
  if(!response.ok||!response.headers.get('content-type')?.startsWith('application/json')||!response.body)throw new Error('History unavailable. Check current room access and try again.');
  const reader=response.body.getReader(),decoder=new TextDecoder();let text='',bytes=0;
  try{while(true){const part=await reader.read();if(part.done)break;bytes+=part.value.byteLength;if(bytes>260000)throw new Error('History summary exceeds limits.');text+=decoder.decode(part.value,{stream:true});}text+=decoder.decode();return validateHistorySummary(JSON.parse(text));}
  finally{await reader.cancel().catch(()=>undefined);reader.releaseLock();}
}
