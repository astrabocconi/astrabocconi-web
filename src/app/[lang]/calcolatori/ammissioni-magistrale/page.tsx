import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site/site-chrome";
import { MasterAdmissions } from "@/components/calculators/master-admissions";

export const metadata: Metadata = {
  title: "Ammissioni magistrali",
  description: "Calcola il tuo punteggio di ammissione alle lauree magistrali Bocconi e confrontalo con gli ammessi dell'anno scorso.",
};

export default function MasterAdmissionsPage() {
  return <><SiteHeader active="/calcolatori" /><main className="mx-auto w-[min(1280px,calc(100%-32px))] flex-1 pt-32 pb-24 sm:w-[min(1280px,calc(100%-48px))]">
    <Link href="/calcolatori" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-astra-primary/65 hover:text-astra-primary"><ArrowLeft size={16} />Tutti i calcolatori</Link>
    <header className="mb-8">
      <p className="mb-2 text-sm text-astra-primary/65">Dove può portarti il tuo punteggio</p>
      <h1 className="text-4xl font-bold tracking-tight text-astra-primary sm:text-5xl">Ammissioni magistrali</h1>
    </header>
    <MasterAdmissions />
  </main><SiteFooter /></>;
}
