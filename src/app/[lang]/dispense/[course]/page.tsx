import Link from "@/i18n/link";
import { toLocale } from "@/i18n/config";
import { dispenseCopy } from "@/i18n/copy/dispense";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import {
  ALTRO,
  TRIENNALI,
  getHandouts,
  getMagistrali,
  normaliseCode,
  findCourse,
} from "@/lib/handouts";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import { HandoutsBrowser } from "./handouts-browser";

export const revalidate = 300;

// Without this the route rendered on every request (no-store, ~1-2s TTFB).
// Listing the known courses makes each one a static page refreshed by ISR.
export async function generateStaticParams() {
  const courses = [...TRIENNALI, ...ALTRO, ...(await getMagistrali())];
  return courses.map((c) => ({ course: c.code.toLowerCase() }));
}

async function resolveCourse(param: string) {
  const code = normaliseCode(param);
  const known = findCourse(code);
  if (known) return known;
  // Magistrali are read from the table, so they are not in the static lists.
  return (await getMagistrali()).find((c) => c.code === code);
}

type Props = { params: Promise<{ lang: string; course: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, course } = await params;
  const c = dispenseCopy[toLocale(lang)];
  const found = await resolveCourse(course);
  if (!found) return { title: c.courseNotFound };
  const name = c.courseNames[found.code] ?? found.name;
  return { title: c.courseMetaTitle(name), description: c.courseMetaDescription(name) };
}

export default async function CoursePage({ params }: Props) {
  const { lang, course } = await params;
  const c = dispenseCopy[toLocale(lang)];
  const found = await resolveCourse(course);
  if (!found) notFound();

  const handouts = await getHandouts(found.code);

  return (
    <>
      <SiteHeader active="/dispense" />

      <main className="flex-1 bg-white">
      <header className="bg-linear-to-b from-astra-light to-white px-6 pt-[120px] pb-10">
        <div className="mx-auto w-[min(1400px,calc(100%-48px))]">
          <Link
            href="/dispense"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-astra-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            {c.allCourses}
          </Link>
          <h1 className="mt-6 text-[clamp(2.6rem,5vw,4.4rem)] leading-[1] font-semibold tracking-[-0.045em] text-astra-primary">
            {c.courseNames[found.code] ?? found.name}
          </h1>
        </div>
      </header>

      <div className="mx-auto w-[min(1400px,calc(100%-48px))] pb-28">
        {handouts.length === 0 ? (
          <p className="text-sm text-gray-500">
            {c.noHandoutsYet}
          </p>
        ) : (
          <HandoutsBrowser handouts={handouts} />
        )}
      </div>
      </main>

      <SiteFooter />
    </>
  );
}
