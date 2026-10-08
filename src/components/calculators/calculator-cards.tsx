import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AstraLogo } from "@/components/ui/logo";

export const CALCULATORS = [
  { type: "bachelor", name: "Bachelor", detail: "Laurea triennale", years: "3 anni", credits: "180 CFU" },
  { type: "master", name: "Master", detail: "Laurea magistrale", years: "2 anni", credits: "120 CFU" },
  { type: "clmg", name: "CLMG", detail: "Giurisprudenza", years: "5 anni", credits: "300 CFU" },
] as const;

export function CalculatorCards({ className = "" }: { className?: string }) {
  return <div className={`grid gap-5 md:grid-cols-3 ${className}`}>
    {CALCULATORS.map((item, index) => <Link key={item.type} href={`/calcolatori/${item.type}`}
      className="group overflow-hidden rounded-2xl border border-astra-primary/15 bg-white text-astra-primary transition-transform duration-300 hover:-translate-y-1">
      <div aria-hidden="true" className={`relative flex h-56 items-center justify-center overflow-hidden ${index === 1 ? "bg-astra-primary text-white" : "bg-astra-light"}`}>
        <div className={`absolute h-44 w-44 rounded-full border ${index === 1 ? "border-white/20" : "border-astra-primary/20"}`} />
        <div className={`absolute h-64 w-64 rounded-full border ${index === 1 ? "border-white/10" : "border-astra-primary/10"}`} />
        <AstraLogo size={144} className="relative transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute bottom-5 left-6 text-xs font-bold tracking-widest uppercase">{item.years}</span>
        <span className="absolute right-6 bottom-5 text-xs font-bold tracking-widest">{item.credits}</span>
        <span className="absolute top-8 right-10 h-3 w-3 rounded-full bg-astra-gold" />
      </div>
      <div className="flex items-center justify-between gap-4 p-6">
        <div><h3 className="text-2xl font-bold">{item.name}</h3><p className="mt-1 text-sm text-astra-primary/65">{item.detail}</p></div>
        <ArrowUpRight className="h-6 w-6" />
      </div>
    </Link>)}
  </div>;
}
