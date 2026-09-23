"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { slugify } from "@/lib/slug";

type Result<T = void> = { ok: true; data: T } | { ok: false; error: string };

type ArticleInput = {
  id?: string;
  slug: string;
  title: string;
  category: string | null;
  excerpt: string | null;
  author: string | null;
  cover_url: string | null;
  body_html: string;
  status: "draft" | "published";
  /** YYYY-MM-DD, or empty to keep the existing date (or stamp today on first publish). */
  published_on: string;
};

// Noon UTC so the calendar day survives any timezone the page is rendered in.
function dayToIso(day: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const d = new Date(`${day}T12:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== day ? null : d.toISOString();
}

// Writes are gated by RLS on the caller's own session, so there is no service
// key here and no permission check to keep in sync with the database.
export async function saveArticle(input: ArticleInput): Promise<Result<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non autenticato" };

  const title = input.title.trim();
  if (!title) return { ok: false, error: "Il titolo è obbligatorio" };

  const slug = slugify(input.slug || title);
  if (!slug) return { ok: false, error: "Slug non valido" };

  let publishedAt: string | null = null;
  if (input.published_on) {
    publishedAt = dayToIso(input.published_on);
    if (!publishedAt) return { ok: false, error: "Data di pubblicazione non valida" };
  }

  const existing = input.id
    ? (await supabase.from("articles").select("published_at, slug").eq("id", input.id).single()).data
    : null;

  const row = {
    slug,
    title,
    category: input.category?.trim() || null,
    excerpt: input.excerpt?.trim() || null,
    author: input.author?.trim() || null,
    cover_url: input.cover_url?.trim() || null,
    body_html: sanitizeArticleHtml(input.body_html),
    status: input.status,
    updated_by: user.id,
    // An explicit date wins; otherwise stamp the first publish and never
    // overwrite a date that already exists.
    ...(publishedAt
      ? { published_at: publishedAt }
      : input.status === "published" && !existing?.published_at
        ? { published_at: new Date().toISOString() }
        : {}),
  };

  if (input.id) {
    const { error } = await supabase.from("articles").update(row).eq("id", input.id);
    if (error) return { ok: false, error: friendly(error.message) };
    revalidateArticle(slug, existing?.slug);
    return { ok: true, data: input.id };
  }

  const { data, error } = await supabase
    .from("articles")
    .insert({ ...row, created_by: user.id })
    .select("id")
    .single();
  if (error) return { ok: false, error: friendly(error.message) };

  revalidateArticle(slug);
  return { ok: true, data: data.id };
}

export async function deleteArticle(id: string, slug: string): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidateArticle(slug);
  return { ok: true, data: undefined };
}

function friendly(message: string) {
  return message.includes("articles_slug") || message.includes("duplicate key")
    ? "Esiste già un articolo con questo slug"
    : message;
}

function revalidateArticle(slug: string, previousSlug?: string | null) {
  revalidatePath("/admin/stella-polare");
  revalidatePath("/stella-polare");
  revalidatePath(`/stella-polare/${slug}`);
  if (previousSlug && previousSlug !== slug) revalidatePath(`/stella-polare/${previousSlug}`);
}
