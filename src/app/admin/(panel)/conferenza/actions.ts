"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";
import { isSafeUrl, validateButtons, type ConferenceData } from "@/lib/site-content";

type Result = { ok: true } | { ok: false; error: string };

const LIMITS: [keyof ConferenceData, string, number][] = [
  ["eyebrow", "Occhiello", 40],
  ["title", "Titolo", 120],
  ["dates", "Date", 80],
  ["location", "Luogo", 120],
  ["description", "Descrizione", 1200],
];

export async function saveConference(input: ConferenceData, isVisible: boolean): Promise<Result> {
  const data: { [key: string]: Json } = {};
  for (const [key, label, max] of LIMITS) {
    const v = String(input[key] ?? "").trim();
    if (v.length > max) return { ok: false, error: `${label} troppo lungo (max ${max})` };
    if (v) data[key] = v;
  }
  if (isVisible && !data.title) return { ok: false, error: "Serve un titolo per rendere visibile la sezione" };

  const imageUrl = String(input.imageUrl ?? "").trim();
  if (imageUrl && !isSafeUrl(imageUrl)) return { ok: false, error: "Indirizzo immagine non valido" };
  if (imageUrl) data.imageUrl = imageUrl;

  const buttons = validateButtons(input.buttons ?? []);
  if (!buttons.ok) return buttons;
  data.buttons = buttons.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non autenticato" };

  const { error } = await supabase
    .from("site_sections")
    .upsert({ key: "conference", data, is_visible: isVisible, updated_by: user.id });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/conferenza");
  return { ok: true };
}
