import { notFound } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";
import { GraduationCalculator } from "@/components/calculators/graduation-calculator";
import { toLocale } from "@/i18n/config";
import { CALC_TYPES, calculatorCopy } from "@/i18n/copy/calculators";

type Props = { params: Promise<{ lang: string; type: string }> };

export function generateStaticParams() { return CALC_TYPES.map(type => ({ type })); }
export async function generateMetadata({ params }: Props) {
  const { lang, type } = await params;
  const c = calculatorCopy[toLocale(lang)];
  const t = CALC_TYPES.find(x => x === type);
  return { title: c.calcPageTitle(t && c.types[t].name) };
}
export default async function CalculatorPage({ params }: Props) {
  const { type } = await params;
  const calcType = CALC_TYPES.find(t => t === type);
  if (!calcType) notFound();
  return <><SiteHeader active="/calcolatori" /><main className="mx-auto w-[min(1280px,calc(100%-32px))] flex-1 pt-32 pb-24 sm:w-[min(1280px,calc(100%-48px))]">
    <GraduationCalculator key={calcType} type={calcType} />
  </main><SiteFooter /></>;
}
