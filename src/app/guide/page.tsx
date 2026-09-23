import type { Metadata } from "next";
import { GuideCategoryCard } from "@/components/ui/guide-category-card";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import { GUIDE_CATEGORIES, categoryToParam, guideCoverUrl } from "@/lib/guide-categories";
import { getGuideCounts } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guide",
  description:
    "Le guide ASTRA per la vita universitaria in Bocconi: alloggi, tesi, stage, exchange, associazioni e altro.",
};

export const revalidate = 300;

export default async function GuidePage() {
  const counts = await getGuideCounts();
  const categories = GUIDE_CATEGORIES.filter((c) => (counts[c.slug] ?? 0) > 0);

  return (
    <>
      <SiteHeader active="/guide" />

      <main className="flex-1 bg-white">
        <header className="bg-linear-to-b from-astra-light to-white px-6 pt-[128px] pb-16">
          <div className="mx-auto w-[min(1400px,calc(100%-48px))]">
            <h1 className="text-[clamp(3rem,6.4vw,6rem)] leading-[1.04] font-semibold tracking-[-0.05em] text-astra-primary">
              Guide Universitarie
            </h1>
            <p className="mt-6 max-w-2xl text-[1.15rem] text-[#545d70]">
              Le nostre guide, dagli studenti per gli studenti. Scegli una categoria per
              iniziare.
            </p>
          </div>
        </header>

        <div className="mx-auto w-[min(1400px,calc(100%-48px))] pb-28">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {categories.map((category, i) => (
              <GuideCategoryCard
                key={category.slug}
                title={category.title}
                description={category.description}
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
