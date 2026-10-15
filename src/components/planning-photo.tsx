'use client';

import {useState} from 'react';
import {safeWorkspaceActivityPhoto, type ActivityPhoto, type WorkspaceActivity} from '@/lib/generic-trip-workspace';
import {safeCollaborationSourceUrl} from '@/lib/collaboration/schema';
import './planning-photo.css';

export default function PlanningPhoto({photo,title}:{photo?:ActivityPhoto;title:string}) {
  const [failed,setFailed]=useState(false);
  if(!photo || !safeWorkspaceActivityPhoto(photo.url) || safeCollaborationSourceUrl(photo.sourceUrl)!==photo.sourceUrl) return null;
  return <figure className="planning-photo">{failed?<div className="planning-photo-unavailable">Photo unavailable</div>:
    // Attributed external photos retain their original host; no image proxy or account credentials.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={photo.url} alt={title} loading="lazy" referrerPolicy="no-referrer" onError={()=>setFailed(true)}/>}
    <figcaption><span>{title}</span><a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">{photo.credit} ↗</a></figcaption>
  </figure>;
}

export function PlanningPhotoStrip({activities,label='Places in this plan'}:{activities:WorkspaceActivity[];label?:string}) {
  const seen=new Set<string>();
  const photos=activities.filter(activity=>activity.photo && !seen.has(activity.photo.url) && Boolean(seen.add(activity.photo.url))).slice(0,3);
  if(!photos.length)return null;
  return <section className="planning-photo-context" aria-label={label}><p>{label}</p><div className="planning-photo-strip">{photos.map(activity=><PlanningPhoto key={`${activity.id}:${activity.photo!.url}`} title={activity.title} photo={activity.photo}/>)}</div></section>;
}
