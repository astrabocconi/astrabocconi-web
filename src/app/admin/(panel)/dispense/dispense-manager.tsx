"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, ImageOff, Pencil, Plus, RefreshCw, Search, Trash2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  ALTRO,
  TRIENNALI,
  kindFor,
  normaliseCode,
  yearsFor,
  type ExamType,
  type HandoutKind,
  type Semester,
} from "@/lib/handouts";
import { Button } from "@/components/admin/ui/button";
import { Card } from "@/components/admin/ui/card";
import { Field, Input, Select } from "@/components/admin/ui/field";
import { Badge } from "@/components/admin/ui/badge";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { createHandouts, deleteHandout, updateHandout, type HandoutFields } from "./actions";
import { renderCover } from "./pdf-cover";

export type AdminHandout = {
  kind: HandoutKind;
  id: string;
  code: string;
  name: string;
  url: string;
  thumbUrl: string;
  year: number | null;
  semester: Semester | null;
  examType: ExamType | null;
};

const BUCKET = "dispense-uploads";
const NEW_MAGISTRALE = "__new__";

function courseLabel(code: string) {
  return [...TRIENNALI, ...ALTRO].find((c) => c.code === code)?.name ?? code;
}

async function uploadPdf(kind: HandoutKind, file: File) {
  const supabase = createClient();
  const path = `${kind}/${crypto.randomUUID()}.pdf`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: "application/pdf", cacheControl: "31536000" });
  if (error) throw new Error(error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function uploadCover(kind: HandoutKind, id: string, source: File | string) {
  const blob = await renderCover(source);
  const { error } = await createClient()
    .storage.from(BUCKET)
    .upload(`thumbs/${kind}/${id}.jpg`, blob, {
      contentType: "image/jpeg",
      cacheControl: "31536000",
      upsert: true,
    });
  if (error) throw new Error(error.message);
}

export function DispenseManager({
  handouts,
  canWrite,
  canDelete,
}: {
  handouts: AdminHandout[];
  canWrite: boolean;
  canDelete: boolean;
}) {
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [examType, setExamType] = useState("");
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const h of handouts) out[h.code] = (out[h.code] ?? 0) + 1;
    return out;
  }, [handouts]);

  const magistrali = useMemo(
    () => [...new Set(handouts.filter((h) => h.kind === "magistrali").map((h) => h.code))].sort(),
    [handouts],
  );

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const shown = handouts.filter(
      (h) =>
        (!course || h.code === course) &&
        (!year || String(h.year ?? 0) === year) &&
        (!semester || String(h.semester ?? 0) === semester) &&
        (!examType || (h.examType ?? "none") === examType) &&
        (!needle || h.name.toLowerCase().includes(needle)),
    );
    const byCode = new Map<string, AdminHandout[]>();
    for (const h of shown) byCode.set(h.code, [...(byCode.get(h.code) ?? []), h]);
    const order = [...TRIENNALI, ...ALTRO].map((c) => c.code);
    return [...byCode.entries()]
      .sort(([a], [b]) => {
        const ia = order.indexOf(a), ib = order.indexOf(b);
        return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib) || a.localeCompare(b);
      })
      .map(([code, items]) => ({
        code,
        items: items.sort((a, b) => (a.year ?? 9) - (b.year ?? 9) || a.name.localeCompare(b.name, "it")),
      }));
  }, [handouts, course, year, semester, examType, query]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const filtered = Boolean(course || year || semester || examType || query);

  return (
    <div className="flex flex-col gap-6">
      {canWrite &&
        (uploading ? (
          <UploadPanel magistrali={magistrali} onClose={() => setUploading(false)} />
        ) : (
          <div>
            <Button onClick={() => setUploading(true)}>
              <Plus className="h-4 w-4" /> Carica dispense
            </Button>
          </div>
        ))}

      <Card className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select value={course} onChange={(e) => setCourse(e.target.value)} aria-label="Corso">
            <option value="">Tutti i corsi ({handouts.length})</option>
            {Object.keys(counts)
              .sort()
              .map((code) => (
                <option key={code} value={code}>
                  {courseLabel(code)} ({counts[code]})
                </option>
              ))}
          </Select>
          <Select value={year} onChange={(e) => setYear(e.target.value)} aria-label="Anno">
            <option value="">Tutti gli anni</option>
            {[1, 2, 3, 4, 5].map((y) => (
              <option key={y} value={y}>
                {y}º anno
              </option>
            ))}
            <option value="0">Senza anno</option>
          </Select>
          <Select value={semester} onChange={(e) => setSemester(e.target.value)} aria-label="Semestre">
            <option value="">Tutti i semestri</option>
            <option value="1">1º semestre</option>
            <option value="2">2º semestre</option>
            <option value="0">Senza semestre</option>
          </Select>
          <Select value={examType} onChange={(e) => setExamType(e.target.value)} aria-label="Tipo">
            <option value="">Tutti i tipi</option>
            <option value="generale">Generale</option>
            <option value="parziale">Parziale</option>
            <option value="none">Senza tipo</option>
          </Select>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca per nome"
            className="pl-10"
          />
        </div>
        <p className="text-xs text-gray-500">
          {total} {total === 1 ? "dispensa" : "dispense"}
          {filtered && " con questi filtri"}
        </p>
      </Card>

      {groups.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-7 w-7" />}
          title={filtered ? "Nessun risultato" : "Nessuna dispensa"}
          description={
            filtered ? "Prova a togliere qualche filtro." : "Carica il primo PDF con Carica dispense."
          }
        />
      ) : (
        groups.map((g) => (
          <section key={g.code} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-gray-800">{courseLabel(g.code)}</h2>
              <span className="text-xs text-gray-400">{g.items.length}</span>
            </div>
            {g.items.map((h) =>
              editing === `${h.kind}:${h.id}` ? (
                <EditRow
                  key={h.id}
                  handout={h}
                  magistrali={magistrali}
                  onDone={() => setEditing(null)}
                />
              ) : (
                <Row
                  key={h.id}
                  handout={h}
                  canWrite={canWrite}
                  canDelete={canDelete}
                  onEdit={() => setEditing(`${h.kind}:${h.id}`)}
                />
              ),
            )}
          </section>
        ))
      )}
    </div>
  );
}

function Thumb({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="grid h-14 w-10.5 shrink-0 place-items-center overflow-hidden rounded-lg border border-gray-100 bg-astra-light">
      {failed ? (
        <ImageOff className="h-4 w-4 text-astra-primary/40" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover object-top" />
      )}
    </div>
  );
}

function Meta({ h }: { h: AdminHandout }) {
  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {h.year !== null && <Badge tone="neutral">{h.year}º anno</Badge>}
      {h.semester !== null && <Badge tone="neutral">{h.semester}º sem.</Badge>}
      {h.examType && <Badge>{h.examType}</Badge>}
    </div>
  );
}

function Row({
  handout: h,
  canWrite,
  canDelete,
  onEdit,
}: {
  handout: AdminHandout;
  canWrite: boolean;
  canDelete: boolean;
  onEdit: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
      <Thumb src={h.thumbUrl} />
      <div className="min-w-0 flex-1">
        <a href={h.url} target="_blank" rel="noopener noreferrer" className="block truncate text-sm font-medium text-gray-900 hover:text-astra-primary">
          {h.name || "Senza nome"}
        </a>
        <Meta h={h} />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
      {canWrite && (
        <Button variant="secondary" onClick={onEdit} disabled={pending} className="px-3 py-2">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Modifica</span>
        </Button>
      )}
      {canDelete && (
        <Button
          variant="danger"
          disabled={pending}
          className="px-3 py-2"
          onClick={() => {
            if (!confirm(`Eliminare "${h.name}"? Il PDF viene rimosso anche dall'app.`)) return;
            start(async () => {
              const res = await deleteHandout(h.kind, h.id, h.code);
              if (res.ok) router.refresh();
              else setError(res.error);
            });
          }}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Elimina</span>
        </Button>
      )}
    </div>
  );
}

/** Course, year, semester and exam type selectors shared by upload and edit. */
function Selectors({
  value,
  onChange,
  magistrali,
  lockKind,
}: {
  value: Omit<HandoutFields, "name">;
  onChange: (v: Omit<HandoutFields, "name">) => void;
  magistrali: string[];
  lockKind?: HandoutKind;
}) {
  const [customCode, setCustomCode] = useState(false);
  const kind = kindFor(value.code);
  const years = kind ? yearsFor(kind, value.code) : [];
  const allowed = (code: string) => !lockKind || kindFor(code) === lockKind || (lockKind === "handouts" && code === "CLMG");

  function setCode(code: string) {
    const k = kindFor(code);
    const ys = k ? yearsFor(k, code) : [];
    onChange({ ...value, code, year: ys.includes(value.year ?? -1) ? value.year : (ys[0] ?? null) });
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Corso" required>
        {customCode ? (
          <div className="flex gap-2">
            <Input
              autoFocus
              value={value.code}
              placeholder="Es. MSC-FIN"
              onChange={(e) => setCode(normaliseCode(e.target.value).replace(/[^A-Z0-9]/g, ""))}
            />
            <Button variant="secondary" className="px-3" onClick={() => { setCustomCode(false); setCode(""); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Select
            value={value.code}
            onChange={(e) => (e.target.value === NEW_MAGISTRALE ? (setCustomCode(true), setCode("")) : setCode(e.target.value))}
          >
            <option value="" disabled>
              Scegli un corso
            </option>
            <optgroup label="Triennali">
              {TRIENNALI.filter((c) => allowed(c.code)).map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </optgroup>
            <optgroup label="Altro">
              {ALTRO.filter((c) => allowed(c.code)).map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </optgroup>
            <optgroup label="Magistrali">
              {magistrali.filter(allowed).map((code) => (
                <option key={code} value={code}>{code}</option>
              ))}
              {(!lockKind || lockKind === "magistrali") && (
                <option value={NEW_MAGISTRALE}>Nuovo programma magistrale…</option>
              )}
            </optgroup>
          </Select>
        )}
      </Field>

      {kind !== "magistrali" && (
        <Field label="Anno" required>
          <Select
            value={value.year ?? ""}
            disabled={!years.length}
            onChange={(e) => onChange({ ...value, year: Number(e.target.value) })}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}º anno</option>
            ))}
          </Select>
        </Field>
      )}

      <Field label="Semestre">
        <Select
          value={value.semester ?? ""}
          onChange={(e) => onChange({ ...value, semester: e.target.value ? (Number(e.target.value) as Semester) : null })}
        >
          <option value="">Non indicato</option>
          <option value="1">1º semestre</option>
          <option value="2">2º semestre</option>
        </Select>
      </Field>

      <Field label="Tipo di esame">
        <Select
          value={value.examType ?? ""}
          onChange={(e) => onChange({ ...value, examType: (e.target.value || null) as ExamType | null })}
        >
          <option value="">Non indicato</option>
          <option value="generale">Generale</option>
          <option value="parziale">Parziale</option>
        </Select>
      </Field>
    </div>
  );
}

type Queued = { file: File; name: string; status: "attesa" | "caricamento" | "fatto" | "errore"; error?: string };

function UploadPanel({ magistrali, onClose }: { magistrali: string[]; onClose: () => void }) {
  const router = useRouter();
  const [shared, setShared] = useState<Omit<HandoutFields, "name">>({
    code: "",
    year: null,
    semester: null,
    examType: null,
  });
  const [queue, setQueue] = useState<Queued[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function add(files: FileList | null) {
    const pdfs = [...(files ?? [])].filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    setQueue((q) => [
      ...q,
      ...pdfs.map((file) => ({ file, name: file.name.replace(/\.pdf$/i, "").replace(/[_]+/g, " ").trim(), status: "attesa" as const })),
    ]);
  }

  function patch(i: number, p: Partial<Queued>) {
    setQueue((q) => q.map((item, j) => (j === i ? { ...item, ...p } : item)));
  }

  async function submit() {
    const kind = kindFor(shared.code);
    if (!kind) return setMessage("Scegli un corso");
    const todo = queue.map((q, i) => ({ ...q, i })).filter((q) => q.status !== "fatto");
    if (!todo.length) return setMessage("Aggiungi almeno un PDF");
    if (todo.some((q) => !q.name.trim())) return setMessage("Ogni dispensa deve avere un nome");

    setBusy(true);
    setMessage(null);
    try {
      // 1. PDFs to storage, from the browser: server actions cap bodies at ~1 MB.
      const uploaded: { i: number; url: string }[] = [];
      for (const q of todo) {
        patch(q.i, { status: "caricamento", error: undefined });
        try {
          uploaded.push({ i: q.i, url: await uploadPdf(kind, q.file) });
        } catch (e) {
          patch(q.i, { status: "errore", error: (e as Error).message });
        }
      }
      if (!uploaded.length) return setMessage("Nessun PDF caricato");

      // 2. One insert for the whole batch.
      const res = await createHandouts(
        shared,
        uploaded.map((u) => ({ name: queue[u.i].name, url: u.url })),
      );
      if (!res.ok) {
        uploaded.forEach((u) => patch(u.i, { status: "errore", error: res.error }));
        return setMessage(res.error);
      }

      // 3. Covers need the row id, so they come last. A failed cover is not a
      //    failed upload: the card shows a placeholder and the edit row can retry.
      await Promise.all(
        uploaded.map(async (u, n) => {
          try {
            await uploadCover(res.data.kind, res.data.ids[n], queue[u.i].file);
            patch(u.i, { status: "fatto" });
          } catch (e) {
            patch(u.i, { status: "fatto", error: `Copertina non generata: ${(e as Error).message}` });
          }
        }),
      );
      setMessage(`${uploaded.length} ${uploaded.length === 1 ? "dispensa pubblicata" : "dispense pubblicate"}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Carica dispense</h2>
        <Button variant="secondary" className="px-3 py-2" onClick={onClose} disabled={busy}>
          <X className="h-4 w-4" />
          <span className="sr-only">Chiudi</span>
        </Button>
      </div>

      <Selectors value={shared} onChange={setShared} magistrali={magistrali} />

      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); add(e.dataTransfer.files); }}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
          dragging ? "border-astra-accent bg-astra-light" : "border-gray-200 hover:bg-gray-50"
        }`}
      >
        <Upload className="h-6 w-6 text-astra-primary" />
        <span className="text-sm font-medium text-gray-700">Trascina qui i PDF o clicca per sceglierli</span>
        <span className="text-xs text-gray-400">Puoi caricarne più di uno: condividono corso, anno, semestre e tipo.</span>
        <input type="file" accept="application/pdf" multiple className="sr-only" onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      </label>

      {queue.length > 0 && (
        <ul className="flex flex-col gap-2">
          {queue.map((q, i) => (
            <li key={i} className="flex items-center gap-3">
              <Input
                value={q.name}
                disabled={busy || q.status === "fatto"}
                onChange={(e) => patch(i, { name: e.target.value })}
                aria-label={`Nome per ${q.file.name}`}
              />
              <span
                className={`w-44 shrink-0 text-xs ${
                  q.status === "errore" ? "text-red-600" : q.error ? "text-amber-600" : q.status === "fatto" ? "text-astra-primary" : "text-gray-400"
                }`}
                title={q.error}
              >
                {q.error ?? { attesa: `${(q.file.size / 1048576).toFixed(1)} MB`, caricamento: "Caricamento…", fatto: "Pubblicata", errore: "Errore" }[q.status]}
              </span>
              <Button
                variant="secondary"
                className="px-3 py-2"
                disabled={busy}
                onClick={() => setQueue((all) => all.filter((_, j) => j !== i))}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Rimuovi</span>
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={submit} disabled={busy || !queue.some((q) => q.status !== "fatto")}>
          {busy ? "Caricamento…" : `Pubblica ${queue.filter((q) => q.status !== "fatto").length || ""}`.trim()}
        </Button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    </Card>
  );
}

function EditRow({
  handout: h,
  magistrali,
  onDone,
}: {
  handout: AdminHandout;
  magistrali: string[];
  onDone: () => void;
}) {
  const router = useRouter();
  const original: HandoutFields = { code: h.code, name: h.name, year: h.year, semester: h.semester, examType: h.examType };
  const [fields, setFields] = useState<HandoutFields>(original);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setMessage(null);
    try {
      const url = file ? await uploadPdf(h.kind, file) : null;
      const changed = (Object.keys(fields) as (keyof HandoutFields)[]).filter((k) => fields[k] !== original[k]);
      const res = await updateHandout(h.kind, h.id, fields, url, changed);
      if (!res.ok) return setMessage(res.error);
      if (file) await uploadCover(h.kind, h.id, file).catch(() => setMessage("Salvato, ma la copertina non è stata rigenerata"));
      router.refresh();
      onDone();
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function regenerate() {
    setBusy(true);
    setMessage(null);
    try {
      await uploadCover(h.kind, h.id, h.url);
      setMessage("Copertina rigenerata. Può servire qualche minuto prima che si aggiorni ovunque.");
    } catch (e) {
      setMessage(`Copertina non generata: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4 border-astra-light">
      <div className="flex items-start gap-4">
        <Thumb src={h.thumbUrl} />
        <div className="min-w-0 flex-1">
          <Field label="Nome" required>
            <Input value={fields.name} onChange={(e) => setFields({ ...fields, name: e.target.value })} />
          </Field>
        </div>
      </div>

      <Selectors
        value={fields}
        onChange={(v) => setFields({ ...fields, ...v })}
        magistrali={magistrali}
        lockKind={h.kind}
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Upload className="h-4 w-4" />
          {file ? file.name : "Sostituisci PDF"}
          <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <Button variant="secondary" onClick={regenerate} disabled={busy}>
          <RefreshCw className="h-4 w-4" /> Rigenera copertina
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={busy}>{busy ? "Salvataggio…" : "Salva"}</Button>
        <Button variant="secondary" onClick={onDone} disabled={busy}>Annulla</Button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    </Card>
  );
}
