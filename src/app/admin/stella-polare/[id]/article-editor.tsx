"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link2,
  Undo2,
  Redo2,
} from "lucide-react";
import { deleteArticle, saveArticle, uploadCover } from "../actions";
import { slugify } from "@/lib/slug";

type Article = {
  id?: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  author: string;
  cover_url: string;
  body_html: string;
  status: "draft" | "published";
};

type AuditEntry = {
  action: string;
  actor_email: string | null;
  summary: string | null;
  changed_at: string;
};

export function ArticleEditor({
  article,
  history,
}: {
  article: Article;
  history: AuditEntry[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(article);
  const [slugTouched, setSlugTouched] = useState(Boolean(article.slug));
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: article.body_html,
    editorProps: {
      attributes: {
        class:
          "prose-astra min-h-[24rem] rounded-b-xl bg-white px-4 py-3 outline-none",
      },
    },
  });

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
        setMessage(res.error);
        return;
      }
      setMessage(status === "published" ? "Pubblicato" : "Bozza salvata");
      setForm((f) => ({ ...f, status }));
      if (!form.id) router.replace(`/admin/stella-polare/${res.data}`);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:flex-row">
      <div className="min-w-0 flex-1">
        <input
          value={form.title}
          placeholder="Titolo dell'articolo"
          onChange={(e) => {
            set("title", e.target.value);
            if (!slugTouched) set("slug", slugify(e.target.value));
          }}
          className="w-full bg-transparent text-2xl font-semibold tracking-tight text-gray-900 outline-none placeholder:text-gray-300"
        />

        <div className="mt-4 rounded-xl border border-gray-200">
          {editor && <Toolbar editor={editor} />}
          <EditorContent editor={editor} />
        </div>

        {history.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Cronologia
            </h2>
            <ul className="flex flex-col gap-1">
              {history.map((h, i) => (
                <li key={i} className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">
                    {h.actor_email ?? "sistema"}
                  </span>{" "}
                  {h.action === "insert" ? "ha creato" : h.action === "update" ? "ha modificato" : "ha eliminato"}{" "}
                  {new Date(h.changed_at).toLocaleString("it-IT")}
                  {h.summary?.includes("->") && ` · ${h.summary.split("(")[1]?.replace(")", "")}`}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-80">
        <div className="flex items-center gap-2">
          <button
            onClick={() => save("draft")}
            disabled={pending}
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-60"
          >
            Salva bozza
          </button>
          <button
            onClick={() => save("published")}
            disabled={pending}
            className="flex-1 rounded-xl bg-astra-primary px-3 py-2 text-sm font-medium text-white hover:bg-astra-dark disabled:opacity-60"
          >
            {form.status === "published" ? "Aggiorna" : "Pubblica"}
          </button>
        </div>

        {message && <p className="text-xs text-gray-600">{message}</p>}

        <Field label="Slug" value={form.slug} onChange={(v) => { setSlugTouched(true); set("slug", slugify(v)); }} />
        <Field label="Categoria" value={form.category} onChange={(v) => set("category", v)} />
        <Field label="Autore" value={form.author} onChange={(v) => set("author", v)} />

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-600">Estratto</span>
          <textarea
            value={form.excerpt}
            rows={3}
            onChange={(e) => set("excerpt", e.target.value)}
            className="resize-y rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-astra-accent"
          />
        </label>

        <CoverPicker
          value={form.cover_url}
          onChange={(v) => set("cover_url", v)}
          onError={setMessage}
        />

        {form.id && (
          <button
            onClick={() => {
              if (!confirm("Eliminare definitivamente questo articolo?")) return;
              startTransition(async () => {
                const res = await deleteArticle(form.id!, form.slug);
                if (res.ok) router.push("/admin/stella-polare");
                else setMessage(res.error);
              });
            }}
            disabled={pending}
            className="mt-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Elimina articolo
          </button>
        )}
      </aside>
    </div>
  );
}

function Toolbar({ editor }: { editor: NonNullable<ReturnType<typeof useEditor>> }) {
  const btn = (active: boolean) =>
    `rounded-lg p-1.5 transition-colors ${
      active ? "bg-astra-light text-astra-primary" : "text-gray-500 hover:bg-gray-100"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-t-xl border-b border-gray-200 bg-gray-50 px-2 py-1.5">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))} title="Grassetto">
        <Bold className="h-4 w-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))} title="Corsivo">
        <Italic className="h-4 w-4" />
      </button>
      <span className="mx-1 h-4 w-px bg-gray-300" />
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))} title="Titolo">
        <Heading2 className="h-4 w-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))} title="Sottotitolo">
        <Heading3 className="h-4 w-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))} title="Citazione">
        <Quote className="h-4 w-4" />
      </button>
      <span className="mx-1 h-4 w-px bg-gray-300" />
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))} title="Elenco">
        <List className="h-4 w-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))} title="Elenco numerato">
        <ListOrdered className="h-4 w-4" />
      </button>
      <span className="mx-1 h-4 w-px bg-gray-300" />
      <button
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
      <span className="ml-auto flex items-center gap-0.5">
        <button onClick={() => editor.chain().focus().undo().run()} className={btn(false)} title="Annulla">
          <Undo2 className="h-4 w-4" />
        </button>
        <button onClick={() => editor.chain().focus().redo().run()} className={btn(false)} title="Ripeti">
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
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-gray-600">Copertina</span>
      {value && (
        // Remote Supabase Storage URLs, deliberately not next/image: the bucket
        // is not in remotePatterns and these are already sized for the card.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="aspect-16/10 w-full rounded-xl border border-gray-200 object-cover"
        />
      )}
      <input
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setUploading(true);
          const fd = new FormData();
          fd.set("file", file);
          const res = await uploadCover(fd);
          setUploading(false);
          if (res.ok) onChange(res.data);
          else onError(res.error);
        }}
        className="text-xs text-gray-500 file:mr-2 file:rounded-lg file:border-0 file:bg-gray-100 file:px-2.5 file:py-1.5 file:text-xs file:font-medium"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="self-start text-xs text-gray-500 hover:text-red-600"
        >
          Rimuovi copertina
        </button>
      )}
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
