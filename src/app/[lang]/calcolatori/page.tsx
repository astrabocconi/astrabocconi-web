import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";
import { CalculatorCards } from "@/components/calculators/calculator-cards";
import { toLocale } from "@/i18n/config";
import { calculatorCopy } from "@/i18n/copy/calculators";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { title, description } = calculatorCopy[toLocale((await params).lang)].hub;
  return { title, description };
}

export default async function CalculatorsPage({ params }: Props) {
  const c = calculatorCopy[toLocale((await params).lang)].hub;
  return <><SiteHeader active="/calcolatori" /><main className="mx-auto w-[min(1280px,calc(100%-32px))] flex-1 pt-36 pb-24 sm:w-[min(1280px,calc(100%-48px))]">
    <p className="mb-3 text-sm font-semibold text-astra-primary/65">{c.eyebrow}</p>
    <h1 className="max-w-3xl text-4xl leading-tight font-bold tracking-tight text-astra-primary sm:text-5xl">{c.h1}</h1>
    <p className="mt-6 max-w-xl text-lg text-astra-primary/65">{c.lead}</p>
    <CalculatorCards className="mt-12" />
  </main><SiteFooter /></>;
}
