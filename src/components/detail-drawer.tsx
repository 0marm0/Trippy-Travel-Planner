"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import "./detail-drawer.css";

/** Native modal semantics provide focus containment, inert background and Escape. */
export default function DetailDrawer({ title, children, close, wide = false }: { title: string; children: ReactNode; close: () => void; wide?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      if (opener?.isConnected) opener.focus();
    };
  }, []);
  return <dialog ref={dialog} className={`detail-drawer${wide ? " detail-drawer-wide" : ""}`} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); close(); }} onClick={(event) => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close(); } }}>
    <header><h2 id={titleId}>{title}</h2><button type="button" autoFocus onClick={close} aria-label={`Close ${title} details`}>Close ×</button></header>
    <div className="detail-drawer-content">{children}</div>
  </dialog>;
}
