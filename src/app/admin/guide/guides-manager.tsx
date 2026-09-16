"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ExternalLink, Plus } from "lucide-react";
import { deleteGuide, saveGuide, uploadGuideFile, type GuideInput } from "./actions";

export type Guide = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  file_url: string;
  thumbnail_url: string | null;
  order_index: number | null;
  is_active: boolean | null;
};

const BLANK: GuideInput = {
  title: "",
  category: "",
  description: null,
  file_url: "",
  thumbnail_url: null,
  order_index: null,
  is_active: true,
};

export function GuidesManager({
  guides,
  canWrite,
  canDelete,
}: {
  guides: Guide[];
  canWrite: boolean;
  canDelete: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const by = new Map<string, Guide[]>();
    for (const g of guides) {
      // Trailing whitespace in category values would otherwise split a group.
      const key = g.category?.trim() || "senza categoria";
      const list = by.get(key) ?? [];
      list.push(g);
      by.set(key, list);
    }
    return [...by.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [guides]);

  const categories = useMemo(
    () => [...new Set(guides.map((g) => g.category?.trim()).filter(Boolean))].sort(),
    [guides],
  );

  const inactive = guides.filter((g) => g.is_active === false).length;

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <p className="text-xs text-gray-500">
          {guides.length} guide in {grouped.length} categorie
          {inactive > 0 && `, ${inactive} non attive`}
        </p>
        {canWrite && (
          <button
            onClick={() => {
              setCreating((c) => !c);
              setOpenId(null);
            }}
            className="ml-auto flex items-center gap-1.5 rounded-xl bg-astra-primary px-3.5 py-1.5 text-xs font-medium text-white hover:bg-astra-dark"
          >
            <Plus className="h-3.5 w-3.5" />
            Nuova guida
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
          <GuideForm
            initial={BLANK}
            categories={categories}
            canDelete={false}
            onDone={(m) => {
              setCreating(false);
              setMessage(m);
            }}
          />
        </div>
      )}

      <div className="flex flex-col gap-5">
        {grouped.map(([category, items]) => (
          <section key={category}>
            <h2 className="mb-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              {category}
              <span className="ml-1.5 font-normal text-gray-400">
                {items.length}
              </span>
            </h2>

            <ul className="flex flex-col gap-1.5">
              {items.map((g) => (
                <li
                  key={g.id}
                  className="rounded-xl border border-gray-200 bg-white"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5">
                    <button
                      onClick={() => setOpenId(openId === g.id ? null : g.id)}
                      disabled={!canWrite}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left disabled:cursor-default"
                    >
                      {canWrite && (
                        <ChevronDown
                          className={`h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform ${
                            openId === g.id ? "rotate-180" : ""
                          }`}
                        />
                      )}
                      <span className="truncate text-sm font-medium text-gray-900">
                        {g.title}
                      </span>
                    </button>

                    {g.is_active === false && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Non attiva
                      </span>
                    )}

                    <a
                      href={g.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-astra-primary"
                      title="Apri il file"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  {openId === g.id && canWrite && (
                    <div className="border-t border-gray-100 p-4">
                      <GuideForm
                        initial={{
                          id: g.id,
                          title: g.title,
                          category: g.category?.trim() ?? "",
                          description: g.description,
                          file_url: g.file_url,
                          thumbnail_url: g.thumbnail_url,
                          order_index: g.order_index,
                          is_active: g.is_active !== false,
                        }}
                        categories={categories}
                        canDelete={canDelete}
                        onDone={(m) => {
                          setOpenId(null);
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

function GuideForm({
  initial,
  categories,
  canDelete,
  onDone,
}: {
  initial: GuideInput;
  categories: string[];
  canDelete: boolean;
  onDone: (message: string | null) => void;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  function set<K extends keyof GuideInput>(k: K, v: GuideInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Titolo" value={form.title} onChange={(v) => set("title", v)} />
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-600">Categoria</span>
          <input
            list="guide-categories"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-astra-accent"
          />
          <datalist id="guide-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-gray-600">Descrizione</span>
        <textarea
          value={form.description ?? ""}
          rows={2}
          onChange={(e) => set("description", e.target.value || null)}
          className="resize-y rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-astra-accent"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-[1fr_7rem]">
        <Field
          label="Link al file"
          value={form.file_url}
          onChange={(v) => set("file_url", v)}
        />
        <Field
          label="Ordine"
          value={form.order_index === null ? "" : String(form.order_index)}
          onChange={(v) => set("order_index", v === "" ? null : Number(v))}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs text-gray-500">
          <span className="mr-2 font-medium text-gray-600">Carica un PDF</span>
          <input
            type="file"
            disabled={uploading || pending}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              setError(null);
              const fd = new FormData();
              fd.set("file", file);
              const res = await uploadGuideFile(fd);
              setUploading(false);
              if (res.ok) set("file_url", res.data);
              else setError(res.error);
            }}
            className="text-xs file:mr-2 file:rounded-lg file:border-0 file:bg-gray-100 file:px-2.5 file:py-1.5 file:text-xs file:font-medium"
          />
        </label>
        {uploading && <span className="text-xs text-gray-500">Caricamento…</span>}

        <label className="ml-auto flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => set("is_active", e.target.checked)}
            className="h-4 w-4 accent-astra-primary"
          />
          Visibile sul sito
        </label>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          disabled={pending || uploading}
          onClick={() =>
            startTransition(async () => {
              const res = await saveGuide(form);
              if (res.ok) {
                onDone("Guida salvata");
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
              if (!confirm(`Eliminare "${form.title}"?`)) return;
              startTransition(async () => {
                const res = await deleteGuide(form.id!);
                if (res.ok) {
                  onDone("Guida eliminata");
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

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-astra-accent"
      />
    </label>
  );
}
