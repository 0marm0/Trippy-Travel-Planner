"use client";

import { useState } from "react";
import type { CollaborationRole, CollaborationState } from "@/lib/collaboration/schema";
import "./room-lifecycle.css";

type Latest = { roomId: string; role: CollaborationRole; revision: number; state: CollaborationState };
export type RoomLifecycleProps = {
  roomId: string; token: string; role: CollaborationRole; revision: number;
  connected: boolean; busy: boolean; hasUnsavedChanges: boolean;
  onClosed: () => void; onOwnerRotated: (token: string, revision: number) => void;
  onConflict: (latest: Latest) => void; onError: (message: string) => void; onNotice: (message: string) => void;
  onBusyChange?: (busy: boolean) => void;
};

export default function RoomLifecycle(props: RoomLifecycleProps) {
  const [review, setReview] = useState<"delete" | "rotate" | null>(null);
  const [approved, setApproved] = useState(false);
  const [pending, setPending] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const disabled = props.busy || pending || !props.connected || props.hasUnsavedChanges || uncertain;
  if (props.role !== "owner") return null;
  async function execute() {
    if (disabled || !approved || !review) return;
    setPending(true); props.onBusyChange?.(true);
    let responseReceived = false;
    try {
      const response = await fetch(`/api/collaboration/rooms/${props.roomId}${review === "rotate" ? "/owner-token" : ""}`, {
        method: review === "rotate" ? "POST" : "DELETE",
        headers: { Authorization: `Bearer ${props.token}`, "If-Match": String(props.revision), ...(review === "rotate" ? { "Content-Type": "application/json" } : {}) },
        ...(review === "rotate" ? { body: "{}" } : {}), signal: AbortSignal.timeout(30000),
      });
      const value = await response.json(); responseReceived = true;
      if (!response.ok) {
        if (response.status === 412 && value.state) props.onConflict(value);
        throw new Error(value.error || "Room management failed.");
      }
      if (review === "rotate") {
        // Install access before any clipboard work; token is returned only once.
        if (typeof value.ownerToken !== "string" || !/^[a-zA-Z0-9_-]{43}$/.test(value.ownerToken) || !Number.isSafeInteger(value.revision)) throw new Error("Owner access response could not be accepted. Keep this tab open.");
        props.onOwnerRotated(value.ownerToken, value.revision);
        props.onNotice("Owner access replaced. The old owner link is revoked; keep your new owner link privately.");
      } else { props.onClosed(); props.onNotice("Shared room deleted. All capabilities are invalid. Copies already viewed cannot be erased."); }
      setReview(null); setApproved(false);
    } catch (error) {
      if (!responseReceived) {
        setUncertain(true);
        props.onError("The outcome is unknown because the response was interrupted. Do not retry. Keep this tab open and check access before making another change; a replaced owner token cannot be recovered.");
      } else props.onError(error instanceof Error ? error.message : "Room management failed.");
    } finally { setPending(false); props.onBusyChange?.(false); }
  }
  return <section className="collab-panel room-lifecycle"><h2>Manage room access</h2><p className="collab-muted">Replacing owner access revokes your old owner link. Deleting removes the stored board and every invitation. Neither action removes copies someone already viewed.</p>{props.hasUnsavedChanges && <p className="collab-muted">Save or reconcile your draft before managing this room.</p>}<div className="collab-actions"><button disabled={disabled} onClick={() => {setReview("rotate");setApproved(false);}}>Replace owner link</button><button disabled={disabled} onClick={() => {setReview("delete");setApproved(false);}}>Delete shared room</button></div>{review && <div className="room-lifecycle-review"><h3>{review === "delete" ? "Review permanent room deletion" : "Review owner link replacement"}</h3><p>{review === "delete" ? "This permanently deletes this server's room and all owner, editor and viewer capabilities. There is no undo." : "Only the new owner link will grant owner access. Existing editor and viewer invitations keep their access. The replacement token is returned once; losing it or an interrupted response can lose owner access."}</p><label className="collab-check"><input type="checkbox" checked={approved} disabled={pending} onChange={event=>setApproved(event.target.checked)} />{review === "delete" ? "I approve permanent deletion of this shared room." : "I approve revoking the old owner link and will keep the replacement privately."}</label><div className="collab-actions"><button disabled={disabled || !approved} onClick={()=>void execute()}>{pending ? "Working…" : review === "delete" ? "Permanently delete room" : "Replace owner access"}</button><button disabled={pending} onClick={()=>{setReview(null);setApproved(false);}}>Cancel</button></div></div>}</section>;
}
