import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";

// The handout tables were filled in by hand over several years, so the same
// value appears in a few spellings: "First year", "First Year", "First Year "
// with a trailing space, and the literal string "NULL". Exam types arrive as
// "generale" and "generale\n". Everything is normalised on read; the raw rows
// are left alone because the mobile app reads the same tables.

export type Semester = 1 | 2;
export type ExamType = "generale" | "parziale";

export type Handout = {
  id: string;
  name: string;
  url: string;
  /** Pre-rendered first page of the PDF. Generated ahead of time and stored in
   *  Supabase, so the grid serves plain JPEGs instead of rasterising PDFs. */
  thumbUrl: string;
  year: number | null;
  semester: Semester | null;
  examType: ExamType | null;
};

const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/dispense-uploads/thumbs`;

export type HandoutKind = "handouts" | "clmg" | "magistrali";

export function thumbFor(kind: HandoutKind, id: string) {
  return `${STORAGE_BASE}/${kind}/${id}.jpg`;
}

export type CourseLevel = "triennale" | "magistrale";

export type Course = {
  /** Code used in the URL and in the database. */
  code: string;
  name: string;
  level: CourseLevel;
  /** Years the programme runs, for the year tabs. */
  years: number[];
};

// Order fixed by Michele. BESS is listed even though the table holds no rows
// for it yet, so the gap is visible rather than silently missing.
export const TRIENNALI: Course[] = [
  { code: "CLEAM", name: "CLEAM", level: "triennale", years: [1, 2, 3] },
  { code: "BIEM", name: "BIEM", level: "triennale", years: [1, 2, 3] },
  { code: "BIEF", name: "BIEF", level: "triennale", years: [1, 2, 3] },
  { code: "CLEACC", name: "CLEACC", level: "triennale", years: [1, 2, 3] },
  { code: "BEMACC", name: "BEMACC", level: "triennale", years: [1, 2, 3] },
  { code: "BEMACS", name: "BEMACS", level: "triennale", years: [1, 2, 3] },
  { code: "BAI", name: "BAI", level: "triennale", years: [1, 2, 3] },
  { code: "BIG", name: "BIG", level: "triennale", years: [1, 2, 3] },
  { code: "CLMG", name: "CLMG", level: "triennale", years: [1, 2, 3, 4, 5] },
  { code: "BGL", name: "BGL", level: "triennale", years: [1, 2, 3] },
  { code: "BESS", name: "BESS", level: "triennale", years: [1, 2, 3] },
];

// Present in the data but outside the programme list, so they get their own
// group instead of being dropped.
export const ALTRO: Course[] = [
  { code: "ELECTIVES", name: "Electives", level: "triennale", years: [3] },
  { code: "LANGUAGES", name: "Lingue", level: "triennale", years: [] },
  { code: "SPANISH", name: "Spagnolo", level: "triennale", years: [2] },
];

const YEAR_WORDS: Record<string, number> = {
  "first year": 1,
  "second year": 2,
  "third year": 3,
  "fourth year": 4,
  "fifth year": 5,
};

export function normaliseYear(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const text = String(value ?? "").trim().toLowerCase();
  if (!text || text === "null") return null;
  if (YEAR_WORDS[text]) return YEAR_WORDS[text];
  const digits = Number.parseInt(text, 10);
  return Number.isFinite(digits) ? digits : null;
}

export function normaliseSemester(value: unknown): Semester | null {
  const n = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  return n === 1 || n === 2 ? n : null;
}

export function normaliseExamType(value: unknown): ExamType | null {
  const text = String(value ?? "").trim().toLowerCase();
  if (text === "generale") return "generale";
  if (text === "parziale") return "parziale";
  return null;
}

export function normaliseCode(value: unknown): string {
  return String(value ?? "").trim().toUpperCase();
}

export function findCourse(code: string): Course | undefined {
  const wanted = normaliseCode(code);
  return [...TRIENNALI, ...ALTRO, ...MAGISTRALI_FALLBACK].find(
    (c) => c.code === wanted,
  );
}

/** Which table a course lives in. Anything not in the fixed lists is a magistrale. */
export function kindFor(code: string): HandoutKind | null {
  if (code === "CLMG") return "clmg";
  if ([...TRIENNALI, ...ALTRO].some((c) => c.code === code)) return "handouts";
  return /^[A-Z0-9]{2,20}$/.test(code) ? "magistrali" : null;
}

/** Years an editor may pick. `handouts.year` is NOT NULL and the app reads
 *  only First to Third Year, so courses with no fixed years get 1 to 3. */
export function yearsFor(kind: HandoutKind, code: string): number[] {
  if (kind === "magistrali") return [];
  if (kind === "clmg") return [1, 2, 3, 4, 5];
  const years = findCourse(code)?.years ?? [];
  return years.length ? years.filter((y) => y <= 3) : [1, 2, 3];
}

// magistrali_handouts currently holds a single programme; the list is derived
// at runtime so new ones appear without a code change.
const MAGISTRALI_FALLBACK: Course[] = [];

// cache() so generateMetadata and the page share one query per render.
export const getMagistrali = cache(async (): Promise<Course[]> => {
  const supabase = createPublicClient();
  const { data } = await supabase.from("magistrali_handouts").select("program");
  const codes = [...new Set((data ?? []).map((r) => normaliseCode(r.program)))]
    .filter(Boolean)
    .sort();
  return codes.map((code) => ({
    code,
    name: code,
    level: "magistrale" as const,
    years: [],
  }));
});

/** How many handouts each course code has, keyed by normalised code. */
export async function getCourseCounts(): Promise<Record<string, number>> {
  const supabase = createPublicClient();
  const counts: Record<string, number> = {};

  const [general, clmg, magistrali] = await Promise.all([
    supabase.from("handouts").select("subject"),
    supabase.from("clmg_handouts").select("id"),
    supabase.from("magistrali_handouts").select("program"),
  ]);

  for (const row of general.data ?? []) {
    const code = normaliseCode(row.subject);
    if (!code) continue;
    counts[code] = (counts[code] ?? 0) + 1;
  }

  // CLMG's real material lives in its own table. One stray row sits in
  // `handouts` as well, so the two are added together.
  counts.CLMG = (counts.CLMG ?? 0) + (clmg.data?.length ?? 0);

  for (const row of magistrali.data ?? []) {
    const code = normaliseCode(row.program);
    if (!code) continue;
    counts[code] = (counts[code] ?? 0) + 1;
  }

  return counts;
}

export const getHandouts = cache(async (code: string): Promise<Handout[]> => {
  const supabase = createPublicClient();
  const wanted = normaliseCode(code);

  if (wanted === "CLMG") {
    const { data } = await supabase
      .from("clmg_handouts")
      .select("id, name, url, course_year, semester, exam_type");
    return (data ?? []).map((r) => ({
      id: String(r.id),
      name: String(r.name ?? "").trim(),
      url: r.url,
      thumbUrl: thumbFor("clmg", String(r.id)),
      year: normaliseYear(r.course_year),
      semester: normaliseSemester(r.semester),
      examType: normaliseExamType(r.exam_type),
    }));
  }

  const { data: magistrali } = await supabase
    .from("magistrali_handouts")
    .select("id, name, url, program, semester, exam_type");
  const mine = (magistrali ?? []).filter(
    (r) => normaliseCode(r.program) === wanted,
  );
  if (mine.length) {
    return mine.map((r) => ({
      id: String(r.id),
      name: String(r.name ?? "").trim(),
      url: r.url,
      thumbUrl: thumbFor("magistrali", String(r.id)),
      year: null,
      semester: normaliseSemester(r.semester),
      examType: normaliseExamType(r.exam_type),
    }));
  }

  const { data } = await supabase
    .from("handouts")
    .select("id, filename, file_url, subject, year, semester, exam_type");
  return (data ?? [])
    .filter((r) => normaliseCode(r.subject) === wanted)
    .map((r) => ({
      id: String(r.id),
      name: String(r.filename ?? "").trim(),
      url: r.file_url,
      thumbUrl: thumbFor("handouts", String(r.id)),
      year: normaliseYear(r.year),
      semester: normaliseSemester(r.semester),
      examType: normaliseExamType(r.exam_type),
    }));
});

/** A flat sample of handouts, used for folder covers and the landing marquee. */
export async function getHandoutPreviews(limit = 30): Promise<Handout[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("handouts")
    .select("id, filename, file_url, subject, year, semester, exam_type")
    .limit(limit);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    name: String(r.filename ?? "").trim(),
    url: r.file_url,
    thumbUrl: thumbFor("handouts", String(r.id)),
    year: normaliseYear(r.year),
    semester: normaliseSemester(r.semester),
    examType: normaliseExamType(r.exam_type),
  }));
}

/** Covers grouped by course code, for the folder faces on the index. */
export async function getCoversByCourse(): Promise<Record<string, string[]>> {
  const supabase = createPublicClient();
  const out: Record<string, string[]> = {};

  const [general, clmg] = await Promise.all([
    supabase.from("handouts").select("id, subject"),
    supabase.from("clmg_handouts").select("id"),
  ]);

  for (const row of general.data ?? []) {
    const code = normaliseCode(row.subject);
    if (!code) continue;
    (out[code] ??= []).push(thumbFor("handouts", String(row.id)));
  }
  for (const row of clmg.data ?? []) {
    (out.CLMG ??= []).push(thumbFor("clmg", String(row.id)));
  }

  // Five covers per folder is all the stack shows.
  for (const code of Object.keys(out)) out[code] = out[code].slice(0, 5);
  return out;
}
