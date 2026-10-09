"use client";

import type { ReactNode } from "react";
import { Minus, Plus } from "lucide-react";

// Small controls shared by the calculators. Web counterparts of the app's
// SegmentedToggle, Switch and stepper buttons.

export function Segmented<T extends string>({ value, onChange, options, label }: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
}) {
  return <div role="radiogroup" aria-label={label} className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl bg-astra-light p-1">
    {options.map(o => <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
      className={`min-h-10 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${value === o.value ? "bg-white text-astra-primary shadow-sm" : "text-astra-primary/60 hover:text-astra-primary"}`}>
      {o.label}
    </button>)}
  </div>;
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? "bg-astra-primary" : "bg-astra-primary/20"}`}>
    <span className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
  </button>;
}

export function Stepper({ value, min, max, onChange, label, display }: {
  value: number; min: number; max: number; onChange: (n: number) => void; label: string; display?: string;
}) {
  const btn = (delta: number) => <button type="button" disabled={value + delta < min || value + delta > max} onClick={() => onChange(value + delta)}
    aria-label={`${label} ${delta > 0 ? "+1" : "-1"}`}
    className="flex h-10 w-10 items-center justify-center rounded-xl bg-astra-light text-astra-primary transition-opacity hover:bg-astra-primary/10 disabled:opacity-40">
    {delta > 0 ? <Plus size={18} /> : <Minus size={18} />}
  </button>;
  return <div className="flex items-center gap-2">
    {btn(-1)}
    <span aria-live="polite" className="min-w-12 text-center text-lg font-semibold text-astra-primary tabular-nums">{display ?? value}</span>
    {btn(1)}
  </div>;
}

export function SettingRow({ title, sub, children, first }: { title: string; sub?: string; children: ReactNode; first?: boolean }) {
  return <div className={`flex items-center gap-4 px-5 py-4 ${first ? "" : "border-t border-astra-primary/10"}`}>
    <div className="min-w-0 flex-1">
      <p className="text-[15px] font-semibold text-astra-primary">{title}</p>
      {sub && <p className="mt-0.5 text-xs leading-relaxed text-astra-primary/60">{sub}</p>}
    </div>
    {children}
  </div>;
}

/** Text input for a decimal like 27,45: accepts both comma and dot. */
export function DecimalInput({ value, onChange, placeholder, label, maxLength = 5, integer }: {
  value: string; onChange: (v: string) => void; placeholder: string; label: string; maxLength?: number; integer?: boolean;
}) {
  return <input value={value} inputMode={integer ? "numeric" : "decimal"} placeholder={placeholder} maxLength={maxLength} aria-label={label}
    onChange={e => onChange(e.target.value.replace(integer ? /[^0-9]/g : /[^0-9.,]/g, ""))}
    className="w-24 shrink-0 rounded-xl bg-astra-light px-3 py-2.5 text-right text-base font-semibold text-astra-primary tabular-nums placeholder:text-astra-primary/35" />;
}

export const fmt = (n: number, digits = 2) =>
  n.toLocaleString("it-IT", { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** "27,45" or "27.45" to a number; null when empty or not a number. */
export const parseDecimal = (s: string) => {
  const n = Number(s.replace(",", ".").trim());
  return s.trim() && Number.isFinite(n) ? n : null;
};
