import type { Metadata } from "next";
import { InteractiveFolder } from "@/components/ui/interactive-folder-gallery";
import { RotatingWords } from "@/components/ui/rotating-words";
import {
  ALTRO,
  TRIENNALI,
  getCourseCounts,
  getMagistrali,
  type Course,
} from "@/lib/handouts";

export const metadata: Metadata = {
  title: "Dispense",
  description:
    "Tutte le dispense ASTRA, raccolte corso per corso e divise per anno, semestre e tipo di esame.",
};

export const revalidate = 300;

const ROTATING = ["faster", "better", "smarter", "together"];

function CourseGrid({
  courses,
  counts,
}: {
  courses: Course[];
  counts: Record<string, number>;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {courses.map((course) => {
        const count = counts[course.code] ?? 0;
        return (
          <InteractiveFolder
            key={course.code}
            folderName={course.name}
            href={`/dispense/${course.code.toLowerCase()}`}
            caption={`${count} ${count === 1 ? "dispensa" : "dispense"}`}
            empty={count === 0}
          />
        );
      })}
    </div>
  );
}

export default async function DispensePage() {
  const [counts, magistrali] = await Promise.all([
    getCourseCounts(),
    getMagistrali(),
  ]);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <main className="flex-1 bg-white">
      <header className="bg-linear-to-b from-astra-light to-white px-6 pt-20 pb-14">
        <div className="mx-auto w-[min(1280px,calc(100%-48px))]">
          <h1 className="max-w-4xl text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.98] font-semibold tracking-[-0.05em] text-astra-primary">
            Handouts to study{" "}
            <RotatingWords words={ROTATING} />
          </h1>
          <p className="mt-6 max-w-xl text-[1.02rem] leading-relaxed text-[#545d70]">
            {total} dispense raccolte dagli studenti, divise per corso, anno e
            semestre.
          </p>
        </div>
      </header>

      <div className="mx-auto w-[min(1280px,calc(100%-48px))] pb-24">
        <section>
          <h2 className="mb-8 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Triennali
          </h2>
          <CourseGrid courses={TRIENNALI} counts={counts} />
        </section>

        {magistrali.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-8 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Magistrali
            </h2>
            <CourseGrid courses={magistrali} counts={counts} />
          </section>
        )}

        <section className="mt-20">
          <h2 className="mb-8 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Altro
          </h2>
          <CourseGrid courses={ALTRO} counts={counts} />
        </section>
      </div>
    </main>
  );
}
