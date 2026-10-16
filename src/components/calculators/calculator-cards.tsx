"use client";

import Link from "@/i18n/link";
import { ArrowUpRight } from "lucide-react";
import { AstraLogo } from "@/components/ui/logo";
import { CALC_TYPES, calculatorCopy } from "@/i18n/copy/calculators";
import { useLang } from "@/i18n/locale-context";

export function CalculatorCards({ className = "" }: { className?: string }) {
  const c = calculatorCopy[useLang()];
  const CARDS = [
    ...CALC_TYPES.map(type => ({ href: `/calcolatori/${type}`, name: c.types[type].name, detail: c.types[type].detail, left: c.types[type].years, right: c.types[type].credits })),
    { href: "/calcolatori/ammissioni-magistrale", ...c.admissionsCard },
  ];
  return <div className={`grid gap-5 sm:grid-cols-2 xl:grid-cols-4 ${className}`}>
    {CARDS.map((item, index) => {
      // Checkerboard in the 2x2 grid, symmetric in the single row.
      const dark = index === 1 || index === 2;
      return <Link key={item.href} href={item.href}
        className="group overflow-hidden rounded-2xl border border-astra-primary/15 bg-white text-astra-primary transition-transform duration-300 hover:-translate-y-1">
        <div aria-hidden="true" className={`relative flex h-52 items-center justify-center overflow-hidden ${dark ? "bg-astra-primary text-white" : "bg-astra-light"}`}>
          <div className={`absolute h-40 w-40 rounded-full border ${dark ? "border-white/20" : "border-astra-primary/20"}`} />
          <div className={`absolute h-60 w-60 rounded-full border ${dark ? "border-white/10" : "border-astra-primary/10"}`} />
          <AstraLogo size={128} className="relative transition-transform duration-500 group-hover:scale-105" />
          <span className="absolute bottom-5 left-6 text-xs font-bold tracking-widest uppercase">{item.left}</span>
          <span className="absolute right-6 bottom-5 text-xs font-bold tracking-widest uppercase">{item.right}</span>
          <span className="absolute top-8 right-10 h-3 w-3 rounded-full bg-astra-gold" />
        </div>
        <div className="flex items-center justify-between gap-4 p-6">
          <div className="min-w-0"><h3 className="text-2xl font-bold">{item.name}</h3><p className="mt-1 text-sm text-astra-primary/65">{item.detail}</p></div>
          <ArrowUpRight className="h-6 w-6 shrink-0" />
        </div>
      </Link>;
    })}
  </div>;
}
