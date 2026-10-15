'use client';
import {useEffect,useRef,useState} from 'react';
import {readHistoryResponse,type HistoryEntry,type HistorySummary} from '@/lib/collaboration/history';
import './collaboration-history.css';
const actionLabel:Record<HistoryEntry['action'],string>={'board-update':'Board saved','proposal-interaction':'Proposal interaction','proposal-review':'Proposal reviewed','invitation-created':'Invitation created','invitation-revoked':'Invitation revoked','owner-rotated':'Owner access replaced'};
export default function CollaborationHistory({roomId,access,connected}:{roomId:string;access:string;connected:boolean}) {
  const [history,setHistory]=useState<HistorySummary|null>(null),[pending,setPending]=useState(false),[error,setError]=useState('');
  const request=useRef<AbortController|null>(null);
  useEffect(()=>()=>request.current?.abort(),[]);
  async function load(){request.current?.abort();const controller=new AbortController();request.current=controller;setPending(true);setError('');setHistory(null);
    try{const response=await fetch(`/api/collaboration/rooms/${roomId}/history`,{headers:{Authorization:`Bearer ${access}`},cache:'no-store',signal:AbortSignal.any([controller.signal,AbortSignal.timeout(8000)])});const value=await readHistoryResponse(response);if(!controller.signal.aborted)setHistory(value);}
    catch{if(!controller.signal.aborted)setError('History unavailable. Check current room access, then refresh. Your board and drafts are unchanged.');}
    finally{if(!controller.signal.aborted)setPending(false);}
  }
  const visible=connected?history:null;
  return <details className="collab-history"><summary>Shared revision history</summary><div className="collab-history-body"><p>Recent server-recorded changes, with categories and counts only. Access aliases identify a link and role, never a verified person. History is separate from board downloads.</p><button type="button" disabled={!connected||pending} onClick={()=>void load()}>{pending?'Loading history…':history?'Refresh history':'Load history'}</button>{!connected&&<p role="status">Connect with current room access to read history.</p>}{error&&connected&&<p role="alert">{error}</p>}{visible&&<><p className="collab-history-window">Latest {visible.retainedLimit} summaries retained · board version {visible.revision}. {visible.startsAtRevision===null?'No summaries recorded yet.':`Retained summaries begin at board version ${visible.startsAtRevision}.`} Earlier activity is unavailable; recording begins with feature-enabled writes. History is not a complete audit archive.</p>{visible.entries.length>0&&<ol>{[...visible.entries].reverse().map(entry=><li key={entry.sequence}><div><strong>{actionLabel[entry.action]}</strong><span>Version {entry.revision} · event {entry.sequence}</span></div><time dateTime={entry.at}>{entry.at.replace('T',' ').replace('.000Z',' UTC')}</time><p>{entry.actor.role} access · {entry.actor.id.slice(7,15)} <span className="collab-history-alias">(link alias)</span></p>{entry.changes.length?<ul>{entry.changes.map(change=><li key={change.category}>{change.category}: {change.added} added · {change.changed} changed · {change.removed} removed</li>)}</ul>:<p>No tracked field changes.</p>}</li>)}</ol>}</>}</div></details>;
}
