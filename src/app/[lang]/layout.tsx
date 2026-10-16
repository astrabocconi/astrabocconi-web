import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Shell } from "@/app/shell";
import { LOCALES, isLocale } from "@/i18n/config";
import { LocaleProvider } from "@/i18n/locale-context";

const DESCRIPTION = {
  en: "ASTRA Bocconi: handouts, guides, calculators and resources for Bocconi University students.",
  it: "ASTRA Bocconi: dispense, guide, calcolatori e risorse per gli studenti dell'Università Bocconi.",
};

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    title: { default: "ASTRA Bocconi", template: "%s | ASTRA Bocconi" },
    description: DESCRIPTION[lang],
    alternates: { languages: { en: "/", it: "/it" } },
  };
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <Shell lang={lang}>
      <LocaleProvider lang={lang}>{children}</LocaleProvider>
    </Shell>
  );
}
