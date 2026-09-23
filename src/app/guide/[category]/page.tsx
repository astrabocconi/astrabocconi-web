import Link from "next/link";
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

export async function generateMetadata({
  params,
}: PageProps<"/guide/[category]">): Promise<Metadata> {
  const { category } = await params;
  const found = findGuideCategory(paramToCategory(category));
  if (!found) return { title: "Categoria non trovata" };
  return { title: found.title, description: found.description };
}

export default async function GuideCategoryPage({
  params,
}: PageProps<"/guide/[category]">) {
  const { category } = await params;
  const found = findGuideCategory(paramToCategory(category));
  if (!found) notFound();

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
              Tutte le guide
            </Link>
            <h1 className="mt-6 text-[clamp(2.6rem,5vw,4.4rem)] leading-[1] font-semibold tracking-[-0.045em] text-astra-primary">
              {found.title}
            </h1>
            <p className="mt-3 max-w-xl text-[1.05rem] text-[#545d70]">{found.description}</p>
          </div>
        </header>

        <div className="mx-auto w-[min(1400px,calc(100%-48px))] pb-28">
          {guides.length === 0 ? (
            <p className="text-sm text-gray-500">Non ci sono ancora guide in questa categoria.</p>
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
