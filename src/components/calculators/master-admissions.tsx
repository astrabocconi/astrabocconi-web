"use client";

import Link from "@/i18n/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { DecimalInput, Segmented, SettingRow, Switch, parseDecimal, useFmt } from "./controls";
import { calculatorCopy } from "@/i18n/copy/calculators";
import { useLang } from "@/i18n/locale-context";
import { calcKey, readSaved, toState, writeSaved, type SavedCalc } from "@/lib/calc-state";
import { weightedAverage } from "@/lib/grade-calc";
import { admissionScore, outlook, MIN_CREDITS, type AdmissionRound, type Chance } from "@/lib/master-admissions";
import { MASTER_ADMISSION_DATA } from "@/lib/master-admissions-data";

// Web port of astra-app/apps/mobile/app/master-admissions.tsx, with the
// Italian copy of apps/mobile/lib/i18n/masters.ts. Students type their GPA (or
// take it from the bachelor calculator) and see, per MSc, how their admission
// score compares with last cycle's admits.

type Inputs = { gpa: string; credits: string; inCorso: boolean; round: AdmissionRound };
const KEY = "astra.web.masters.v1";
const INITIAL: Inputs = { gpa: "", credits: "", inCorso: true, round: 1 };

// The app uses green and amber pills; the website stays on the brand palette.
const CHANCE_PILL: Record<Chance, string> = {
  likely: "bg-astra-primary text-white",
  possible: "bg-astra-gold text-astra-primary",
  unlikely: "bg-astra-light text-astra-primary/70",
  unknown: "border border-astra-primary/15 text-astra-primary/45",
};

export function MasterAdmissions() {
  const lang = useLang();
  const c = calculatorCopy[lang].admissions;
  const fmt = useFmt();
  const [inputs, setInputs] = useState<Inputs>(INITIAL);
  const [ready, setReady] = useState(false);
  const [calcAverage, setCalcAverage] = useState<number | null>(null);

  useEffect(() => {
    const saved = readSaved<Inputs>(KEY);
    // Browser storage is unavailable during SSR; hydrate once after mount.
    if (saved && typeof saved.gpa === "string" && typeof saved.credits === "string" && (saved.round === 1 || saved.round === 2))
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInputs({ ...INITIAL, ...saved, inCorso: saved.inCorso !== false });
    // The bachelor calculator's average, if the student has filled it in.
    try {
      const bachelor = readSaved<SavedCalc>(calcKey("bachelor"));
      if (bachelor) setCalcAverage(weightedAverage(toState("bachelor", bachelor)).average);
    } catch { /* a malformed save just means no shortcut */ }
    setReady(true);
  }, []);

  useEffect(() => { if (ready) writeSaved(KEY, inputs); }, [inputs, ready]);

  const set = (patch: Partial<Inputs>) => setInputs(v => ({ ...v, ...patch }));
  const gpa = parseDecimal(inputs.gpa);
  const credits = parseDecimal(inputs.credits) ?? MIN_CREDITS[inputs.round];
  const score = gpa != null && gpa >= 18 && gpa <= 31 ? admissionScore(gpa, credits, inputs.inCorso, inputs.round) : null;
  const rows = useMemo(() => (score == null ? [] : outlook(score, inputs.round, MASTER_ADMISSION_DATA)), [score, inputs.round]);

  return <div className="grid items-start gap-8 lg:grid-cols-[400px_minmax(0,1fr)]">
    <section aria-label={c.yourData} className="space-y-3 lg:sticky lg:top-28">
      <Segmented label={c.round} value={String(inputs.round) as "1" | "2"} onChange={v => set({ round: Number(v) as AdmissionRound })}
        options={[{ value: "1", label: c.round1 }, { value: "2", label: c.round2 }]} />
      <div className="overflow-hidden rounded-2xl border border-astra-primary/15">
        <SettingRow first title={c.average} sub={c.averageSub}>
          <DecimalInput value={inputs.gpa} onChange={v => set({ gpa: v })} placeholder={c.averagePlaceholder} label={c.average} />
        </SettingRow>
        {calcAverage != null && <button type="button" onClick={() => set({ gpa: fmt(calcAverage) })}
          className="block w-full border-t border-astra-primary/10 px-5 py-3 text-left text-sm font-semibold text-astra-primary hover:bg-astra-light">
          {c.useCalc(fmt(calcAverage))}
        </button>}
        <SettingRow title={c.credits} sub={c.creditsSub}>
          <DecimalInput integer maxLength={3} value={inputs.credits} onChange={v => set({ credits: v })} placeholder={String(MIN_CREDITS[inputs.round])} label={c.credits} />
        </SettingRow>
        <SettingRow title={c.onTime} sub={c.onTimeSub(MIN_CREDITS[inputs.round])}>
          <Switch label={c.onTime} checked={inputs.inCorso} onChange={v => set({ inCorso: v })} />
        </SettingRow>
      </div>
      <div className="rounded-3xl bg-astra-primary p-6 text-white" aria-live="polite">
        <p className="text-sm text-white/70">{c.score}</p>
        <p className="mt-1 text-6xl leading-none font-bold tabular-nums">{score == null ? "…" : fmt(score)}</p>
        <p className="mt-3 text-sm text-white/70">{score == null ? c.scoreEmpty : c.outOf110(fmt((score * 110) / 30, 1))}</p>
      </div>
      <p className="px-1 text-xs text-astra-primary/55">
        {c.dontKnow}<Link href="/calcolatori/bachelor" className="font-semibold underline underline-offset-2">{c.workItOut}</Link>
      </p>
    </section>

    <section aria-label={c.listAria} className="min-w-0 space-y-3">
      {rows.length > 0
        ? <ul className="overflow-hidden rounded-2xl border border-astra-primary/15">
          {rows.map((r, i) => <li key={r.programme.key} className={`flex items-center gap-4 px-5 py-3.5 ${i ? "border-t border-astra-primary/10" : ""}`}>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-astra-primary">{r.programme.name}</p>
              <p className="mt-0.5 text-xs text-astra-primary/60">
                {r.lowest == null ? c.noSurvey : [
                  c.lowest(fmt(r.lowest)),
                  r.median != null ? c.median(fmt(r.median), r.respondents) : null,
                ].filter(Boolean).join(" · ")}
              </p>
              {r.programme.selective && <p className="mt-0.5 text-xs text-astra-primary/45">{c.selective}</p>}
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${CHANCE_PILL[r.chance]}`}>{c.chance[r.chance]}</span>
          </li>)}
        </ul>
        : <div className="rounded-2xl border border-dashed border-astra-primary/20 px-6 py-12 text-center text-sm text-astra-primary/60">
          {c.emptyList}
        </div>}

      <details className="group overflow-hidden rounded-2xl border border-astra-primary/15">
        <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 hover:bg-astra-light/60 [&::-webkit-details-marker]:hidden">
          <span className="flex-1 text-base font-semibold text-astra-primary">{c.howTitle}</span>
          <ChevronDown size={18} aria-hidden="true" className="text-astra-primary/50 transition-transform group-open:rotate-180" />
        </summary>
        {c.how.map(([title, body]) => <div key={title} className="border-t border-astra-primary/10 px-5 py-4">
          <p className="text-[15px] font-semibold text-astra-primary">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-astra-primary/70">{body}</p>
        </div>)}
      </details>

      <p className="px-1 text-xs leading-relaxed text-astra-primary/55">
        {c.disclaimer}
      </p>
    </section>
  </div>;
}

