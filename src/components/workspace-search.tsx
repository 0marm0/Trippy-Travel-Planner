'use client';
import{useEffect,useState}from'react';
import{searchWorkspace,type WorkspaceSearchHit}from'@/lib/workspace-search';
import type{GenericWorkspace}from'@/lib/generic-trip-workspace';
import DetailDrawer from'./detail-drawer';
import './workspace-search.css';
export default function WorkspaceSearch({workspace,onOpen}:{workspace:GenericWorkspace;onOpen:(hit:WorkspaceSearchHit)=>void}){
 const[open,setOpen]=useState(false),[query,setQuery]=useState('');
 useEffect(()=>{const key=(event:KeyboardEvent)=>{if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'&&!event.altKey&&!(event.target instanceof HTMLElement&&event.target.closest('input,textarea,select,[contenteditable=true]'))){event.preventDefault();setOpen(true);}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 const hits=open?searchWorkspace(workspace,query):[];
 return <><button type="button" onClick={()=>setOpen(true)} aria-keyshortcuts="Control+k Meta+k">Find in trip <kbd>⌘/Ctrl K</kbd></button>{open&&<DetailDrawer title="Find in your trip" close={()=>setOpen(false)}><div className="workspace-quickfind"><label>Search cities, dates, activities, bookings, routes, quotes or tasks<input autoFocus value={query} maxLength={120} onChange={event=>setQuery(event.target.value)} placeholder="e.g. museum, 2030-04-02, packing"/></label><p>Searches this validated trip only. No external services or private account data are queried. Up to 30 matches.</p>{hits.length?<ul>{hits.map(hit=><li key={hit.id}><button type="button" onClick={()=>{onOpen(hit);setOpen(false);}}><span>{hit.kind}</span><strong>{hit.label}</strong><small>{hit.detail}</small></button></li>)}</ul>:<p role="status">{query.trim()?'No matching planning records. Try a city, date or title.':'Start typing to find a planning record.'}</p>}</div></DetailDrawer>}</>;
}
