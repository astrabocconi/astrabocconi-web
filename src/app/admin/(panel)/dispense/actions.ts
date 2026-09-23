"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  kindFor,
  normaliseCode,
  yearsFor,
  type ExamType,
  type HandoutKind,
  type Semester,
} from "@/lib/handouts";

type Result<T = void> = { ok: true; data: T } | { ok: false; error: string };

const BUCKET = "dispense-uploads";
const BUCKET_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

// astra-app's mobile reader only understands these spellings for `handouts.year`.
const YEAR_TEXT: Record<number, string> = {
  1: "First Year",
  2: "Second Year",
  3: "Third Year",
};

export type HandoutFields = {
  code: string;
  name: string;
  year: number | null;
  semester: Semester | null;
  examType: ExamType | null;
};

function ownUrl(url: unknown): url is string {
  return typeof url === "string" && url.startsWith(BUCKET_PREFIX) && url.endsWith(".pdf");
}

function objectPath(url: string) {
  return url.startsWith(BUCKET_PREFIX) ? decodeURIComponent(url.slice(BUCKET_PREFIX.length)) : null;
}

/** Validates the shared fields and maps them to the column names of `kind`. */
function toColumns(kind: HandoutKind, f: HandoutFields): Result<Record<string, unknown>> {
  const code = normaliseCode(f.code);
  const name = String(f.name ?? "").trim();
  if (!name || name.length > 200) return { ok: false, error: "Nome mancante o troppo lungo" };
  if (f.semester !== null && f.semester !== 1 && f.semester !== 2)
    return { ok: false, error: "Semestre non valido" };
  if (f.examType !== null && f.examType !== "generale" && f.examType !== "parziale")
    return { ok: false, error: "Tipo di esame non valido" };

  const years = yearsFor(kind, code);
  if (kind !== "magistrali" && (f.year === null || !years.includes(f.year)))
    return { ok: false, error: `Anno non valido per ${code}` };

  const common = { semester: f.semester, exam_type: f.examType };
  if (kind === "handouts")
    return { ok: true, data: { ...common, subject: code, filename: name, year: YEAR_TEXT[f.year!] } };
  if (kind === "clmg") return { ok: true, data: { ...common, name, course_year: f.year } };
  return { ok: true, data: { ...common, name, program: code } };
}

const TABLE: Record<HandoutKind, "handouts" | "clmg_handouts" | "magistrali_handouts"> = {
  handouts: "handouts",
  clmg: "clmg_handouts",
  magistrali: "magistrali_handouts",
};
const URL_COLUMN: Record<HandoutKind, "file_url" | "url"> = {
  handouts: "file_url",
  clmg: "url",
  magistrali: "url",
};

function revalidate(...codes: string[]) {
  revalidatePath("/");
  revalidatePath("/dispense");
  revalidatePath("/admin/dispense");
  for (const c of new Set(codes)) revalidatePath(`/dispense/${c.toLowerCase()}`);
}

async function session() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? supabase : null;
}

export async function createHandouts(
  shared: Omit<HandoutFields, "name">,
  files: { name: string; url: string }[],
): Promise<Result<{ kind: HandoutKind; ids: string[] }>> {
  const supabase = await session();
  if (!supabase) return { ok: false, error: "Non autenticato" };

  const code = normaliseCode(shared.code);
  const kind = kindFor(code);
  if (!kind) return { ok: false, error: "Corso non valido" };
  if (!files.length || files.length > 50) return { ok: false, error: "Da 1 a 50 file per volta" };

  const rows: Record<string, unknown>[] = [];
  for (const file of files) {
    if (!ownUrl(file.url)) return { ok: false, error: "Indirizzo del PDF non valido" };
    const cols = toColumns(kind, { ...shared, code, name: file.name });
    if (!cols.ok) return cols;
    rows.push({ ...cols.data, [URL_COLUMN[kind]]: file.url });
  }

  // Row shapes differ per table; each one was built by toColumns for this kind.
  const { data, error } = await supabase
    .from(TABLE[kind])
    .insert(rows as never)
    .select("id");
  if (error) return { ok: false, error: error.message };

  revalidate(code);
  return { ok: true, data: { kind, ids: (data ?? []).map((r) => String(r.id)) } };
}

export async function updateHandout(
  kind: HandoutKind,
  id: string,
  fields: HandoutFields,
  replaceUrl: string | null,
  /** Columns the operator actually changed. Untouched columns keep their original spelling. */
  changed: (keyof HandoutFields)[],
): Promise<Result> {
  const supabase = await session();
  if (!supabase) return { ok: false, error: "Non autenticato" };
  if (!TABLE[kind]) return { ok: false, error: "Tipo non valido" };

  const code = normaliseCode(fields.code);
  if (kindFor(code) !== kind && !(kind === "handouts" && code === "CLMG"))
    return { ok: false, error: "Il corso deve restare nella stessa tabella" };

  const cols = toColumns(kind, { ...fields, code });
  if (!cols.ok) return cols;

  const pick: Record<keyof HandoutFields, string[]> = {
    code: ["subject", "program"],
    name: ["filename", "name"],
    year: ["year", "course_year"],
    semester: ["semester"],
    examType: ["exam_type"],
  };
  const patch: Record<string, unknown> = {};
  for (const key of changed)
    for (const col of pick[key] ?? []) if (col in cols.data) patch[col] = cols.data[col];

  const table = TABLE[kind];
  const urlCol = URL_COLUMN[kind];
  const { data: before } = await supabase
    .from(table)
    .select("*")
    .eq("id", id as never)
    .single();
  if (!before) return { ok: false, error: "Dispensa non trovata" };
  const row = before as Record<string, unknown>;

  if (replaceUrl !== null) {
    if (!ownUrl(replaceUrl)) return { ok: false, error: "Indirizzo del PDF non valido" };
    patch[urlCol] = replaceUrl;
  }
  if (!Object.keys(patch).length) return { ok: true, data: undefined };

  const { error } = await supabase
    .from(table)
    .update(patch as never)
    .eq("id", id as never);
  if (error) return { ok: false, error: error.message };

  // Best effort: the old PDF is unreachable once the row points elsewhere.
  const oldPath = replaceUrl && typeof row[urlCol] === "string" ? objectPath(row[urlCol]) : null;
  if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);

  const oldCode =
    kind === "clmg" ? "CLMG" : normaliseCode(kind === "handouts" ? row.subject : row.program);
  revalidate(oldCode, code);
  return { ok: true, data: undefined };
}

export async function deleteHandout(kind: HandoutKind, id: string, code: string): Promise<Result> {
  const supabase = await session();
  if (!supabase) return { ok: false, error: "Non autenticato" };
  if (!TABLE[kind]) return { ok: false, error: "Tipo non valido" };

  const urlCol = URL_COLUMN[kind];
  const { data, error } = await supabase
    .from(TABLE[kind])
    .delete()
    .eq("id", id as never)
    .select("*");
  if (error) return { ok: false, error: error.message };
  // RLS turns a forbidden delete into zero rows rather than an error.
  if (!data?.length) return { ok: false, error: "Non hai il permesso di eliminare dispense" };

  const url = (data[0] as unknown as Record<string, unknown>)[urlCol];
  const paths = [`thumbs/${kind}/${id}.jpg`];
  const pdf = typeof url === "string" ? objectPath(url) : null;
  if (pdf) paths.push(pdf);
  await supabase.storage.from(BUCKET).remove(paths);

  revalidate(normaliseCode(code));
  return { ok: true, data: undefined };
}
