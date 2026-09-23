"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Result<T = void> = { ok: true; data: T } | { ok: false; error: string };

export type RepresentativeInput = {
  id?: string;
  name: string;
  section: string;
  url: string | null;
};

export async function saveRepresentative(
  input: RepresentativeInput,
): Promise<Result<string>> {
  const supabase = await createClient();

  const name = input.name.trim();
  const section = input.section.trim();
  if (!name) return { ok: false, error: "Il nome è obbligatorio" };
  if (!section) return { ok: false, error: "La sezione è obbligatoria" };

  const row = { name, section, url: input.url?.trim() || null };

  if (input.id) {
    const { error } = await supabase
      .from("representatives")
      .update(row)
      .eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    revalidate();
    return { ok: true, data: input.id };
  }

  const { data, error } = await supabase
    .from("representatives")
    .insert(row)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true, data: data.id };
}

export async function uploadRepresentativePhoto(
  formData: FormData,
): Promise<Result<string>> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0)
    return { ok: false, error: "Nessun file" };
  if (!file.type.startsWith("image/"))
    return { ok: false, error: "Il file deve essere un'immagine" };
  if (file.size > 8 * 1024 * 1024) return { ok: false, error: "Massimo 8 MB" };

  const supabase = await createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `rappresentanti/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { ok: false, error: error.message };

  const { data } = supabase.storage.from("images").getPublicUrl(path);
  return { ok: true, data: data.publicUrl };
}

export async function deleteRepresentative(id: string): Promise<Result> {
  const supabase = await createClient();
  const { error } = await supabase.from("representatives").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidate();
  return { ok: true, data: undefined };
}

function revalidate() {
  revalidatePath("/admin/rappresentanti");
  revalidatePath("/rappresentanti");
}
