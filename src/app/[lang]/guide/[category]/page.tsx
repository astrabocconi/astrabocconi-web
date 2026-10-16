import Link from "@/i18n/link";
import { toLocale } from "@/i18n/config";
import { guideCopy } from "@/i18n/copy/guide";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { GuideFileCard } from "@/components/ui/guide-file-card";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import {
  GUIDE_CATEGORIES,
  categoryToParam,
  findGuideCategory,
  paramToCategory,
} from "@/lib/guide-categories";
import { getGuides } from "@/lib/guides";

export const revalidate = 300;

export function generateStaticParams() {
  return GUIDE_CATEGORIES.map((c) => ({ category: categoryToParam(c.slug) }));
}

type Props = { params: Promise<{ lang: string; category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, category } = await params;
  const c = guideCopy[toLocale(lang)];
  const found = findGuideCategory(paramToCategory(category));
  if (!found) return { title: c.categoryNotFound };
  const t = c.categories[found.slug] ?? found;
  return { title: t.title, description: t.description };
}

export default async function GuideCategoryPage({ params }: Props) {
  const { lang, category } = await params;
  const c = guideCopy[toLocale(lang)];
  const found = findGuideCategory(paramToCategory(category));
  if (!found) notFound();
  const t = c.categories[found.slug] ?? found;

  const guides = await getGuides(found.slug);

  return (
    <>
      <SiteHeader active="/guide" />

      <main className="flex-1 bg-white">
        <header className="bg-linear-to-b from-astra-light to-white px-6 pt-[120px] pb-10">
          <div className="mx-auto w-[min(1400px,calc(100%-48px))]">
            <Link
              href="/guide"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-astra-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              {c.allGuides}
            </Link>
            <h1 className="mt-6 text-[clamp(2.6rem,5vw,4.4rem)] leading-[1] font-semibold tracking-[-0.045em] text-astra-primary">
              {t.title}
            </h1>
            <p className="mt-3 max-w-xl text-[1.05rem] text-[#545d70]">{t.description}</p>
          </div>
        </header>

        <div className="mx-auto w-[min(1400px,calc(100%-48px))] pb-28">
          {guides.length === 0 ? (
            <p className="text-sm text-gray-500">{c.noGuidesYet}</p>
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {guides.map((guide, i) => (
                <li key={guide.id}>
                  <GuideFileCard guide={guide} priority={i < 5} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
