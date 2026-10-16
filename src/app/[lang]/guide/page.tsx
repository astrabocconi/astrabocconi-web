import type { Metadata } from "next";
import { toLocale } from "@/i18n/config";
import { guideCopy } from "@/i18n/copy/guide";
import { GuideCategoryCard } from "@/components/ui/guide-category-card";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import { GUIDE_CATEGORIES, categoryToParam, guideCoverUrl } from "@/lib/guide-categories";
import { getGuideCounts } from "@/lib/guides";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = guideCopy[toLocale((await params).lang)];
  return { title: c.metaTitle, description: c.metaDescription };
}

export const revalidate = 300;

export default async function GuidePage({ params }: Props) {
  const lang = toLocale((await params).lang);
  const c = guideCopy[lang];
  const counts = await getGuideCounts();
  const categories = GUIDE_CATEGORIES.filter((c) => (counts[c.slug] ?? 0) > 0);

  return (
    <>
      <SiteHeader active="/guide" />

      <main className="flex-1 bg-white">
        <header className="bg-linear-to-b from-astra-light to-white px-6 pt-[128px] pb-16">
          <div className="mx-auto w-[min(1400px,calc(100%-48px))]">
            <h1 className="text-[clamp(3rem,6.4vw,6rem)] leading-[1.04] font-semibold tracking-[-0.05em] text-astra-primary">
              {c.heading}
            </h1>
            <p className="mt-6 max-w-2xl text-[1.15rem] text-[#545d70]">
              {c.intro}
            </p>
          </div>
        </header>

        <div className="mx-auto w-[min(1400px,calc(100%-48px))] pb-28">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {categories.map((category, i) => (
              <GuideCategoryCard
                key={category.slug}
                lang={lang}
                title={c.categories[category.slug]?.title ?? category.title}
                description={c.categories[category.slug]?.description ?? category.description}
                href={`/guide/${categoryToParam(category.slug)}`}
                cover={guideCoverUrl(category.slug)}
                priority={i < 5}
              />
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
