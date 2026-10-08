"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { AstraLogo } from "@/components/ui/logo";
import { CALCULATORS } from "./calculator-cards";
import { freshSave, toState, type SavedCalc } from "@/lib/calc-state";
import { PLAN_NAMES, plansFor } from "@/lib/calc-plans";
import { graduation, isGraded, planForTarget, thesisMax, weightedAverage, type CalcType, type CalcState } from "@/lib/grade-calc";

const field = "min-h-11 rounded-xl border border-astra-primary/20 bg-white px-3 py-2 text-base text-astra-primary";
const fmt = (n: number) => n.toLocaleString("it-IT", { maximumFractionDigits: 2 });
const gradeName = (n: number) => n === 31 ? "30 e lode" : String(n);
const rowName = (name: string) => name.startsWith("#") ? `Esame opzionale ${name.slice(1)}` : name;
const defaults = { bachelor: "CLEAM", master: "ACME", clmg: "CLMG" };
const sources = {
  bachelor: "https://didattica.unibocconi.it/tsg/testo.php?comando=Base&edizione=2027&idAnt=28196&idr=28196&strperc=&volume=N3",
  master: "https://www.unibocconi.it/sites/default/files/media/attachments/All%20DR%2077%20del%2031.08.2026%20Regolamento_bienni_26-27.pdf",
  clmg: "https://didattica.unibocconi.it/tsg/testo.php?comando=Base&edizione=2026&idAnt=26590&idr=26590&strperc=&volume=R5",
};

export function GraduationCalculator({ type }: { type: CalcType }) {
  const [saved, setSaved] = useState<SavedCalc>(() => freshSave(type, defaults[type]));
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [year, setYear] = useState(0);
  const [showSimulation, setShowSimulation] = useState(false);
  const [adding, setAdding] = useState(false);
  const key = `astra.web.calculator.v1.${type}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const data = JSON.parse(raw) as SavedCalc;
        if (plansFor(type).includes(data.plan) && data.settings && Array.isArray(data.custom) &&
          Array.isArray(data.removed) && Array.isArray(data.noGrade) && data.grades && data.credits &&
          toState(type, data).rows.every(r => Number.isFinite(r.credits) && r.credits > 0 && r.credits <= 30 &&
            (r.grade === null || (Number.isInteger(r.grade) && r.grade >= 18 && r.grade <= 31)))) {
          // Browser storage is unavailable during SSR; hydrate once after mount.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSaved(data);
        }
      }
    } catch { setStorageError(true); }
    setReady(true);
  }, [key, type]);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(key, JSON.stringify(saved)); }
    catch {
      // Report a failed external write (quota or privacy mode) to the student.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStorageError(true);
    }
  }, [saved, ready, key]);

  const state = useMemo(() => toState(type, saved), [type, saved]);
  const avg = useMemo(() => weightedAverage(state), [state]);
  const result = avg.average === null ? null : graduation(state, avg.average);
  const setting = <K extends keyof SavedCalc["settings"]>(name: K, value: SavedCalc["settings"][K]) =>
    setSaved(s => ({ ...s, settings: { ...s.settings, [name]: value } }));
  const years = [...new Set(state.rows.map(r => r.year))].sort();
  const changePlan = (plan: string) => {
    if (plan === saved.plan) return;
    if ((Object.keys(saved.grades).length || saved.custom.length) && !window.confirm("Cambiare piano elimina i voti inseriti per questo percorso. Continuare?")) return;
    setSaved(freshSave(type, plan)); setYear(0);
  };

  return <>
    <nav aria-label="Percorso di laurea" className="mb-9 flex flex-wrap gap-2">
      {CALCULATORS.map(c => <Link key={c.type} href={`/calcolatori/${c.type}`} aria-current={c.type === type ? "page" : undefined}
        className={`rounded-full px-5 py-2.5 text-sm font-bold ${c.type === type ? "bg-astra-primary text-white" : "bg-astra-light text-astra-primary"}`}>{c.name}</Link>)}
    </nav>
    <div className="mb-10 flex items-center justify-between gap-6">
      <div><p className="mb-2 text-sm text-astra-primary/65">Calcolatore di laurea</p><h1 className="text-5xl font-bold tracking-tight text-astra-primary">{CALCULATORS.find(c => c.type === type)?.name}</h1>
        <p role="status" className="mt-4 text-sm text-astra-primary/65">{!ready ? "Caricamento dei voti…" : storageError ? "Salvataggio locale non disponibile. Tieni aperta questa pagina per conservare i voti." : "I tuoi voti vengono salvati automaticamente in questo browser."}</p></div>
      <AstraLogo size={100} className="hidden shrink-0 text-astra-primary sm:block" />
    </div>
    <div className="mb-7 rounded-2xl bg-astra-primary p-5 text-white lg:hidden" aria-live="polite">
      <p className="text-sm text-white/70">Voto di laurea stimato</p>
      <p className="mt-2 text-5xl font-bold tabular-nums">{result ? result.grade : "…"}<span className="text-xl text-white/60">/110</span></p>
      <p className="mt-3 text-sm">Media {avg.average === null ? "…" : fmt(avg.average)} · {fmt(avg.gradedCredits)}/{fmt(avg.totalCredits)} CFU con voto</p>
      <a href="#tesi-bonus" className="mt-4 inline-block text-sm font-bold underline underline-offset-4">Modifica tesi, bonus e obiettivo</a>
    </div>
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section aria-label="Piano di studi" className="min-w-0">
        <label className="block text-sm font-bold text-astra-primary">Corso di laurea
          <select disabled={!ready} value={saved.plan} onChange={e => changePlan(e.target.value)} className={`${field} mt-2 w-full`}>
            {plansFor(type).map(p => <option key={p} value={p}>{PLAN_NAMES[p] ?? p}</option>)}
          </select>
        </label>
        <p className="mt-3 text-xs leading-relaxed text-astra-primary/65">Piani di riferimento come nell’app ASTRA. Verifica esami e CFU sul tuo piano personale; puoi modificarli qui. 30 e lode vale 31, le idoneità non entrano nella media.</p>
        {state.rows.some(r => r.kind === "s" || r.kind === "i") && <Toggle checked={state.internship} onChange={v => setting("internship", v)} label="Stage curriculare nel piano" detail="Lo slot sostituito dallo stage non contribuisce alla media." />}
        <div className="my-6 flex flex-wrap gap-2" aria-label="Filtra per anno">
          {[0, ...years].map(y => <button key={y} type="button" aria-pressed={year === y} onClick={() => setYear(y)} className={`rounded-full px-4 py-2 text-sm ${year === y ? "bg-astra-primary text-white" : "bg-astra-light text-astra-primary"}`}>{y ? `${y}° anno` : "Tutti"}</button>)}
        </div>
        <fieldset disabled={!ready} className="divide-y divide-astra-primary/10 border-y border-astra-primary/15">
          <legend className="sr-only">Esami e voti</legend>
          {state.rows.filter(r => year === 0 || r.year === year).map(row => {
            const graded = isGraded(row, state);
            return <div key={row.id} className="flex flex-wrap items-center gap-3 py-4">
              <div className="min-w-0 basis-full sm:flex-1 sm:basis-auto"><p className="text-sm leading-snug font-bold text-astra-primary">{rowName(row.name)}</p><p className="mt-1 text-xs text-astra-primary/60">{row.year}° anno{row.module ? ` · Modulo di ${row.module}` : ""}</p></div>
              <label className="text-xs text-astra-primary/65">CFU<input aria-label={`CFU ${rowName(row.name)}`} type="number" min="0.5" max="30" step="0.5" value={row.credits} className={`${field} mt-1 block w-20`}
                onChange={e => { const n = Number(e.target.value); if (n >= 0.5 && n <= 30 && Number.isInteger(n * 2)) setSaved(s => ({ ...s, credits: { ...s.credits, [row.id]: n } })); }} /></label>
              <label className="text-xs text-astra-primary/65">Voto<select aria-label={`Voto ${rowName(row.name)}`} disabled={!graded && !row.noGrade} value={row.noGrade ? "pass" : graded ? row.grade ?? "" : "pass"} className={`${field} mt-1 block w-32`}
                onChange={e => setSaved(s => {
                  const grades = { ...s.grades }; delete grades[row.id];
                  if (e.target.value !== "" && e.target.value !== "pass") grades[row.id] = Number(e.target.value);
                  return { ...s, grades, noGrade: e.target.value === "pass" ? [...s.noGrade.filter(id => id !== row.id), row.id] : s.noGrade.filter(id => id !== row.id) };
                })}>
                <option value="">Da sostenere</option>{Array.from({ length: 14 }, (_, i) => i + 18).map(g => <option key={g} value={g}>{gradeName(g)}</option>)}<option value="pass">Idoneità</option>
              </select></label>
              <button type="button" aria-label={`Rimuovi ${rowName(row.name)}`} onClick={() => setSaved(s => ({ ...s, removed: [...s.removed, row.id] }))} className="mt-5 flex h-11 w-9 items-center justify-center rounded-xl text-astra-primary/50 hover:bg-astra-light"><Trash2 size={17} /></button>
            </div>;
          })}
        </fieldset>
        <div className="mt-5 flex flex-wrap justify-between gap-3">
          <button disabled={!ready} onClick={() => setAdding(v => !v)} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-astra-primary"><Plus size={18} />Aggiungi esame</button>
          <button disabled={!ready} onClick={() => { if (window.confirm("Vuoi cancellare i voti e ripristinare il piano selezionato?")) { setSaved(freshSave(type, saved.plan)); setYear(0); } }} className="inline-flex min-h-11 items-center gap-2 text-sm text-astra-primary/65"><RotateCcw size={15} />Ripristina piano</button>
        </div>
        {adding && <form className="mt-4 grid gap-3 rounded-xl bg-astra-light p-5 sm:grid-cols-[1fr_80px_auto]" onSubmit={e => {
          e.preventDefault(); const data = new FormData(e.currentTarget); const name = String(data.get("name")).trim(); const credits = Number(data.get("credits"));
          if (!name || credits < 0.5 || credits > 30 || !Number.isInteger(credits * 2)) return;
          setSaved(s => ({ ...s, custom: [...s.custom, { id: crypto.randomUUID(), name, credits, year: year || years.at(-1) || 1 }] })); setAdding(false);
        }}><label className="text-xs text-astra-primary">Nome<input name="name" required maxLength={160} className={`${field} mt-1 w-full`} /></label><label className="text-xs text-astra-primary">CFU<input name="credits" type="number" required min="0.5" max="30" step="0.5" defaultValue="6" className={`${field} mt-1 w-full`} /></label><button className="self-end rounded-xl bg-astra-primary px-4 py-3 font-bold text-white">Aggiungi</button><p className="text-xs text-astra-primary/65 sm:col-span-3">Per gli esami in sovrannumero, aggiungi solo i due migliori (a parità di voto, quelli con più CFU).</p></form>}
      </section>
      <aside className="space-y-6 lg:sticky lg:top-28">
        <div className="rounded-2xl bg-astra-primary p-7 text-white" aria-live="polite">
          <div className="flex items-center justify-between"><p className="text-sm text-white/75">Voto di laurea stimato</p><AstraLogo size={36} /></div>
          <p className="mt-4 text-7xl leading-none font-bold tabular-nums">{result ? result.grade : "…"}<span className="text-2xl text-white/60">/110</span></p>
          {result?.lodePossible && <p className="mt-3 font-bold text-astra-gold">Possibile lode, a discrezione della commissione</p>}
          <dl className="mt-7 grid grid-cols-2 gap-4 border-t border-white/20 pt-5 text-sm"><div><dt className="text-white/65">Media ponderata</dt><dd className="mt-1 text-xl font-bold">{avg.average === null ? "…" : fmt(avg.average)}<span className="text-sm font-normal"> /30</span></dd></div><div><dt className="text-white/65">CFU con voto</dt><dd className="mt-1 text-xl font-bold">{fmt(avg.gradedCredits)}<span className="text-sm font-normal"> /{fmt(avg.totalCredits)}</span></dd></div></dl>
          <p className="mt-5 text-xs leading-relaxed text-white/70">{result ? `${fmt(result.base)} base + ${result.extras} punti. Stima mantenendo la media attuale; voto arrotondato all’intero più vicino.` : "Inserisci il primo voto per vedere la tua stima."}</p>
        </div>
        <fieldset id="tesi-bonus" disabled={!ready} className="scroll-mt-28 rounded-2xl border border-astra-primary/15 p-6">
          <legend className="px-2 text-lg font-bold text-astra-primary">Tesi e bonus</legend>
          {type === "master" && <label className="block text-sm text-astra-primary">Tipo di tesi<select value={state.thesisType} className={`${field} mt-2 w-full`} onChange={e => setSaved(s => ({ ...s, settings: { ...s.settings, thesisType: e.target.value as "research" | "applied", thesis: Math.min(s.settings.thesis, e.target.value === "applied" ? 5 : 8) } }))}><option value="research">Ricerca</option><option value="applied">Descrittiva / applicativa</option></select></label>}
          <label className="mt-4 block text-sm text-astra-primary">Punti {type === "bachelor" ? "lavoro finale" : "tesi"}: <strong>{state.thesis}</strong><input className="mt-4 w-full accent-astra-primary" type="range" min="0" max={thesisMax(state)} step="1" value={state.thesis} onChange={e => setting("thesis", Number(e.target.value))} /><span className="flex justify-between text-xs text-astra-primary/60"><span>0</span><span>{thesisMax(state)} punti</span></span></label>
          {type === "bachelor" && <Toggle checked={state.bonus} onChange={v => setting("bonus", v)} label="Esperienza curriculare (+1)" detail="Stage, legal clinic BGL o programma internazionale riconosciuto. Bonus non cumulabili; Free Mover escluso." />}
          {type === "clmg" && <Toggle checked={state.bonus} onChange={v => setting("bonus", v)} label="Curriculum eccellente (+1)" detail="Stage, moot court, legal clinic o programma lungo all’estero riconosciuto. Tesi e bonus: massimo 6 punti." />}
          {type === "master" && <><Toggle checked={state.onTime} onChange={v => setting("onTime", v)} label="Laurea in corso (+1)" detail="Nelle prime due sessioni del secondo anno regolare: luglio o ottobre." /><Toggle checked={state.athlete} onChange={v => setting("athlete", v)} label="Studente atleta (+1)" detail="Status studente-atleta e medaglia nazionale o internazionale di alto livello (regolamento 2026-27). Tesi e bonus: massimo 8 punti." /></>}
        </fieldset>
        <section className="rounded-2xl border border-astra-primary/15 p-6">
          <button onClick={() => setShowSimulation(v => !v)} aria-expanded={showSimulation} className="flex w-full items-center justify-between gap-3 text-left text-lg font-bold text-astra-primary">Quali voti mi servono?<Plus size={20} /></button>
          {showSimulation && <><label className="mt-5 block text-sm text-astra-primary">Obiettivo<select value={state.target} onChange={e => setting("target", Number(e.target.value))} className={`${field} mt-2 w-full`}>{Array.from({ length: 46 }, (_, i) => 66 + i).map(g => <option key={g} value={g}>{g === 111 ? "110 e lode" : `${g}/110`}</option>)}</select></label><Simulation state={state} /></>}
        </section>
        <p className="text-xs leading-relaxed text-astra-primary/65">La lode richiede anche l’assenza di sanzioni disciplinari pari o superiori a 6 mesi. Il risultato è una simulazione, l’assegnazione spetta alla commissione. <a className="underline underline-offset-2" href={sources[type]} target="_blank" rel="noopener noreferrer">Consulta le regole Bocconi</a>.</p>
      </aside>
    </div>
  </>;
}

function Toggle({ checked, onChange, label, detail }: { checked: boolean; onChange: (v: boolean) => void; label: string; detail: string }) {
  return <label className="mt-5 flex cursor-pointer items-start gap-3 text-astra-primary"><input className="mt-0.5 h-5 w-5 shrink-0 accent-astra-primary" type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} /><span className="text-sm"><span className="font-bold">{label}</span><span className="mt-1 block text-xs leading-relaxed text-astra-primary/65">{detail}</span></span></label>;
}

function Simulation({ state }: { state: CalcState }) {
  const sim = useMemo(() => planForTarget(state), [state]);
  const lodeBlocked = state.target === 111 && ((state.type === "bachelor" && state.thesis < 3) || (state.type === "clmg" && state.thesis + Number(state.bonus) < 6));
  const remaining = weightedAverage(state).remaining;
  return <div className="mt-4 space-y-3 text-sm leading-relaxed text-astra-primary" aria-live="polite">
    {lodeBlocked ? <p>Per la lode servono {state.type === "bachelor" ? "almeno 3 punti al lavoro finale" : "6 punti complessivi tra tesi e curriculum"}. Modifica i punti ipotizzati per simulare questo obiettivo.</p>
      : sim.noneLeft ? <p>Hai inserito tutti i voti. Controlla la stima e i punti tesi.</p>
      : sim.impossible ? <p>Con questi punti tesi e bonus, l’obiettivo non è raggiungibile neanche con tutti 30 e lode.</p>
      : sim.alreadySafe ? <p>L’obiettivo è raggiungibile anche con 18 in tutti gli esami rimanenti, mantenendo i punti tesi e bonus selezionati.</p>
      : <><p>Ti serve una media di <strong>{fmt(sim.neededAverage)}</strong> nei {remaining.length} esami rimanenti.</p><p>Un’opzione: <strong>{gradeName(sim.uniform!)}</strong> in ogni esame.</p>
        {sim.mixes.map(m => <p key={`${m.high}-${m.low}-${m.highCount}`} className="border-t border-astra-primary/10 pt-3"><strong>{gradeName(m.high)}</strong> in {remaining.filter((_, i) => m.grades[i] === m.high).map(r => rowName(r.name)).join(", ")}; <strong>{gradeName(m.low)}</strong> negli altri.</p>)}
        <p className="text-xs text-astra-primary/60">{fmt(sim.combinations.reaching / sim.combinations.total * 100)}% delle combinazioni di voto raggiunge la soglia: non è una probabilità di successo.</p></>}
    {state.rows.some(r => r.module) && <p className="text-xs text-astra-primary/60">La simulazione sui voti rimanenti è indicativa: l’arrotondamento dei moduli integrati può modificare il risultato finale.</p>}
  </div>;
}
