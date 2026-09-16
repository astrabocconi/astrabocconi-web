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
    () =>
      [...new Set(representatives.map((r) => r.section?.trim()).filter(Boolean))].sort(),
    [representatives],
  );

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <p className="text-xs text-gray-500">
          {representatives.length} rappresentanti in {grouped.length} sezioni
        </p>
        {canWrite && (
          <button
            onClick={() => {
              setCreating((c) => !c);
              setEditingId(null);
            }}
            className="ml-auto flex items-center gap-1.5 rounded-xl bg-astra-primary px-3.5 py-1.5 text-xs font-medium text-white hover:bg-astra-dark"
          >
            <Plus className="h-3.5 w-3.5" />
            Nuovo rappresentante
          </button>
        )}
      </div>

      {message && (
        <p className="mb-3 rounded-xl bg-astra-light px-3 py-2 text-xs text-astra-primary">
          {message}
        </p>
      )}

      {creating && (
        <div className="mb-4 rounded-2xl border border-astra-accent bg-white p-4">
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

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {grouped.map(([section, people]) => (
          <section key={section}>
            <h2 className="mb-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              {section}
            </h2>
            <ul className="flex flex-col gap-1.5">
              {people.map((r) => (
                <li key={r.id} className="rounded-xl border border-gray-200 bg-white">
                  <button
                    onClick={() => canWrite && setEditingId(editingId === r.id ? null : r.id)}
                    disabled={!canWrite}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left disabled:cursor-default"
                  >
                    {r.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.url}
                        alt=""
                        className="h-8 w-8 shrink-0 rounded-full bg-astra-light object-cover"
                      />
                    ) : (
                      <span className="h-8 w-8 shrink-0 rounded-full bg-astra-light" />
                    )}
                    <span className="truncate text-sm font-medium text-gray-900">
                      {r.name}
                    </span>
                  </button>

                  {editingId === r.id && canWrite && (
                    <div className="border-t border-gray-100 p-3">
                      <RepForm
                        initial={{
                          id: r.id,
                          name: r.name,
                          section: r.section?.trim() ?? "",
                          url: r.url,
                        }}
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
    <div className="flex flex-col gap-2.5">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-600">Nome</span>
        <input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-astra-accent"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-600">Sezione</span>
        <input
          list="rep-sections"
          value={form.section}
          onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-astra-accent"
        />
        <datalist id="rep-sections">
          {sections.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-600">Link alla foto</span>
        <input
          value={form.url ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, url: e.target.value || null }))}
          className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-astra-accent"
        />
      </label>

      <label className="text-xs text-gray-500">
        <span className="mr-2 font-medium text-gray-600">Carica una foto</span>
        <input
          type="file"
          accept="image/*"
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
          className="text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-gray-100 file:px-2.5 file:py-1.5 file:text-xs file:font-medium"
        />
      </label>
      {uploading && <p className="text-xs text-gray-500">Caricamento…</p>}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await saveRepresentative(form);
              if (res.ok) {
                onDone("Rappresentante salvato");
                router.refresh();
              } else setError(res.error);
            })
          }
          className="rounded-xl bg-astra-primary px-4 py-2 text-sm font-medium text-white hover:bg-astra-dark disabled:opacity-60"
        >
          {pending ? "Salvataggio…" : "Salva"}
        </button>

        {form.id && canDelete && (
          <button
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
            className="ml-auto rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Elimina
          </button>
        )}
      </div>
    </div>
  );
}
