import type { Metadata } from "next";
import Link from "@/i18n/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";
import { MasterAdmissions } from "@/components/calculators/master-admissions";
import { toLocale } from "@/i18n/config";
import { calculatorCopy } from "@/i18n/copy/calculators";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { title, description } = calculatorCopy[toLocale((await params).lang)].admissionsPage;
  return { title, description };
}

export default async function MasterAdmissionsPage({ params }: Props) {
  const c = calculatorCopy[toLocale((await params).lang)].admissionsPage;
  return <><SiteHeader active="/calcolatori" /><main className="mx-auto w-[min(1280px,calc(100%-32px))] flex-1 pt-32 pb-24 sm:w-[min(1280px,calc(100%-48px))]">
    <Link href="/calcolatori" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-astra-primary/65 hover:text-astra-primary"><ArrowLeft size={16} />{c.back}</Link>
    <header className="mb-8">
      <p className="mb-2 text-sm text-astra-primary/65">{c.eyebrow}</p>
      <h1 className="text-4xl font-bold tracking-tight text-astra-primary sm:text-5xl">{c.h1}</h1>
    </header>
    <MasterAdmissions />
  </main><SiteFooter /></>;
}
