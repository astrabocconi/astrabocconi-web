import type { Metadata } from "next";
import { CourseCard } from "@/components/ui/course-card";
import { RotatingWords } from "@/components/ui/rotating-words";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import { courseCoverUrl } from "@/lib/course-covers";
import { ALTRO, TRIENNALI, getCourseCounts, getMagistrali, type Course } from "@/lib/handouts";

export const metadata: Metadata = {
  title: "Dispense",
  description:
    "Tutte le dispense ASTRA, raccolte corso per corso e divise per anno, semestre e tipo di esame.",
};

export const revalidate = 300;

const ROTATING = ["faster", "better", "smarter", "harder"];

function CourseGrid({
  courses,
  counts,
  priority = false,
}: {
  courses: Course[];
  counts: Record<string, number>;
  priority?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {courses.map((course, i) => (
        <CourseCard
          key={course.code}
          name={course.name}
          href={`/dispense/${course.code.toLowerCase()}`}
          cover={courseCoverUrl(course.code)}
          empty={(counts[course.code] ?? 0) === 0}
          priority={priority && i < 5}
        />
      ))}
    </div>
  );
}

export default async function DispensePage() {
  const [counts, magistrali] = await Promise.all([getCourseCounts(), getMagistrali()]);

  return (
    <>
      <SiteHeader active="/dispense" />

      <main className="flex-1 bg-white">
        <header className="bg-linear-to-b from-astra-light to-white px-6 pt-[128px] pb-16">
          <div className="mx-auto w-[min(1400px,calc(100%-48px))]">
            <h1 className="text-[clamp(3rem,6.4vw,6rem)] leading-[1.04] font-semibold tracking-[-0.05em] text-astra-primary">
              Handouts to study <RotatingWords words={ROTATING} />
            </h1>
            <p className="mt-6 text-[1.15rem] text-[#545d70]">
              By students, for students.
            </p>
          </div>
        </header>

        <div className="mx-auto w-[min(1400px,calc(100%-48px))] pb-28">
          <section>
            <h2 className="mb-10 text-sm font-semibold tracking-wide text-gray-500 uppercase">
              Triennali
            </h2>
            <CourseGrid courses={TRIENNALI} counts={counts} priority />
          </section>

          {magistrali.length > 0 && (
            <section className="mt-24">
              <h2 className="mb-10 text-sm font-semibold tracking-wide text-gray-500 uppercase">
                Magistrali
              </h2>
              <CourseGrid courses={magistrali} counts={counts} />
            </section>
          )}

          <section className="mt-24">
            <h2 className="mb-10 text-sm font-semibold tracking-wide text-gray-500 uppercase">
              Altro
            </h2>
            <CourseGrid courses={ALTRO} counts={counts} />
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
