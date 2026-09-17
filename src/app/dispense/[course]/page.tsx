import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getHandouts, getMagistrali, normaliseCode, findCourse } from "@/lib/handouts";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import { HandoutsBrowser } from "./handouts-browser";

export const revalidate = 300;

async function resolveCourse(param: string) {
  const code = normaliseCode(param);
  const known = findCourse(code);
  if (known) return known;
  // Magistrali are read from the table, so they are not in the static lists.
  return (await getMagistrali()).find((c) => c.code === code);
}

export async function generateMetadata({
  params,
}: PageProps<"/dispense/[course]">): Promise<Metadata> {
  const { course } = await params;
  const found = await resolveCourse(course);
  if (!found) return { title: "Corso non trovato" };
  return {
    title: `Dispense ${found.name}`,
    description: `Tutte le dispense di ${found.name}, divise per anno, semestre e tipo di esame.`,
  };
}

export default async function CoursePage({
  params,
}: PageProps<"/dispense/[course]">) {
  const { course } = await params;
  const found = await resolveCourse(course);
  if (!found) notFound();

  const handouts = await getHandouts(found.code);

  return (
    <>
      <SiteHeader active="/dispense" />

      <main className="flex-1 bg-white">
      <header className="bg-linear-to-b from-astra-light to-white px-6 pt-14 pb-10">
        <div className="mx-auto w-[min(1400px,calc(100%-48px))]">
          <Link
            href="/dispense"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-astra-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Tutti i corsi
          </Link>
          <h1 className="mt-6 text-[clamp(2.6rem,5vw,4.4rem)] leading-[1] font-semibold tracking-[-0.045em] text-astra-primary">
            {found.name}
          </h1>
        </div>
      </header>

      <div className="mx-auto w-[min(1400px,calc(100%-48px))] pb-28">
        {handouts.length === 0 ? (
          <p className="text-sm text-gray-500">
            Non ci sono ancora dispense per questo corso.
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
