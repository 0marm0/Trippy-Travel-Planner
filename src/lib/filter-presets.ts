import { hasPrivatePlanningText } from './planning-privacy.ts';
export type FilterValue = string | boolean;
export type FilterSpec = Record<string,{label:string;initial:FilterValue;options?:string[];pattern?:RegExp}>;
export type FilterValues = Record<string,FilterValue>;
export type FilterPreset = {id:string;label:string;filters:FilterValues};
export type FilterPresetFile = {version:1;scope:string;items:FilterPreset[]};
const safeText=(value:unknown,max:number):value is string=>typeof value==='string'&&value.length<=max&&!hasPrivatePlanningText(value)&&!/@|https?:|www\.|mail[t]o:|[\u0000-\u001f\u007f]|\+?\d[\d ()-]{6,}\d/i.test(value.normalize('NFKC'));
export function filterPresetKey(scope:string){if(!/^[a-z0-9-]{1,100}$/.test(scope))throw new Error('Invalid filter scope.');return `trippy.filters.v1.${scope}`;}
export function validateFilters(input:unknown,spec:FilterSpec):FilterValues{
 const fail=():never=>{throw new Error('These filters are invalid, outdated or contain private text.');};
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length!==Object.keys(spec).length||Object.keys(spec).length>12)return fail();
 const values=input as FilterValues;
 for(const [key,field]of Object.entries(spec)){
  const value=values[key];if(!Object.hasOwn(values,key)||typeof value!==typeof field.initial)return fail();
  if(typeof value==='string'&&(!safeText(value,160)||field.options&&!field.options.includes(value)||field.pattern&&!field.pattern.test(value)))return fail();
 }
 return structuredClone(values);
}
export function readFilterPresets(raw:string|null,scope:string,spec:FilterSpec):FilterPresetFile{
 filterPresetKey(scope);if(raw===null)return{version:1,scope,items:[]};
 if(raw.length>64000)throw new Error('Saved filters exceed the device limit.');
 const input=JSON.parse(raw);if(!input||Object.keys(input).sort().join(',')!=='items,scope,version'||input.version!==1||input.scope!==scope||!Array.isArray(input.items)||input.items.length>8)throw new Error('Saved filters do not match this trip and view.');
 const ids=new Set<string>();for(const item of input.items){if(!item||Object.keys(item).sort().join(',')!=='filters,id,label'||typeof item.id!=='string'||!/^preset-[a-z0-9-]{1,64}$/.test(item.id)||ids.has(item.id)||!safeText(item.label,60)||!item.label.trim())throw new Error('Saved filter record is invalid.');ids.add(item.id);validateFilters(item.filters,spec);}
 return structuredClone(input);
}
export function saveFilterPreset(store:Pick<Storage,'getItem'|'setItem'>,scope:string,spec:FilterSpec,expected:string|null,next:FilterPresetFile):string{
 const key=filterPresetKey(scope),serialized=JSON.stringify(next);readFilterPresets(serialized,scope,spec);
 if(store.getItem(key)!==expected)throw new Error('Saved filters changed in another tab. Close and reopen presets before saving.');
 store.setItem(key,serialized);return serialized;
}
