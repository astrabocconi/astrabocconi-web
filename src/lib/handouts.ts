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
  year: number | null;
  semester: Semester | null;
  examType: ExamType | null;
};

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

function normaliseYear(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const text = String(value ?? "").trim().toLowerCase();
  if (!text || text === "null") return null;
  if (YEAR_WORDS[text]) return YEAR_WORDS[text];
  const digits = Number.parseInt(text, 10);
  return Number.isFinite(digits) ? digits : null;
}

function normaliseSemester(value: unknown): Semester | null {
  const n = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  return n === 1 || n === 2 ? n : null;
}

function normaliseExamType(value: unknown): ExamType | null {
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

// magistrali_handouts currently holds a single programme; the list is derived
// at runtime so new ones appear without a code change.
const MAGISTRALI_FALLBACK: Course[] = [];

export async function getMagistrali(): Promise<Course[]> {
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
}

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

export async function getHandouts(code: string): Promise<Handout[]> {
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
      year: normaliseYear(r.year),
      semester: normaliseSemester(r.semester),
      examType: normaliseExamType(r.exam_type),
    }));
}
