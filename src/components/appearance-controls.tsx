"use client";

import { createContext, useContext, useEffect, useId, useState, useSyncExternalStore, type ReactNode } from 'react';
import { Icon } from './planner-icon';

type Appearance = { surface: 'glass' | 'solid'; density: 'compact' | 'comfortable'; motion: 'system' | 'reduced' };
const defaults: Appearance = { surface: 'glass', density: 'compact', motion: 'system' };
const key = 'trippy.display.v1';
function readAppearance(): Appearance {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return { surface: value?.surface === 'solid' ? 'solid' : 'glass', density: value?.density === 'comfortable' ? 'comfortable' : 'compact', motion: value?.motion === 'reduced' ? 'reduced' : 'system' };
  } catch { return defaults; }
}
const AppearanceContext = createContext<{value:Appearance;update:(next:Partial<Appearance>)=>void;saved:boolean}>({value:defaults,update:()=>{},saved:true});
const defaultSnapshot=JSON.stringify(defaults);
const getSnapshot=()=>JSON.stringify(readAppearance());
function subscribe(listener:()=>void) {
  function storage(event:StorageEvent){if(event.key===key||event.key===null)listener();}
  window.addEventListener('storage',storage);window.addEventListener('trippy-display-change',listener);
  return ()=>{window.removeEventListener('storage',storage);window.removeEventListener('trippy-display-change',listener);};
}

export function AppearanceProvider({children}: {children: ReactNode}) {
  const snapshot=useSyncExternalStore(subscribe,getSnapshot,()=>defaultSnapshot);
  const [fallback,setFallback]=useState<Appearance|null>(null);
  const value:Appearance=fallback||JSON.parse(snapshot);
  const saved=fallback===null;
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.trippySurface=value.surface;root.dataset.trippyDensity=value.density;root.dataset.trippyMotion=value.motion;
  },[value.surface,value.density,value.motion]);
  function update(next: Partial<Appearance>) {
    const changed={...value,...next};
    try { localStorage.setItem(key,JSON.stringify(changed));setFallback(null);window.dispatchEvent(new Event('trippy-display-change')); } catch { setFallback(changed); }
  }
  return <AppearanceContext.Provider value={{value,update,saved}}>{children}</AppearanceContext.Provider>;
}

export default function AppearanceControls({inline=false}: {inline?:boolean}) {
  const {value,update,saved}=useContext(AppearanceContext);
  const id=useId();
  const controls=<><div className="display-preferences-heading"><span className="trip-kicker">MAKE IT YOURS</span><h3>Look & feel</h3></div><fieldset><legend>Surfaces</legend><div className="display-preferences-options"><button type="button" aria-pressed={value.surface==='glass'} onClick={()=>update({surface:'glass'})}>Liquid glass</button><button type="button" aria-pressed={value.surface==='solid'} onClick={()=>update({surface:'solid'})}>Solid</button></div></fieldset><fieldset><legend>Density</legend><div className="display-preferences-options"><button type="button" aria-pressed={value.density==='compact'} onClick={()=>update({density:'compact'})}>Compact</button><button type="button" aria-pressed={value.density==='comfortable'} onClick={()=>update({density:'comfortable'})}>Comfortable</button></div></fieldset><fieldset><legend>Motion</legend><div className="display-preferences-options"><button type="button" aria-pressed={value.motion==='system'} onClick={()=>update({motion:'system'})}>Use device setting</button><button type="button" aria-pressed={value.motion==='reduced'} onClick={()=>update({motion:'reduced'})}>Reduce motion</button></div></fieldset><p className="display-preferences-note" role="status">{saved?'Preferences stay on this device. Reduced transparency and motion settings are respected.':'Preferences apply in this tab. Device storage is unavailable.'}</p></>;
  return inline?<section className="display-preferences display-preferences-inline" aria-label="Look and feel">{controls}</section>:<><button type="button" className="display-preferences-trigger" popoverTarget={id} aria-label="Look and feel"><Icon name="settings" width="15"/><span>Display</span></button><div popover="auto" id={id} className="display-preferences" role="dialog" aria-label="Look and feel">{controls}</div></>;
}
