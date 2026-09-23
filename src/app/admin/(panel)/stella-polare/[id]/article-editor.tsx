"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  ArrowLeft,
  Bold,
  ExternalLink,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Undo2,
} from "lucide-react";
import { deleteArticle, saveArticle } from "../actions";
import { slugify } from "@/lib/slug";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/admin/ui/button";
import { Card } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Field, Input, Select, Textarea } from "@/components/admin/ui/field";

export type Article = {
  id?: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  author: string;
  cover_url: string;
  body_html: string;
  status: "draft" | "published";
  /** YYYY-MM-DD or empty. */
  published_on: string;
};

type AuditEntry = {
  action: string;
  actor_email: string | null;
  summary: string | null;
  changed_at: string;
};

const EXCERPT_MAX = 280;
const NEW_CATEGORY = "__nuova__";

// Uploaded from the browser rather than through a server action: actions cap
// request bodies at 1 MB, which a single photo easily exceeds. The storage
// policy on stella_polare is what gates this.
async function uploadImage(file: File, folder: "covers" | "body"): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Il file deve essere un'immagine");
  if (file.size > 8 * 1024 * 1024) throw new Error("Massimo 8 MB");
  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("stella_polare")
    .upload(path, file, { contentType: file.type, upsert: false, cacheControl: "31536000" });
  if (error) throw new Error(error.message);
  return supabase.storage.from("stella_polare").getPublicUrl(path).data.publicUrl;
}

export function ArticleEditor({
  article,
  history,
  categories,
  canDelete,
}: {
  article: Article;
  history: AuditEntry[];
  categories: string[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState(article);
  const [saved, setSaved] = useState(article);
  const [slugTouched, setSlugTouched] = useState(Boolean(article.slug));
  const [newCategory, setNewCategory] = useState(false);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: article.body_html,
    onUpdate: ({ editor }) => setForm((f) => ({ ...f, body_html: editor.getHTML() })),
    // TipTap normalises the stored HTML on load, so compare against what it
    // produced rather than the raw string, or a fresh page would read as dirty.
    onCreate: ({ editor }) => {
      const html = editor.getHTML();
      setForm((f) => ({ ...f, body_html: html }));
      setSaved((s) => ({ ...s, body_html: html }));
    },
    editorProps: {
      attributes: { class: "prose-astra min-h-[28rem] px-5 py-4 outline-none" },
    },
  });

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function set<K extends keyof Article>(key: K, value: Article[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function save(status: "draft" | "published") {
    if (!editor) return;
    startTransition(async () => {
      const res = await saveArticle({
        ...form,
        status,
        body_html: editor.getHTML(),
        category: form.category || null,
        excerpt: form.excerpt || null,
        author: form.author || null,
        cover_url: form.cover_url || null,
      });
      if (!res.ok) {
        setMessage({ tone: "error", text: res.error });
        return;
      }
      const next = { ...form, status, id: res.data };
      setForm(next);
      setSaved(next);
      setMessage({
        tone: "ok",
        text:
          status === "published"
            ? article.status === "published" ? "Modifiche pubblicate" : "Articolo pubblicato"
            : "Bozza salvata",
      });
      if (!form.id) router.replace(`/admin/stella-polare/${res.data}`);
      else router.refresh();
    });
  }

  // Ctrl/Cmd+S saves without changing the status, so it can never publish or
  // unpublish by accident.
  // Re-bound every render so it always sees the current form.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save(saved.status);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const categoryOptions =
    form.category && !categories.includes(form.category) ? [...categories, form.category] : categories;
  const published = saved.status === "published";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <NextLink
          href="/admin/stella-polare"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-astra-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Stella Polare
        </NextLink>
        <Badge tone={published ? "brand" : "neutral"}>{published ? "Pubblicato" : "Bozza"}</Badge>
        {dirty && <span className="text-xs font-medium text-amber-600">Modifiche non salvate</span>}
        {published && form.id && (
          <a
            href={`/stella-polare/${saved.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-astra-primary"
          >
            Vedi sul sito
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        <div className="ml-auto flex items-center gap-2">
          {published ? (
            <>
              <Button variant="secondary" onClick={() => save("draft")} disabled={pending}>
                Torna in bozza
              </Button>
              <Button onClick={() => save("published")} disabled={pending || !form.title.trim()}>
                {pending ? "Salvataggio…" : "Aggiorna"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => save("draft")} disabled={pending || !form.title.trim()}>
                Salva bozza
              </Button>
              <Button onClick={() => save("published")} disabled={pending || !form.title.trim()}>
                {pending ? "Salvataggio…" : "Pubblica"}
              </Button>
            </>
          )}
        </div>
      </div>

      {message && (
        <p className={`text-sm ${message.tone === "error" ? "text-red-600" : "text-gray-600"}`}>{message.text}</p>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <input
            value={form.title}
            placeholder="Titolo dell'articolo"
            onChange={(e) => {
              set("title", e.target.value);
              if (!slugTouched) set("slug", slugify(e.target.value));
            }}
            className="w-full bg-transparent text-3xl font-bold tracking-tight text-gray-900 outline-none placeholder:text-gray-300"
          />

          <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center gap-1 border-b border-gray-100 px-3 pt-2">
              {(["Scrivi", "Anteprima"] as const).map((label, i) => {
                const on = preview === (i === 1);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setPreview(i === 1)}
                    className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
                      on ? "border-astra-primary text-astra-primary" : "border-transparent text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className={preview ? "hidden" : ""}>
              {editor && <Toolbar editor={editor} onError={(t) => setMessage({ tone: "error", text: t })} />}
              <EditorContent editor={editor} />
            </div>

            {preview && (
              // Same class the public article page renders the body with.
              <div className="prose-astra min-h-[28rem] px-5 py-4" dangerouslySetInnerHTML={{ __html: form.body_html }} />
            )}
          </div>

          <p className="mt-2 text-xs text-gray-400">Ctrl+S (o Cmd+S) salva senza cambiare lo stato.</p>

          {history.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-2 text-sm font-semibold text-gray-800">Cronologia</h2>
              <ul className="flex flex-col gap-1">
                {history.map((h, i) => (
                  <li key={i} className="text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{h.actor_email ?? "sistema"}</span>{" "}
                    {h.action === "insert" ? "ha creato" : h.action === "update" ? "ha modificato" : "ha eliminato"}{" "}
                    {new Date(h.changed_at).toLocaleString("it-IT")}
                    {h.summary?.includes("->") && ` · ${h.summary.split("(")[1]?.replace(")", "")}`}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-80">
          <Card className="flex flex-col gap-4">
            <Field label="Categoria">
              {newCategory ? (
                <div className="flex gap-2">
                  <Input
                    autoFocus
                    value={form.category}
                    placeholder="Nome della categoria"
                    onChange={(e) => set("category", e.target.value)}
                  />
                  <Button variant="secondary" onClick={() => setNewCategory(false)}>
                    Elenco
                  </Button>
                </div>
              ) : (
                <Select
                  value={form.category}
                  onChange={(e) => {
                    if (e.target.value === NEW_CATEGORY) {
                      setNewCategory(true);
                      set("category", "");
                    } else set("category", e.target.value);
                  }}
                >
                  <option value="">Nessuna</option>
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value={NEW_CATEGORY}>+ Nuova categoria</option>
                </Select>
              )}
            </Field>

            <Field label="Autore">
              <Input value={form.author} onChange={(e) => set("author", e.target.value)} />
            </Field>

            <Field
              label="Data di pubblicazione"
              hint={form.published_on ? undefined : "Vuota: si usa la data della prima pubblicazione."}
            >
              <Input type="date" value={form.published_on} onChange={(e) => set("published_on", e.target.value)} />
            </Field>

            <Field label="Slug" hint={`/stella-polare/${form.slug || "…"}`}>
              <Input
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
              />
            </Field>

            <Field label="Estratto" hint={`${form.excerpt.length}/${EXCERPT_MAX} caratteri, mostrato nell'indice.`}>
              <Textarea
                value={form.excerpt}
                maxLength={EXCERPT_MAX}
                rows={4}
                onChange={(e) => set("excerpt", e.target.value)}
              />
            </Field>
          </Card>

          <Card>
            <CoverPicker
              value={form.cover_url}
              onChange={(v) => set("cover_url", v)}
              onError={(t) => setMessage({ tone: "error", text: t })}
            />
          </Card>

          {form.id && canDelete && (
            <Button
              variant="danger"
              disabled={pending}
              onClick={() => {
                if (!confirm("Eliminare definitivamente questo articolo?")) return;
                startTransition(async () => {
                  const res = await deleteArticle(form.id!, saved.slug);
                  if (res.ok) {
                    setSaved(form);
                    router.push("/admin/stella-polare");
                  } else setMessage({ tone: "error", text: res.error });
                });
              }}
            >
              Elimina articolo
            </Button>
          )}
        </aside>
      </div>
    </div>
  );
}

function Toolbar({ editor, onError }: { editor: Editor; onError: (text: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const btn = (active: boolean) =>
    `rounded-lg p-1.5 transition-colors disabled:opacity-40 ${
      active ? "bg-astra-light text-astra-primary" : "text-gray-500 hover:bg-gray-100"
    }`;
  const sep = <span className="mx-1 h-4 w-px bg-gray-200" />;

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-gray-100 bg-gray-50/90 px-2 py-1.5 backdrop-blur">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))} title="Grassetto">
        <Bold className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))} title="Corsivo">
        <Italic className="h-4 w-4" />
      </button>
      {sep}
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))} title="Titolo">
        <Heading2 className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))} title="Sottotitolo">
        <Heading3 className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))} title="Citazione">
        <Quote className="h-4 w-4" />
      </button>
      {sep}
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))} title="Elenco">
        <List className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))} title="Elenco numerato">
        <ListOrdered className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btn(false)} title="Separatore">
        <Minus className="h-4 w-4" />
      </button>
      {sep}
      <button
        type="button"
        onClick={() => {
          const previous = editor.getAttributes("link").href ?? "";
          const url = window.prompt("Indirizzo del link", previous);
          if (url === null) return;
          if (url === "") editor.chain().focus().unsetLink().run();
          else editor.chain().focus().setLink({ href: url }).run();
        }}
        className={btn(editor.isActive("link"))}
        title="Link"
      >
        <Link2 className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className={btn(false)} title="Inserisci immagine">
        <ImagePlus className="h-4 w-4" />
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setUploading(true);
          try {
            const src = await uploadImage(file, "body");
            const alt = window.prompt("Testo alternativo (descrive l'immagine a chi non la vede)", "") ?? "";
            editor.chain().focus().setImage({ src, alt }).run();
          } catch (err) {
            onError(err instanceof Error ? err.message : "Caricamento non riuscito");
          } finally {
            setUploading(false);
          }
        }}
      />
      {uploading && <span className="ml-1 text-xs text-gray-500">Caricamento…</span>}
      <span className="ml-auto flex items-center gap-0.5">
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btn(false)} title="Annulla">
          <Undo2 className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btn(false)} title="Ripeti">
          <Redo2 className="h-4 w-4" />
        </button>
      </span>
    </div>
  );
}

function CoverPicker({
  value,
  onChange,
  onError,
}: {
  value: string;
  onChange: (v: string) => void;
  onError: (m: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-700">Copertina</span>
      {value ? (
        // Remote Supabase Storage URL, deliberately not next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="aspect-16/10 w-full rounded-xl border border-gray-100 object-cover" />
      ) : (
        <div className="grid aspect-16/10 w-full place-items-center rounded-xl border border-dashed border-gray-200 text-xs text-gray-400">
          Nessuna copertina
        </div>
      )}
      <div className="flex items-center gap-3">
        <label className="cursor-pointer text-sm font-medium text-astra-primary hover:text-astra-accent">
          {uploading ? "Caricamento…" : value ? "Sostituisci" : "Carica immagine"}
          <input
            type="file"
            accept="image/*"
            hidden
            disabled={uploading}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              setUploading(true);
              try {
                onChange(await uploadImage(file, "covers"));
              } catch (err) {
                onError(err instanceof Error ? err.message : "Caricamento non riuscito");
              } finally {
                setUploading(false);
              }
            }}
          />
        </label>
        {value && (
          <button type="button" onClick={() => onChange("")} className="text-sm text-gray-500 hover:text-red-600">
            Rimuovi
          </button>
        )}
      </div>
      <span className="text-xs text-gray-400">Consigliato 1600 × 1000 px, massimo 8 MB.</span>
    </div>
  );
}
