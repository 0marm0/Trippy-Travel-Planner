"use client";

import { Children, isValidElement, useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, SelectHTMLAttributes } from "react";
import { createPortal } from "react-dom";

/** Native form value and change behavior, with a keyboard-accessible glass menu. */
export default function GlassSelect({ children, value, defaultValue, onChange, className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  const options = Children.toArray(children).flatMap((child) => {
    if (!isValidElement<{ value?: string | number; children?: string; disabled?: boolean }>(child)) return [];
    return [{ value: String(child.props.value ?? child.props.children ?? ""), label: String(child.props.children ?? ""), disabled: child.props.disabled }];
  });
  const [localValue, setLocalValue] = useState(String(defaultValue ?? options[0]?.value ?? ""));
  const selected = String(value ?? localValue);
  const [open, setOpen] = useState(false);
  const [portalHost,setPortalHost] = useState<HTMLElement|null>(null);
  const [position, setPosition] = useState<CSSProperties>({});
  const trigger = useRef<HTMLButtonElement>(null);
  const native = useRef<HTMLSelectElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const id = useId();
  const selectedOption = options.find((option) => option.value === selected) || options[0];
  function show() {
    if (props.disabled) return;
    const rect = trigger.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(Math.max(rect.width, 185), window.innerWidth - 24);
    const below = window.innerHeight - rect.bottom;
    setPosition({ width, left: Math.min(Math.max(12, rect.left), window.innerWidth - width - 12), ...(below < 180 ? { bottom: window.innerHeight - rect.top + 7 } : { top: rect.bottom + 7 }), maxHeight: Math.max(130, Math.min(320, below < 180 ? rect.top - 20 : below - 20)) });
    setPortalHost(trigger.current?.closest("dialog") || document.body);
    setOpen(true);
  }
  function choose(next: string) {
    setLocalValue(next); setOpen(false);
    if (native.current) {
      native.current.value = next;
      native.current.dispatchEvent(new Event("change", { bubbles: true }));
      // Command pickers can reset their native value in the change handler.
      if (value === undefined) setLocalValue(native.current.value);
    }
    trigger.current?.focus();
  }
  useEffect(() => {
    if (!open) return;
    const active = menu.current?.querySelector<HTMLElement>('[aria-selected="true"]') || menu.current?.querySelector<HTMLElement>('[role="option"]:not(:disabled)');
    active?.focus({ preventScroll: true }); active?.scrollIntoView({ block: "nearest" });
    function outside(event: PointerEvent) { if (!menu.current?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node)) setOpen(false); }
    function close() { setOpen(false); }
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", close);
    return () => { document.removeEventListener("pointerdown", outside); window.removeEventListener("resize", close); };
  }, [open]);
  const name = props["aria-label"] || props.name || selectedOption?.label || "Choose option";
  return <span className={`glass-select ${className}`}>
    <select {...props} value={value} defaultValue={defaultValue} onChange={onChange} ref={native} tabIndex={-1} aria-hidden="true" style={{ display: "none" }}>{children}</select>
    <button ref={trigger} type="button" className="glass-select-trigger" aria-label={name} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? id : undefined} disabled={props.disabled} onClick={() => open ? setOpen(false) : show()} onKeyDown={(event) => { if (["ArrowDown", "ArrowUp", " ", "Enter"].includes(event.key)) { event.preventDefault(); show(); } }}><span>{selectedOption?.label}</span><svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
    {open && portalHost && createPortal(<div id={id} role="listbox" aria-label={name} ref={menu} className="glass-select-menu" style={position} onKeyDown={(event) => {
      const buttons = [...(menu.current?.querySelectorAll<HTMLButtonElement>('[role="option"]:not(:disabled)') || [])];
      const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
      if (event.key === "Escape" || event.key === "Tab") { setOpen(false); if (event.key === "Escape") { event.preventDefault(); trigger.current?.focus(); } return; }
      let next = -1;
      if (event.key === "ArrowDown") next = (current + 1) % buttons.length;
      if (event.key === "ArrowUp") next = (current - 1 + buttons.length) % buttons.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = buttons.length - 1;
      if (event.key.length === 1 && /\S/.test(event.key)) next = buttons.findIndex((button, index) => index > current && button.textContent?.trim().toLowerCase().startsWith(event.key.toLowerCase()));
      if (next >= 0) { event.preventDefault(); buttons[next]?.focus(); }
    }}>{options.map((option) => <button type="button" role="option" aria-selected={selected === option.value} disabled={option.disabled} tabIndex={-1} key={option.value} onClick={() => choose(option.value)}><span>{option.label}</span>{selected === option.value && <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 8 3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>}</button>)}</div>, portalHost)}
  </span>;
}
