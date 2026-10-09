"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, Plus, RotateCcw } from "lucide-react";
import { CALCULATORS } from "./calculator-cards";
import { DecimalInput, Segmented, SettingRow, Stepper, Switch, fmt, parseDecimal } from "./controls";
import { calcKey, freshSave, readSaved, toState, writeSaved, type SavedCalc } from "@/lib/calc-state";
import { PLAN_NAMES, defaultPlan, plansFor } from "@/lib/calc-plans";
import {
  graduation, internshipSlotId, isGraded, planForTarget, thesisMax, weightedAverage, LODE, MIN_GRADE,
  type CalcRow, type CalcState, type CalcType,
} from "@/lib/grade-calc";

// Web port of astra-app/apps/mobile/app/calculator.tsx. Same features and
// copy (apps/mobile/lib/i18n/calc.ts, Italian); the layout uses the width:
// exam list on the left, average and the two panels in a sticky column.

const GRADES = Array.from({ length: LODE - MIN_GRADE + 1 }, (_, i) => MIN_GRADE + i); // 18 to 31
const gradeLabel = (g: number) => (g === LODE ? "30L" : String(g));
const SOURCES: Record<CalcType, string> = {
  bachelor: "https://didattica.unibocconi.it/tsg/testo.php?comando=Base&edizione=2027&idAnt=28196&idr=28196&strperc=&volume=N3",
  master: "https://www.unibocconi.it/sites/default/files/media/attachments/All%20DR%2077%20del%2031.08.2026%20Regolamento_bienni_26-27.pdf",
  clmg: "https://didattica.unibocconi.it/tsg/testo.php?comando=Base&edizione=2026&idAnt=26590&idr=26590&strperc=&volume=R5",
};
const RESET = "Ricominciare? Cancella tutti i voti inseriti in questo calcolatore.";

type Setting = <K extends keyof SavedCalc["settings"]>(key: K, value: SavedCalc["settings"][K]) => void;

const omit = (obj: Record<string, number>, key: string) =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => k !== key));

/** A save from localStorage is user-controlled input: check its shape before trusting it. */
function validSave(type: CalcType, data: SavedCalc | null): data is SavedCalc {
  try {
    return !!data && plansFor(type).includes(data.plan) && !!data.settings && Array.isArray(data.custom) &&
      Array.isArray(data.removed) && Array.isArray(data.noGrade) && !!data.grades && !!data.credits &&
      toState(type, data).rows.every(r => Number.isFinite(r.credits) && r.credits > 0 && r.credits <= 30 &&
        (r.grade === null || (Number.isInteger(r.grade) && r.grade >= MIN_GRADE && r.grade <= LODE)));
  } catch {
    return false;
  }
}

export function GraduationCalculator({ type }: { type: CalcType }) {
  const [saved, setSaved] = useState<SavedCalc>(() => freshSave(type, defaultPlan(type)));
  const [ready, setReady] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [panel, setPanel] = useState<"graduation" | "simulate">("graduation");

  useEffect(() => {
    const data = readSaved<SavedCalc>(calcKey(type));
    // Browser storage is unavailable during SSR; hydrate once after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (validSave(type, data)) setSaved(data);
    setReady(true);
  }, [type]);

  useEffect(() => {
    // Report a failed write (quota or privacy mode) to the student.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ready) setStorageOk(writeSaved(calcKey(type), saved));
  }, [saved, ready, type]);

  const state = useMemo(() => toState(type, saved), [type, saved]);
  const avg = weightedAverage(state);
  const patch = (fn: (s: SavedCalc) => SavedCalc) => setSaved(fn);
  const setting: Setting = (key, value) => patch(s => ({ ...s, settings: { ...s.settings, [key]: value } }));

  const slotId = internshipSlotId(state);
  const hasInternship = state.rows.some(r => r.kind === "s" || r.kind === "i");
  const rowName = (r: CalcRow) => {
    if (r.kind === "s" && state.internship && r.id === slotId) return "Stage";
    if (r.kind === "i") return state.internship ? r.name : "Opzionale (al posto dello stage)";
    const slot = /^#(\d+)$/.exec(r.name);
    return slot ? `Opzionale ${slot[1]}` : r.name;
  };
  const slotRow = state.rows.find(r => r.id === slotId);
  const years = [...new Set(state.rows.map(r => r.year))].sort((a, b) => a - b);
  const current = CALCULATORS.find(c => c.type === type)!;

  function changePlan(plan: string) {
    if (plan === saved.plan) return;
    if (Object.keys(saved.grades).length && !window.confirm(RESET)) return;
    setSaved(freshSave(type, plan));
    setEditing(null);
  }

  function addExam() {
    const id = `c${crypto.randomUUID()}`; // the "c" prefix marks an exam the student added
    const year = years.at(-1) ?? 1;
    patch(s => ({ ...s, custom: [...s.custom, { id, name: "Nuovo esame", credits: 6, year }] }));
    setEditing(id);
  }

  const averageCard = (className: string) => <div className={`rounded-3xl bg-astra-primary p-6 text-white ${className}`} aria-live="polite">
    <p className="text-sm text-white/70">Media ponderata</p>
    <p className="mt-1 text-6xl leading-none font-bold tabular-nums">{avg.average == null ? "…" : fmt(avg.average)}</p>
    <p className="mt-3 text-sm text-white/70">
      {avg.average == null ? "Aggiungi i tuoi voti qui sotto" : [
        `${fmt(avg.gradedCredits, 0)} di ${fmt(avg.totalCredits, 0)} crediti con voto`,
        `${fmt((avg.average / 30) * 110, 1)} su 110`,
        avg.lodeCount ? `${avg.lodeCount} × 30 e lode` : null,
      ].filter(Boolean).join("  ·  ")}
    </p>
  </div>;

  return <>
    <nav aria-label="Tipo di laurea" className="mb-8 flex flex-wrap gap-2">
      {CALCULATORS.map(c => <Link key={c.type} href={`/calcolatori/${c.type}`} aria-current={c.type === type ? "page" : undefined}
        className={`rounded-full px-5 py-2.5 text-sm font-bold ${c.type === type ? "bg-astra-primary text-white" : "bg-astra-light text-astra-primary hover:bg-astra-primary/10"}`}>{c.tab}</Link>)}
    </nav>
    <header className="mb-8">
      <p className="mb-2 text-sm text-astra-primary/65">Calcolatore voti</p>
      <h1 className="text-4xl font-bold tracking-tight text-astra-primary sm:text-5xl">{current.detail}</h1>
      <p role="status" className="mt-3 text-sm text-astra-primary/65">
        {!ready ? "Caricamento dei voti…" : storageOk ? "Salvato in questo browser mentre scrivi" : "Salvataggio non disponibile in questo browser: tieni aperta la pagina per non perdere i voti."}
      </p>
    </header>

    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
      <section aria-label="Esami e voti" className="min-w-0">
        <label className="block rounded-2xl border border-astra-primary/15 px-5 py-3">
          <span className="text-xs text-astra-primary/60">Corso di laurea</span>
          <span className="relative mt-0.5 block">
            <select disabled={!ready} value={saved.plan} onChange={e => changePlan(e.target.value)}
              className="w-full appearance-none bg-transparent pr-8 text-base font-semibold text-astra-primary outline-none">
              {plansFor(type).map(p => <option key={p} value={p}>{PLAN_NAMES[p] ?? p}</option>)}
            </select>
            <ChevronDown size={18} aria-hidden="true" className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 text-astra-primary/50" />
          </span>
        </label>

        {averageCard("mt-3 lg:hidden")}

        {hasInternship && <div className="mt-3 overflow-hidden rounded-2xl border border-astra-primary/15">
          <SettingRow first title="Stage" sub={state.rows.some(r => r.kind === "i")
            ? (state.internship ? "Conta come crediti senza voto" : "Disattivato: al suo posto c'è un opzionale")
            : state.internship && slotRow ? `Sostituisce ${rowName({ ...slotRow, kind: "o" })}. Senza voto, e vale il bonus di +1`
            : "Fai uno stage curriculare? Sostituisce un opzionale"}>
            <Switch label="Stage" checked={state.internship} onChange={on => patch(s => ({
              ...s,
              // The replaced optional's grade no longer counts; drop it.
              grades: on && slotId ? omit(s.grades, slotId) : s.grades,
              // A curricular internship is what earns the +1 (bachelor, CLMG).
              settings: { ...s.settings, internship: on, bonus: type !== "master" && on ? true : s.settings.bonus },
            }))} />
          </SettingRow>
        </div>}

        <fieldset disabled={!ready}>
          <legend className="sr-only">Esami e voti</legend>
          {years.map(year => <div key={year} className="mt-7">
            <h2 className="mb-2 text-xs font-semibold tracking-wide text-astra-primary/50 uppercase">{year}° anno</h2>
            <ul className="overflow-hidden rounded-2xl border border-astra-primary/15">
              {state.rows.filter(r => r.year === year).map((r, i) => <ExamRow key={r.id} row={r} state={state} name={rowName(r)} first={i === 0}
                open={editing === r.id} onToggle={() => setEditing(editing === r.id ? null : r.id)}
                removable={type === "master" || r.id.startsWith("c")}
                onGrade={grade => {
                  patch(s => ({ ...s, grades: grade == null ? omit(s.grades, r.id) : { ...s.grades, [r.id]: grade }, noGrade: s.noGrade.filter(x => x !== r.id) }));
                  if (grade != null) setEditing(null);
                }}
                onNoGrade={on => patch(s => ({ ...s, grades: on ? omit(s.grades, r.id) : s.grades, noGrade: on ? [...s.noGrade, r.id] : s.noGrade.filter(x => x !== r.id) }))}
                onCredits={credits => patch(s => ({ ...s, credits: { ...s.credits, [r.id]: credits } }))}
                onRename={name => patch(s => ({ ...s, custom: s.custom.map(c => (c.id === r.id ? { ...c, name } : c)) }))}
                onRemove={() => {
                  setEditing(null);
                  patch(s => ({
                    ...s,
                    removed: r.id.startsWith("c") ? s.removed : [...s.removed, r.id],
                    custom: s.custom.filter(c => c.id !== r.id),
                    grades: omit(s.grades, r.id),
                  }));
                }} />)}
            </ul>
          </div>)}
        </fieldset>

        <button type="button" disabled={!ready} onClick={addExam}
          className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-astra-primary/25 text-sm font-semibold text-astra-primary hover:bg-astra-light">
          <Plus size={18} />Aggiungi un esame
        </button>
        <p className="mt-2 text-center text-xs text-astra-primary/55">Esami in sovrannumero: aggiungi solo i due migliori (a parità di voto, quelli con più crediti).</p>
      </section>

      <aside aria-label="Risultati" className="space-y-3 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pb-2">
        {averageCard("hidden lg:block")}
        <Segmented label="Pannello" value={panel} onChange={setPanel} options={[
          { value: "graduation", label: "Voto di laurea" },
          { value: "simulate", label: "Simula un obiettivo" },
        ]} />
        {panel === "graduation"
          ? <GraduationPanel state={state} average={avg.average} direct={saved.direct ?? { on: avg.average == null, average: "" }}
              onDirect={direct => patch(s => ({ ...s, direct }))} setting={setting} />
          : <SimulationPanel state={state} setting={setting} rowName={rowName} />}
        <p className="px-1 pt-2 text-xs leading-relaxed text-astra-primary/55">
          Una stima basata sui regolamenti Bocconi. Il voto ufficiale è quello della commissione.{" "}
          <a className="underline underline-offset-2" href={SOURCES[type]} target="_blank" rel="noopener noreferrer">Le regole Bocconi</a>
        </p>
        <button type="button" disabled={!ready} onClick={() => { if (window.confirm(RESET)) { setSaved(freshSave(type, saved.plan)); setEditing(null); } }}
          className="inline-flex min-h-10 items-center gap-2 px-1 text-sm font-medium text-red-700 hover:underline">
          <RotateCcw size={15} />Ricomincia
        </button>
      </aside>
    </div>
  </>;
}

function ExamRow({ row, state, name, first, open, removable, onToggle, onGrade, onNoGrade, onCredits, onRename, onRemove }: {
  row: CalcRow; state: CalcState; name: string; first: boolean; open: boolean; removable: boolean;
  onToggle: () => void; onGrade: (g: number | null) => void; onNoGrade: (on: boolean) => void;
  onCredits: (n: number) => void; onRename: (name: string) => void; onRemove: () => void;
}) {
  const graded = isGraded(row, state);
  const replaced = row.kind === "s" && !graded && !row.noGrade;
  const custom = row.id.startsWith("c");
  const action = (label: string, onClick: () => void, destructive?: boolean) =>
    <button type="button" onClick={onClick} className={`rounded-xl px-3 py-2 text-sm font-semibold hover:bg-astra-light ${destructive ? "text-red-700" : "text-astra-primary"}`}>{label}</button>;

  return <li className={first ? "" : "border-t border-astra-primary/10"}>
    <button type="button" disabled={replaced || row.kind === "p"} onClick={onToggle} aria-expanded={open}
      className={`flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors enabled:hover:bg-astra-light/60 ${open ? "bg-astra-light/60" : ""}`}>
      <span className="min-w-0 flex-1">
        <span className={`block text-[15px] leading-snug ${graded ? "font-medium text-astra-primary" : "text-astra-primary/55"}`}>{name}</span>
        <span className="mt-0.5 block text-xs text-astra-primary/50">{fmt(row.credits, row.credits % 1 ? 1 : 0)} crediti{graded ? "" : "  ·  Non entra in media"}</span>
      </span>
      {graded
        ? <span className={`flex h-9 min-w-11 items-center justify-center rounded-xl px-2 text-[15px] font-semibold tabular-nums ${row.grade != null ? "bg-astra-primary text-white" : "bg-astra-light text-astra-primary/40"}`}>
            {row.grade != null ? gradeLabel(row.grade) : "–"}
          </span>
        : <span className="text-xs text-astra-primary/50">{row.kind === "p" || row.noGrade ? "Idoneità" : "Senza voto"}</span>}
    </button>
    {open && <div className="border-t border-astra-primary/10 bg-astra-light/40 px-5 py-4">
      {custom && <input value={row.name} onChange={e => onRename(e.target.value)} autoFocus onFocus={e => e.target.select()} placeholder="Nuovo esame"
        aria-label="Nome dell'esame" maxLength={160} className="mb-3 w-full rounded-xl border border-astra-primary/15 bg-white px-3 py-2.5 text-base text-astra-primary" />}
      {!row.noGrade && <div role="group" aria-label={`Voto di ${name}`} className="grid grid-cols-7 gap-1.5">
        {GRADES.map(g => <button key={g} type="button" aria-pressed={row.grade === g} onClick={() => onGrade(g)}
          className={`h-11 rounded-xl text-base font-semibold tabular-nums transition-colors ${row.grade === g ? "bg-astra-primary text-white" : "bg-white text-astra-primary hover:bg-astra-primary/10"}`}>
          {gradeLabel(g)}
        </button>)}
      </div>}
      {/* Plan exams have fixed credits; only an exam the student added needs them. */}
      {custom && <div className="mt-3 flex items-center justify-between">
        <span className="text-[15px] font-medium text-astra-primary">Crediti</span>
        <Stepper value={row.credits} min={1} max={30} onChange={onCredits} label="Crediti" />
      </div>}
      <div className="mt-3 -ml-3 flex flex-wrap gap-1">
        {row.grade != null && action("Togli il voto", () => onGrade(null))}
        {action(row.noGrade ? "Dagli un voto" : "Senza voto (idoneità o certificazione)", () => onNoGrade(!row.noGrade))}
        {removable && action("Rimuovi questo esame", onRemove, true)}
      </div>
    </div>}
  </li>;
}

function GraduationPanel({ state, average, direct, onDirect, setting }: {
  state: CalcState; average: number | null; direct: NonNullable<SavedCalc["direct"]>;
  onDirect: (direct: NonNullable<SavedCalc["direct"]>) => void; setting: Setting;
}) {
  const max = thesisMax(state);
  // Either the exams entered so far, or an average the student types in.
  const typed = parseDecimal(direct.average);
  const used = direct.on ? (typed != null && typed >= 18 && typed <= 31 ? typed : null) : average;
  const result = used == null ? null : graduation(state, used);
  return <div className="overflow-hidden rounded-2xl border border-astra-primary/15">
    <div className="px-5 pt-4 pb-3">
      <Segmented label="Media da usare" value={direct.on ? "direct" : "exams"} onChange={v => onDirect({ ...direct, on: v === "direct" })} options={[
        { value: "exams", label: "Dai miei esami" },
        { value: "direct", label: "Inserisco la media" },
      ]} />
    </div>
    {direct.on && <SettingRow title="La tua media ponderata" sub="In trentesimi, es. 27,40">
      <DecimalInput value={direct.average} onChange={v => onDirect({ ...direct, average: v })} placeholder="27,40" label="La tua media ponderata" />
    </SettingRow>}
    <ExtrasInputs state={state} setting={setting} thesisTitle="Punti della prova finale" />
    <div className="border-t border-astra-primary/10 bg-astra-light px-5 py-6 text-center" aria-live="polite">
      {result == null
        ? <p className="text-sm text-astra-primary/65">{direct.on ? "Scrivi la tua media qui sopra per vedere il voto" : "Aggiungi i tuoi voti qui sotto"}</p>
        : <>
          <p className="text-xs text-astra-primary/60">Voto di laurea</p>
          <p className="mt-1 text-5xl font-bold text-astra-primary tabular-nums">{result.grade}/110</p>
          {result.lodePossible && <div className="mt-3">
            <p className="inline-block rounded-full bg-astra-gold px-3 py-1 text-sm font-bold text-astra-primary">110 e lode possibile</p>
            <p className="mt-1.5 text-xs text-astra-primary/60">La commissione può assegnare la lode, all&apos;unanimità</p>
          </div>}
          <p className="mt-3 text-xs text-astra-primary/65">
            Media {fmt(result.base, 1)} + prova finale {fmt(Math.min(state.thesis, max), 0)} + bonus {fmt(result.extras - Math.min(state.thesis, max), 0)}
          </p>
          <p className="mt-1 text-[11px] leading-4 text-astra-primary/50">
            {direct.on ? "" : "Se mantieni la media attuale negli esami che ti restano. "}Bocconi non dice come si arrotonda il totale. Noi arrotondiamo al punto più vicino.
          </p>
        </>}
    </div>
  </div>;
}

/** Final paper points and bonuses: they feed both the grade and the simulation. */
function ExtrasInputs({ state, setting, thesisTitle }: { state: CalcState; setting: Setting; thesisTitle: string }) {
  const max = thesisMax(state);
  const toggle = (key: "bonus" | "onTime" | "athlete", title: string, sub: string) =>
    <SettingRow title={title} sub={sub}><Switch label={title} checked={state[key]} onChange={v => setting(key, v)} /></SettingRow>;
  return <>
    {state.type === "master" && <div className="border-t border-astra-primary/10 px-5 pt-4 pb-3">
      <p className="mb-2 text-[15px] font-semibold text-astra-primary">Tipo di tesi</p>
      <Segmented label="Tipo di tesi" value={state.thesisType} onChange={v => {
        setting("thesisType", v);
        if (v === "applied" && state.thesis > 5) setting("thesis", 5);
      }} options={[{ value: "research", label: "Di ricerca" }, { value: "applied", label: "Applicata" }]} />
    </div>}
    <SettingRow title={thesisTitle} sub={state.type === "bachelor" ? "Da 0 a 4, li assegna la commissione"
      : state.type === "clmg" ? "Fino a 6, li assegna la commissione" : `Fino a ${max} per questo tipo di tesi`}>
      <Stepper value={Math.min(state.thesis, max)} min={0} max={max} onChange={n => setting("thesis", n)} label={thesisTitle} />
    </SettingRow>
    {state.type === "bachelor" && toggle("bonus", "Bonus di +1", "Stage, Exchange o Double Degree con un esame riconosciuto, Joint Program")}
    {state.type === "clmg" && toggle("bonus", "+1 curriculum d'eccellenza", "Stage, moot court, legal clinic, Exchange con un esame registrato")}
    {state.type === "master" && toggle("onTime", "+1 laurea in corso", "Sessione di luglio o ottobre del secondo anno")}
    {state.type === "master" && toggle("athlete", "+1 studente-atleta", "Con risultati ufficiali nazionali o internazionali")}
  </>;
}

function SimulationPanel({ state, setting, rowName }: { state: CalcState; setting: Setting; rowName: (r: CalcRow) => string }) {
  const sim = useMemo(() => planForTarget(state), [state]);
  const remaining = state.rows.filter(r => isGraded(r, state) && r.grade == null);
  const pct = (n: number) => `${n.toLocaleString("it-IT", { maximumFractionDigits: 1 })}%`;

  let body: ReactNode;
  if (sim.noneLeft) body = <Note>Nessun esame da dare: il voto dipende dalla prova finale e dal bonus.</Note>;
  else if (sim.impossible) body = <Note>Fuori portata, anche con 30 e lode in ogni esame che resta. Prova un obiettivo più basso o più punti di tesi.</Note>;
  else if (sim.alreadySafe) body = <Note>Ce l&apos;hai già fatta. Anche con 18 in ogni esame che resta arrivi all&apos;obiettivo.</Note>;
  else {
    const { reaching, total } = sim.combinations;
    const share = pct((reaching / total) * 100);
    body = <>
      {/* The answer most students want, stated first and big: one grade to get in every exam left. */}
      {sim.uniform != null && <div className="rounded-2xl bg-astra-primary px-4 py-5 text-center text-white">
        <p className="text-xs font-medium text-white/70">Il modo più semplice</p>
        <p className="mt-1 text-5xl font-bold tabular-nums">{gradeLabel(sim.uniform)}</p>
        <p className="mt-1 text-sm text-white/80">{remaining.length === 1 ? "nel tuo ultimo esame" : `in ognuno dei ${remaining.length} esami che ti restano`}</p>
      </div>}
      {remaining.length > 1 && <p className="mt-3 text-center text-sm text-astra-primary/75">Ti serve una media di {fmt(sim.neededAverage)} nei {remaining.length} esami che ti restano</p>}
      {sim.mixes.length > 0 && <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold tracking-wide text-astra-primary/50 uppercase">Altri modi per arrivarci</p>
        {sim.mixes.map(m => {
          const highRows = remaining.filter((_, i) => m.grades[i] === m.high);
          return <div key={`${m.high}-${m.low}-${m.highCount}`} className="rounded-xl bg-astra-light px-3 py-2.5">
            <p className="text-sm font-medium text-astra-primary">
              {m.highCount === 1
                ? `${gradeLabel(m.high)} in ${rowName(highRows[0]!)}, ${gradeLabel(m.low)} negli altri`
                : `${gradeLabel(m.high)} in ${m.highCount} esami, ${gradeLabel(m.low)} negli altri`}
            </p>
            {m.highCount > 1 && <p className="mt-0.5 line-clamp-2 text-xs text-astra-primary/60">{highRows.map(rowName).join(", ")}</p>}
          </div>;
        })}
      </div>}
      <p className="mt-4 text-xs text-astra-primary/60">
        {total < 1e12
          ? `Funzionano ${reaching.toLocaleString("it-IT")} combinazioni di voti su ${total.toLocaleString("it-IT")} (${share})`
          : `Funziona il ${share} di tutte le combinazioni di voti possibili`}
      </p>
    </>;
  }

  return <div className="overflow-hidden rounded-2xl border border-astra-primary/15 [&>:first-child]:border-t-0">
    {/* The thesis points the student aims for change what the exams need. */}
    <ExtrasInputs state={state} setting={setting} thesisTitle="Punti della prova finale che vuoi ottenere" />
    <SettingRow title="Voto obiettivo">
      <Stepper value={state.target} min={66} max={111} onChange={n => setting("target", n)} label="Voto obiettivo" display={state.target >= 111 ? "110L" : String(state.target)} />
    </SettingRow>
    <div className="border-t border-astra-primary/10 px-5 py-4" aria-live="polite">
      {body}
      {state.target >= 111 && state.type !== "master" && <p className="mt-3 text-xs text-astra-primary/60">
        {state.type === "bachelor" ? "Per la lode servono anche almeno 3 punti alla prova finale." : "Per la lode prova finale e curriculum devono fare 6."}
      </p>}
    </div>
  </div>;
}

function Note({ children }: { children: ReactNode }) {
  return <p className="text-[15px] leading-relaxed text-astra-primary/80">{children}</p>;
}
