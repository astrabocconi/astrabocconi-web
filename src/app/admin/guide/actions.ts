"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Result<T = void> = { ok: true; data: T } | { ok: false; error: string };

export type GuideInput = {
  id?: string;
  title: string;
  category: string;
  description: string | null;
  file_url: string;
  thumbnail_url: string | null;
  order_index: number | null;
  is_active: boolean;
};

// RLS is the gate on every one of these; there is no service key in this file.
export async function saveGuide(input: GuideInput): Promise<Result<string>> {
  const supabase = await createClient();

  const title = input.title.trim();
  const category = input.category.trim();
  const fileUrl = input.file_url.trim();
  if (!title) return { ok: false, error: "Il titolo è obbligatorio" };
  if (!category) return { ok: false, error: "La categoria è obbligatoria" };
  if (!fileUrl) return { ok: false, error: "Serve un file o un link" };

  const row = {
    title,
    category,
    description: input.description?.trim() || null,
    file_url: fileUrl,
    thumbnail_url: input.thumbnail_url?.trim() || null,
    order_index: input.order_index,
    is_active: input.is_active,
  };

  if (input.id) {
    const { error } = await supabase.from("guides").update(row).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    revalidate();
    return { ok: true, data: input.id };
  }

  const { data, error } = await supabase
    .from("guides")
    .insert(row)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true, data: data.id };
}

export async function deleteGuide(id: string): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.from("guides").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true, data: undefined };
}

export async function uploadGuideFile(formData: FormData): Promise<Result<string>> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0)
    return { ok: false, error: "Nessun file" };
  if (file.size > 40 * 1024 * 1024)
    return { ok: false, error: "Massimo 40 MB" };

  const supabase = await createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
  const safe = file.name
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  const path = `${safe || "file"}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from("guides")
    .upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (error) return { ok: false, error: error.message };

  const { data } = supabase.storage.from("guides").getPublicUrl(path);
  return { ok: true, data: data.publicUrl };
}

function revalidate() {
  revalidatePath("/admin/guide");
  revalidatePath("/guide");
}
