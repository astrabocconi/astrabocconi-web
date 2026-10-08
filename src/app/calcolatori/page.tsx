import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";
import { CalculatorCards } from "@/components/calculators/calculator-cards";

export const metadata: Metadata = { title: "Calcolatori di laurea" };

export default function CalculatorsPage() {
  return <><SiteHeader active="/calcolatori" /><main className="mx-auto w-[min(1280px,calc(100%-48px))] flex-1 pt-36 pb-24">
    <h1 className="max-w-3xl text-5xl leading-tight font-bold tracking-tight text-astra-primary">Il tuo prossimo traguardo, voto per voto.</h1>
    <p className="mt-6 max-w-xl text-lg text-astra-primary/65">Scegli il tuo percorso. Inserisci i voti, calcola la media e scopri quanto manca al tuo obiettivo.</p>
    <CalculatorCards className="mt-12" />
  </main><SiteFooter /></>;
}
