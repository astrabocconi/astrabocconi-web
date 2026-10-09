import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";
import { CalculatorCards } from "@/components/calculators/calculator-cards";

export const metadata: Metadata = {
  title: "Calcolatori",
  description: "Media ponderata, voto di laurea e ammissioni magistrali: i calcolatori ASTRA per gli studenti Bocconi.",
};

const NOTES = [
  ["Gli stessi dell'app", "Piani di studio, regole e formule sono quelli dell'app ASTRA, aggiornati dai regolamenti Bocconi."],
  ["Salvati nel browser", "Quello che inserisci resta su questo dispositivo, anche se chiudi la pagina. Non lo vediamo noi."],
  ["Una stima", "Il voto ufficiale è quello della commissione, e le soglie di ammissione cambiano ogni anno."],
];

export default function CalculatorsPage() {
  return <><SiteHeader active="/calcolatori" /><main className="mx-auto w-[min(1280px,calc(100%-32px))] flex-1 pt-36 pb-24 sm:w-[min(1280px,calc(100%-48px))]">
    <p className="mb-3 text-sm font-semibold text-astra-primary/65">Calcolatori</p>
    <h1 className="max-w-3xl text-4xl leading-tight font-bold tracking-tight text-astra-primary sm:text-5xl">Il tuo prossimo traguardo, voto per voto.</h1>
    <p className="mt-6 max-w-xl text-lg text-astra-primary/65">Inserisci i voti, calcola la media e il voto di laurea, scopri quanto manca al tuo obiettivo e dove può portarti per la magistrale.</p>
    <CalculatorCards className="mt-12" />
    <dl className="mt-16 grid gap-8 border-t border-astra-primary/15 pt-10 md:grid-cols-3">
      {NOTES.map(([title, body]) => <div key={title}><dt className="font-bold text-astra-primary">{title}</dt><dd className="mt-2 text-sm leading-relaxed text-astra-primary/65">{body}</dd></div>)}
    </dl>
  </main><SiteFooter /></>;
}
