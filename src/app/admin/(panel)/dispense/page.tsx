import { createClient } from "@/lib/supabase/server";
import { requireOperator } from "@/lib/auth/operator";
import { PageHeader } from "@/components/admin/ui/page-header";
import {
  normaliseCode,
  normaliseExamType,
  normaliseSemester,
  normaliseYear,
  thumbFor,
} from "@/lib/handouts";
import { DispenseManager, type AdminHandout } from "./dispense-manager";

export const metadata = { title: "Dispense" };

export default async function DispenseAdminPage() {
  const op = await requireOperator();
  const supabase = await createClient();

  const [general, clmg, magistrali] = await Promise.all([
    supabase.from("handouts").select("id, filename, file_url, subject, year, semester, exam_type"),
    supabase.from("clmg_handouts").select("id, name, url, course_year, semester, exam_type"),
    supabase.from("magistrali_handouts").select("id, name, url, program, semester, exam_type"),
  ]);

  const rows: AdminHandout[] = [
    ...(general.data ?? []).map((r) => ({
      kind: "handouts" as const,
      id: String(r.id),
      code: normaliseCode(r.subject),
      name: String(r.filename ?? "").trim(),
      url: r.file_url,
      year: normaliseYear(r.year),
      semester: normaliseSemester(r.semester),
      examType: normaliseExamType(r.exam_type),
    })),
    ...(clmg.data ?? []).map((r) => ({
      kind: "clmg" as const,
      id: String(r.id),
      code: "CLMG",
      name: String(r.name ?? "").trim(),
      url: r.url,
      year: normaliseYear(r.course_year),
      semester: normaliseSemester(r.semester),
      examType: normaliseExamType(r.exam_type),
    })),
    ...(magistrali.data ?? []).map((r) => ({
      kind: "magistrali" as const,
      id: String(r.id),
      code: normaliseCode(r.program),
      name: String(r.name ?? "").trim(),
      url: r.url,
      year: null,
      semester: normaliseSemester(r.semester),
      examType: normaliseExamType(r.exam_type),
    })),
  ].map((h) => ({ ...h, thumbUrl: thumbFor(h.kind, h.id) }));

  const loadError = general.error ?? clmg.error ?? magistrali.error;

  return (
    <>
      <PageHeader
        title="Dispense"
        subtitle="Carica PDF per corso, anno, semestre e tipo di esame. Compaiono su /dispense e nell'app."
      />
      {loadError && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Caricamento incompleto: {loadError.message}
        </p>
      )}
      <DispenseManager
        handouts={rows}
        canWrite={op.can("dispense:write")}
        canDelete={op.can("dispense:delete")}
      />
    </>
  );
}
