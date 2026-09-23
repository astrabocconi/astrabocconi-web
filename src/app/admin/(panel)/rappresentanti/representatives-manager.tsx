"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  deleteRepresentative,
  saveRepresentative,
  uploadRepresentativePhoto,
  type RepresentativeInput,
} from "./actions";
import { Button } from "@/components/admin/ui/button";
import { Field, Input } from "@/components/admin/ui/field";

export type Representative = {
  id: string;
  name: string;
  section: string;
  url: string | null;
};

const BLANK: RepresentativeInput = { name: "", section: "", url: null };

export function RepresentativesManager({
  representatives,
  canWrite,
  canDelete,
}: {
  representatives: Representative[];
  canWrite: boolean;
  canDelete: boolean;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const by = new Map<string, Representative[]>();
    for (const r of representatives) {
      const key = r.section?.trim() || "senza sezione";
      const list = by.get(key) ?? [];
      list.push(r);
      by.set(key, list);
    }
    return [...by.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [representatives]);

  const sections = useMemo(
    () => [...new Set(representatives.map((r) => r.section?.trim()).filter(Boolean))].sort(),
    [representatives],
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <p className="text-sm text-gray-500">
          {representatives.length} rappresentanti in {grouped.length} sezioni
        </p>
        {canWrite && (
          <Button
            className="ml-auto"
            onClick={() => {
              setCreating((c) => !c);
              setEditingId(null);
            }}
          >
            <Plus className="h-4 w-4" />
            Nuovo rappresentante
          </Button>
        )}
      </div>

      {message && (
        <p className="mb-3 rounded-xl bg-astra-light px-4 py-2.5 text-sm text-astra-primary">{message}</p>
      )}

      {creating && (
        <div className="mb-6 max-w-md rounded-2xl border border-astra-accent/40 bg-white p-5 shadow-sm">
          <RepForm
            initial={BLANK}
            sections={sections}
            canDelete={false}
            onDone={(m) => {
              setCreating(false);
              setMessage(m);
            }}
          />
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {grouped.map(([section, people]) => (
          <section key={section}>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-gray-800">{section}</h2>
              <span className="text-xs text-gray-400">{people.length}</span>
            </div>
            <ul className="flex flex-col gap-2">
              {people.map((r) => (
                <li
                  key={r.id}
                  className="rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:border-astra-light"
                >
                  <button
                    type="button"
                    onClick={() => canWrite && setEditingId(editingId === r.id ? null : r.id)}
                    disabled={!canWrite}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left disabled:cursor-default"
                  >
                    {r.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.url} alt="" className="h-9 w-9 shrink-0 rounded-full bg-astra-light object-cover" />
                    ) : (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-astra-light text-sm font-semibold text-astra-primary">
                        {r.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="truncate font-medium text-gray-900">{r.name}</span>
                  </button>

                  {editingId === r.id && canWrite && (
                    <div className="border-t border-gray-100 p-4">
                      <RepForm
                        initial={{ id: r.id, name: r.name, section: r.section?.trim() ?? "", url: r.url }}
                        sections={sections}
                        canDelete={canDelete}
                        onDone={(m) => {
                          setEditingId(null);
                          setMessage(m);
                        }}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function RepForm({
  initial,
  sections,
  canDelete,
  onDone,
}: {
  initial: RepresentativeInput;
  sections: string[];
  canDelete: boolean;
  onDone: (message: string | null) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-3">
      <Field label="Nome" required>
        <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      </Field>

      <Field label="Sezione" required>
        <Input list="rep-sections" value={form.section} onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))} />
        <datalist id="rep-sections">
          {sections.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </Field>

      <Field label="Foto">
        <div className="flex items-center gap-3">
          {form.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.url} alt="" className="h-12 w-12 shrink-0 rounded-full bg-astra-light object-cover" />
          )}
          <label className="cursor-pointer text-sm font-medium text-astra-primary hover:text-astra-accent">
            {uploading ? "Caricamento…" : form.url ? "Sostituisci foto" : "Carica foto"}
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={uploading || pending}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                setError(null);
                const fd = new FormData();
                fd.set("file", file);
                const res = await uploadRepresentativePhoto(fd);
                setUploading(false);
                if (res.ok) setForm((f) => ({ ...f, url: res.data }));
                else setError(res.error);
              }}
            />
          </label>
        </div>
      </Field>

      <Field label="Link alla foto" hint="Compilato dal caricamento, oppure incolla un indirizzo.">
        <Input value={form.url ?? ""} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value || null }))} />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-2">
        <Button
          disabled={pending || uploading}
          onClick={() =>
            startTransition(async () => {
              const res = await saveRepresentative(form);
              if (res.ok) {
                onDone("Rappresentante salvato");
                router.refresh();
              } else setError(res.error);
            })
          }
        >
          {pending ? "Salvataggio…" : "Salva"}
        </Button>
        <Button variant="secondary" disabled={pending} onClick={() => onDone(null)}>
          Annulla
        </Button>

        {form.id && canDelete && (
          <Button
            variant="danger"
            className="ml-auto"
            disabled={pending}
            onClick={() => {
              if (!confirm(`Eliminare ${form.name}?`)) return;
              startTransition(async () => {
                const res = await deleteRepresentative(form.id!);
                if (res.ok) {
                  onDone("Rappresentante eliminato");
                  router.refresh();
                } else setError(res.error);
              });
            }}
          >
            Elimina
          </Button>
        )}
      </div>
    </div>
  );
}
