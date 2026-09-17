"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import type { ExamType, Handout, Semester } from "@/lib/handouts";

const YEAR_LABEL: Record<number, string> = {
  1: "1º anno",
  2: "2º anno",
  3: "3º anno",
  4: "4º anno",
  5: "5º anno",
};

export function HandoutsBrowser({ handouts }: { handouts: Handout[] }) {
  const years = useMemo(() => {
    const found = [...new Set(handouts.map((h) => h.year))]
      .filter((y): y is number => y !== null)
      .sort((a, b) => a - b);
    // Rows whose year never got filled in still need somewhere to live.
    return handouts.some((h) => h.year === null) ? [...found, 0] : found;
  }, [handouts]);

  const [year, setYear] = useState<number | null>(years[0] ?? null);
  const [semester, setSemester] = useState<Semester | null>(null);
  const [examType, setExamType] = useState<ExamType | null>(null);
  const [query, setQuery] = useState("");

  const inYear = useMemo(
    () =>
      handouts.filter((h) =>
        year === null ? true : year === 0 ? h.year === null : h.year === year,
      ),
    [handouts, year],
  );

  // Only offer a filter the current year can actually satisfy.
  const hasSemester = (s: Semester) => inYear.some((h) => h.semester === s);
  const hasExam = (e: ExamType) => inYear.some((h) => h.examType === e);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return inYear
      .filter((h) => (semester === null ? true : h.semester === semester))
      .filter((h) => (examType === null ? true : h.examType === examType))
      .filter((h) => (needle ? h.name.toLowerCase().includes(needle) : true))
      .sort((a, b) => a.name.localeCompare(b.name, "it"));
  }, [inYear, semester, examType, query]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {years.map((y) => (
          <button
            key={y}
            onClick={() => {
              setYear(y);
              setSemester(null);
              setExamType(null);
            }}
            className={`glass-pill px-4 py-2 text-sm font-semibold ${
              year === y ? "glass-pill--on" : "text-astra-primary"
            }`}
          >
            {y === 0 ? "Senza anno" : YEAR_LABEL[y]}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Semestre
        </span>
        {([1, 2] as Semester[]).map((s) => (
          <button
            key={s}
            disabled={!hasSemester(s)}
            onClick={() => setSemester(semester === s ? null : s)}
            className={`glass-pill px-3.5 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-35 ${
              semester === s ? "glass-pill--on" : "text-astra-primary"
            }`}
          >
            {s}º
          </button>
        ))}

        <span className="mr-1 ml-4 text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Tipo
        </span>
        {(["generale", "parziale"] as ExamType[]).map((e) => (
          <button
            key={e}
            disabled={!hasExam(e)}
            onClick={() => setExamType(examType === e ? null : e)}
            className={`glass-pill px-3.5 py-1.5 text-sm font-medium capitalize disabled:cursor-not-allowed disabled:opacity-35 ${
              examType === e ? "glass-pill--on" : "text-astra-primary"
            }`}
          >
            {e}
          </button>
        ))}

        {(semester !== null || examType !== null) && (
          <button
            onClick={() => {
              setSemester(null);
              setExamType(null);
            }}
            className="ml-2 text-sm font-medium text-gray-500 hover:text-astra-primary"
          >
            Azzera
          </button>
        )}
      </div>

      <label className="glass-field mt-6 flex items-center gap-2.5 px-4 py-3">
        <Search className="h-4 w-4 shrink-0 text-astra-primary/50" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca una dispensa per nome"
          className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="shrink-0 text-xs font-medium text-gray-500 hover:text-astra-primary"
          >
            Cancella
          </button>
        )}
      </label>

      <p className="mt-5 text-xs text-gray-500">
        {results.length} {results.length === 1 ? "dispensa" : "dispense"}
      </p>

      <ul className="mt-3 flex flex-col gap-2">
        {results.map((h) => (
          <li key={h.id}>
            <a
              href={h.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-astra-primary/10 bg-white px-4 py-3 transition-colors hover:border-astra-accent/50"
            >
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                {h.name}
              </span>
              {h.semester && (
                <span className="rounded-full bg-astra-light px-2 py-0.5 text-xs font-medium text-astra-primary">
                  {h.semester}º sem
                </span>
              )}
              {h.examType && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 capitalize">
                  {h.examType}
                </span>
              )}
              <ArrowUpRight className="h-4 w-4 shrink-0 text-astra-primary/30 transition-colors group-hover:text-astra-accent" />
            </a>
          </li>
        ))}
      </ul>

      {results.length === 0 && (
        <p className="mt-6 text-sm text-gray-500">
          Nessuna dispensa con questi filtri.
        </p>
      )}
    </div>
  );
}

export default HandoutsBrowser;
