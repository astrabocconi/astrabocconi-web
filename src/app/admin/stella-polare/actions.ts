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
};

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
    // Stamp the first publish, but never overwrite an existing date.
    ...(input.status === "published" ? { published_at: new Date().toISOString() } : {}),
  };

  if (input.id) {
    const { data: existing } = await supabase
      .from("articles")
      .select("published_at")
      .eq("id", input.id)
      .single();
    if (existing?.published_at) delete (row as { published_at?: string }).published_at;

    const { error } = await supabase
      .from("articles")
      .update(row)
      .eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    revalidateArticle(slug);
    return { ok: true, data: input.id };
  }

  const { data, error } = await supabase
    .from("articles")
    .insert({ ...row, created_by: user.id })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

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

export async function uploadCover(formData: FormData): Promise<Result<string>> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0)
    return { ok: false, error: "Nessun file" };
  if (!file.type.startsWith("image/"))
    return { ok: false, error: "Il file deve essere un'immagine" };
  if (file.size > 8 * 1024 * 1024)
    return { ok: false, error: "Massimo 8 MB" };

  const supabase = await createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `covers/${crypto.randomUUID()}.${ext}`;

  // Storage policies gate this, same as the table policies gate the row.
  const { error } = await supabase.storage
    .from("stella_polare")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { ok: false, error: error.message };

  const { data } = supabase.storage.from("stella_polare").getPublicUrl(path);
  return { ok: true, data: data.publicUrl };
}

function revalidateArticle(slug: string) {
  revalidatePath("/admin/stella-polare");
  revalidatePath("/stella-polare");
  revalidatePath(`/stella-polare/${slug}`);
}
