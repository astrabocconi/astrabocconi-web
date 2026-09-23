"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ExternalLink, Plus } from "lucide-react";
import { deleteGuide, saveGuide, uploadGuideFile, type GuideInput } from "./actions";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { Field, Input, Textarea, Toggle } from "@/components/admin/ui/field";

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
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <p className="text-sm text-gray-500">
          {guides.length} guide in {grouped.length} categorie
          {inactive > 0 && `, ${inactive} non attive`}
        </p>
        {canWrite && (
          <Button
            onClick={() => {
              setCreating((c) => !c);
              setOpenId(null);
            }}
            className="ml-auto"
          >
            <Plus className="h-4 w-4" />
            Nuova guida
          </Button>
        )}
      </div>

      {message && (
        <p className="mb-3 rounded-xl bg-astra-light px-4 py-2.5 text-sm text-astra-primary">
          {message}
        </p>
      )}

      {creating && (
        <div className="mb-6 rounded-2xl border border-astra-accent/40 bg-white p-5 shadow-sm">
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

      <div className="flex flex-col gap-8">
        {grouped.map(([category, items]) => (
          <section key={category}>
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-gray-800">{category}</h2>
              <span className="text-xs text-gray-400">{items.length}</span>
            </div>

            <ul className="flex flex-col gap-1.5">
              {items.map((g) => (
                <li
                  key={g.id}
                  className="rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:border-astra-light"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
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
                      <span className="truncate font-medium text-gray-900">
                        {g.title}
                      </span>
                    </button>

                    {g.is_active === false && (
                      <Badge tone="neutral">Non attiva</Badge>
                    )}

                    <a
                      href={g.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-astra-primary"
                      title="Apri il file"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>

                  {openId === g.id && canWrite && (
                    <div className="border-t border-gray-100 p-5">
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
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Titolo" required>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Categoria" required hint="Scegli una esistente o scrivine una nuova.">
          <Input list="guide-categories" value={form.category} onChange={(e) => set("category", e.target.value)} />
          <datalist id="guide-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
      </div>

      <Field label="Descrizione">
        <Textarea
          value={form.description ?? ""}
          rows={2}
          className="min-h-0"
          onChange={(e) => set("description", e.target.value || null)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <Field label="Link al file" required>
          <Input value={form.file_url} onChange={(e) => set("file_url", e.target.value)} />
        </Field>
        <Field label="Ordine">
          <Input
            inputMode="numeric"
            value={form.order_index === null ? "" : String(form.order_index)}
            onChange={(e) => set("order_index", e.target.value === "" ? null : Number(e.target.value))}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 px-4 py-3">
          <label className="cursor-pointer text-sm font-medium text-astra-primary hover:text-astra-accent">
            {uploading ? "Caricamento…" : "Carica un PDF"}
            <input
              type="file"
              hidden
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
            />
          </label>
          <span className="text-xs text-gray-400">Sostituisce il link qui sopra.</span>
        </div>
        <Toggle label="Visibile sul sito" checked={form.is_active} onChange={(v) => set("is_active", v)} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-2">
        <Button
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
        >
          {pending ? "Salvataggio…" : "Salva"}
        </Button>
        <Button variant="secondary" disabled={pending} onClick={() => onDone(null)}>
          Annulla
        </Button>

        {form.id && canDelete && (
          <Button
            variant="danger"
            disabled={pending}
            className="ml-auto"
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
          >
            Elimina
          </Button>
        )}
      </div>
    </div>
  );
}
