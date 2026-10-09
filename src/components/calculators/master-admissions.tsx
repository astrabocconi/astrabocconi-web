"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { DecimalInput, Segmented, SettingRow, Switch, fmt, parseDecimal } from "./controls";
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
const CHANCE: Record<Chance, { label: string; pill: string }> = {
  likely: { label: "Probabile", pill: "bg-astra-primary text-white" },
  possible: { label: "Possibile", pill: "bg-astra-gold text-astra-primary" },
  unlikely: { label: "Difficile", pill: "bg-astra-light text-astra-primary/70" },
  unknown: { label: "Nessun dato", pill: "border border-astra-primary/15 text-astra-primary/45" },
};

const HOW: [string, string][] = [
  ["Due round", "Primo round: puoi candidarti con almeno 90 crediti registrati (entro fine luglio) o con la laurea triennale. Le candidature di solito vanno da luglio a ottobre, i risultati arrivano a fine novembre e qui si assegna la maggior parte dei posti (circa il 60%). Secondo round: da 110 crediti (entro fine aprile); candidature da febbraio ad aprile, risultati a fine maggio, per i pochi posti rimasti."],
  ["Il tuo punteggio", "La media ponderata, convertita in centodecimi. I moduli contano uno per uno, quindi può essere diversa dalla media del calcolatore. Gli studenti in corso hanno 1 punto in più e 0,05 per ogni credito oltre il minimo (esami, stage, seminari e idoneità registrati entro la scadenza). Exchange e stage non danno punti extra."],
  ["Le tue scelte", "Puoi indicare fino a 5 corsi. Tutti vengono messi in graduatoria per punteggio; i posti si assegnano dall'alto, e ognuno ottiene la scelta più alta che ha ancora posto. Quando ti candidi dentro la finestra non conta."],
  ["Corsi che chiedono di più", "CEMS MIM, IM Global Experience, China MIM, ESSEC, AI, Finance Global Experience e i double degree PPA richiedono requisiti linguistici, una lettera motivazionale e un video colloquio. Cyber Risk e Transformative Sustainability (con il PoliMi) valutano anche lettera e CV. Se scegli AI devi caricare il transcript con i settori scientifici (SSD)."],
];

export function MasterAdmissions() {
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
    <section aria-label="I tuoi dati" className="space-y-3 lg:sticky lg:top-28">
      <Segmented label="Round" value={String(inputs.round) as "1" | "2"} onChange={v => set({ round: Number(v) as AdmissionRound })}
        options={[{ value: "1", label: "1° round" }, { value: "2", label: "2° round" }]} />
      <div className="overflow-hidden rounded-2xl border border-astra-primary/15">
        <SettingRow first title="La tua media" sub="Media ponderata in trentesimi, es. 27,45">
          <DecimalInput value={inputs.gpa} onChange={v => set({ gpa: v })} placeholder="27,45" label="La tua media" />
        </SettingRow>
        {calcAverage != null && <button type="button" onClick={() => set({ gpa: calcAverage.toFixed(2) })}
          className="block w-full border-t border-astra-primary/10 px-5 py-3 text-left text-sm font-semibold text-astra-primary hover:bg-astra-light">
          Usa la media del calcolatore ({fmt(calcAverage)})
        </button>}
        <SettingRow title="Crediti registrati" sub="Entro la scadenza del round">
          <DecimalInput integer maxLength={3} value={inputs.credits} onChange={v => set({ credits: v })} placeholder={String(MIN_CREDITS[inputs.round])} label="Crediti registrati" />
        </SettingRow>
        <SettingRow title="In corso" sub={`+1 punto, più 0,05 per ogni credito oltre ${MIN_CREDITS[inputs.round]}`}>
          <Switch label="In corso" checked={inputs.inCorso} onChange={v => set({ inCorso: v })} />
        </SettingRow>
      </div>
      <div className="rounded-3xl bg-astra-primary p-6 text-white" aria-live="polite">
        <p className="text-sm text-white/70">Il tuo punteggio di ammissione</p>
        <p className="mt-1 text-6xl leading-none font-bold tabular-nums">{score == null ? "…" : fmt(score)}</p>
        <p className="mt-3 text-sm text-white/70">{score == null ? "Inserisci la tua media per vedere a che punto sei" : `${fmt((score * 110) / 30, 1)} su 110`}</p>
      </div>
      <p className="px-1 text-xs text-astra-primary/55">
        Non conosci la tua media? <Link href="/calcolatori/bachelor" className="font-semibold underline underline-offset-2">Calcolala qui</Link>
      </p>
    </section>

    <section aria-label="Corsi di laurea magistrale" className="min-w-0 space-y-3">
      {rows.length > 0
        ? <ul className="overflow-hidden rounded-2xl border border-astra-primary/15">
          {rows.map((r, i) => <li key={r.programme.key} className={`flex items-center gap-4 px-5 py-3.5 ${i ? "border-t border-astra-primary/10" : ""}`}>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-astra-primary">{r.programme.name}</p>
              <p className="mt-0.5 text-xs text-astra-primary/60">
                {r.lowest == null ? "Nessuna risposta al sondaggio per questo round" : [
                  `Ammesso più basso ${fmt(r.lowest)}`,
                  r.median != null ? `ammesso medio ${fmt(r.median)} (${r.respondents} risposte)` : null,
                ].filter(Boolean).join(" · ")}
              </p>
              {r.programme.selective && <p className="mt-0.5 text-xs text-astra-primary/45">Serve anche lettera, CV o colloquio</p>}
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${CHANCE[r.chance].pill}`}>{CHANCE[r.chance].label}</span>
          </li>)}
        </ul>
        : <div className="rounded-2xl border border-dashed border-astra-primary/20 px-6 py-12 text-center text-sm text-astra-primary/60">
          Inserisci la tua media per vedere, corso per corso, come si confronta con gli ammessi dell&apos;anno scorso.
        </div>}

      <details className="group overflow-hidden rounded-2xl border border-astra-primary/15">
        <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 hover:bg-astra-light/60 [&::-webkit-details-marker]:hidden">
          <span className="flex-1 text-base font-semibold text-astra-primary">Come funziona l&apos;ammissione</span>
          <ChevronDown size={18} aria-hidden="true" className="text-astra-primary/50 transition-transform group-open:rotate-180" />
        </summary>
        {HOW.map(([title, body]) => <div key={title} className="border-t border-astra-primary/10 px-5 py-4">
          <p className="text-[15px] font-semibold text-astra-primary">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-astra-primary/70">{body}</p>
        </div>)}
      </details>

      <p className="px-1 text-xs leading-relaxed text-astra-primary/55">
        Basato su sondaggi anonimi tra i candidati dell&apos;anno scorso (ASTRA e B.lab Bocconi). Non sono dati ufficiali Bocconi: le risposte possono essere imprecise, non tutti hanno risposto e le soglie cambiano ogni anno.
      </p>
    </section>
  </div>;
}

