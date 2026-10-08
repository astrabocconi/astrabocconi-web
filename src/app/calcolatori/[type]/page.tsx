import { notFound } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";
import { GraduationCalculator } from "@/components/calculators/graduation-calculator";
import { CALCULATORS } from "@/components/calculators/calculator-cards";

export function generateStaticParams() { return CALCULATORS.map(({ type }) => ({ type })); }
export async function generateMetadata({ params }: PageProps<"/calcolatori/[type]">) {
  const { type } = await params;
  return { title: `Calcolatore ${CALCULATORS.find(c => c.type === type)?.name ?? "laurea"}` };
}
export default async function CalculatorPage({ params }: PageProps<"/calcolatori/[type]">) {
  const { type } = await params;
  const calculator = CALCULATORS.find(c => c.type === type);
  if (!calculator) notFound();
  return <><SiteHeader active="/calcolatori" /><main className="mx-auto w-[min(1280px,calc(100%-32px))] flex-1 pt-32 pb-24 sm:w-[min(1280px,calc(100%-48px))]">
    <GraduationCalculator key={calculator.type} type={calculator.type} />
  </main><SiteFooter /></>;
}
