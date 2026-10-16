import type { Metadata } from "next";
import { toLocale, type Locale } from "@/i18n/config";
import { dispenseCopy } from "@/i18n/copy/dispense";
import { CourseCard } from "@/components/ui/course-card";
import { RotatingWords } from "@/components/ui/rotating-words";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import { courseCoverUrl } from "@/lib/course-covers";
import { ALTRO, TRIENNALI, getCourseCounts, getMagistrali, type Course } from "@/lib/handouts";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = dispenseCopy[toLocale((await params).lang)];
  return { title: c.metaTitle, description: c.metaDescription };
}

export const revalidate = 300;

function CourseGrid({
  courses,
  counts,
  priority = false,
  lang,
}: {
  lang: Locale;
  courses: Course[];
  counts: Record<string, number>;
  priority?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {courses.map((course, i) => (
        <CourseCard
          key={course.code}
          name={dispenseCopy[lang].courseNames[course.code] ?? course.name}
          href={`/dispense/${course.code.toLowerCase()}`}
          cover={courseCoverUrl(course.code)}
          empty={(counts[course.code] ?? 0) === 0}
          priority={priority && i < 5}
        />
      ))}
    </div>
  );
}

export default async function DispensePage({ params }: Props) {
  const lang = toLocale((await params).lang);
  const c = dispenseCopy[lang];
  const [counts, magistrali] = await Promise.all([getCourseCounts(), getMagistrali()]);

  return (
    <>
      <SiteHeader active="/dispense" />

      <main className="flex-1 bg-white">
        <header className="bg-linear-to-b from-astra-light to-white px-6 pt-[128px] pb-16">
          <div className="mx-auto w-[min(1400px,calc(100%-48px))]">
            <h1 className="text-[clamp(3rem,6.4vw,6rem)] leading-[1.04] font-semibold tracking-[-0.05em] text-astra-primary">
              {c.heroPrefix} <RotatingWords words={c.rotating} />
            </h1>
            <p className="mt-6 text-[1.15rem] text-[#545d70]">
              {c.heroSub}
            </p>
          </div>
        </header>

        <div className="mx-auto w-[min(1400px,calc(100%-48px))] pb-28">
          <section>
            <h2 className="mb-10 text-sm font-semibold tracking-wide text-gray-500 uppercase">
              {c.triennali}
            </h2>
            <CourseGrid lang={lang} courses={TRIENNALI} counts={counts} priority />
          </section>

          {magistrali.length > 0 && (
            <section className="mt-24">
              <h2 className="mb-10 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                {c.magistrali}
              </h2>
              <CourseGrid lang={lang} courses={magistrali} counts={counts} />
            </section>
          )}

          <section className="mt-24">
            <h2 className="mb-10 text-sm font-semibold tracking-wide text-gray-500 uppercase">
              {c.altro}
            </h2>
            <CourseGrid lang={lang} courses={ALTRO} counts={counts} />
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
