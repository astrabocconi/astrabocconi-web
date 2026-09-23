"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  parseTone,
  romeLocalToIso,
  validateButtons,
  type NoticeButton,
} from "@/lib/site-content";

export type Result<T = void> = { ok: true; data: T } | { ok: false; error: string };

export type NoticeInput = {
  id?: string;
  title: string;
  body: string;
  tone: string;
  buttons: NoticeButton[];
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};

// RLS turns a forbidden update or delete into zero rows rather than an error.
const NO_PERMISSION = "Non hai il permesso per questa modifica";

function revalidateNotices() {
  revalidatePath("/");
  revalidatePath("/admin/avvisi");
}

export async function saveNotice(input: NoticeInput): Promise<Result<string>> {
  const title = input.title.trim();
  if (!title) return { ok: false, error: "Il titolo è obbligatorio" };
  if (title.length > 120) return { ok: false, error: "Titolo troppo lungo (max 120)" };
  const body = input.body.trim();
  if (body.length > 500) return { ok: false, error: "Testo troppo lungo (max 500)" };

  const buttons = validateButtons(input.buttons);
  if (!buttons.ok) return buttons;

  const startsAt = input.startsAt ? romeLocalToIso(input.startsAt) : null;
  const endsAt = input.endsAt ? romeLocalToIso(input.endsAt) : null;
  if ((input.startsAt && !startsAt) || (input.endsAt && !endsAt))
    return { ok: false, error: "Data non valida" };
  if (startsAt && endsAt && endsAt <= startsAt)
    return { ok: false, error: "La fine deve essere dopo l'inizio" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non autenticato" };

  const row = {
    title,
    body: body || null,
    tone: parseTone(input.tone),
    buttons: buttons.data,
    starts_at: startsAt,
    ends_at: endsAt,
    is_active: input.isActive,
    updated_by: user.id,
  };

  if (input.id) {
    const { error, count } = await supabase
      .from("notices")
      .update(row, { count: "exact" })
      .eq("id", input.id);
    if (error) return { ok: false, error: error.message };
    if (!count) return { ok: false, error: NO_PERMISSION };
    revalidateNotices();
    return { ok: true, data: input.id };
  }

  // New notices go to the bottom of the stack.
  const { data: last } = await supabase
    .from("notices")
    .select("order_index")
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("notices")
    .insert({ ...row, order_index: (last?.order_index ?? -1) + 1 })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidateNotices();
  return { ok: true, data: data.id };
}

export async function setNoticeActive(id: string, isActive: boolean): Promise<Result> {
  const supabase = await createClient();
  const { error, count } = await supabase
    .from("notices")
    .update({ is_active: isActive }, { count: "exact" })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  if (!count) return { ok: false, error: NO_PERMISSION };
  revalidateNotices();
  return { ok: true, data: undefined };
}

export async function deleteNotice(id: string): Promise<Result> {
  const supabase = await createClient();
  const { error, count } = await supabase.from("notices").delete({ count: "exact" }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  if (!count) return { ok: false, error: NO_PERMISSION };
  revalidateNotices();
  return { ok: true, data: undefined };
}

// Not atomic: a concurrent reorder can at worst leave two notices sharing an
// index, and the next move renumbers them.
export async function moveNotice(id: string, direction: "up" | "down"): Promise<Result> {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("notices")
    .select("id, order_index")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) return { ok: false, error: error.message };

  const list = rows ?? [];
  const i = list.findIndex((r) => r.id === id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= list.length) return { ok: true, data: undefined };

  // Renumber the whole list so ties cannot turn a move into a no-op.
  [list[i], list[j]] = [list[j], list[i]];
  const updates = list
    .map((r, index) => ({ id: r.id, from: r.order_index, to: index }))
    .filter((u) => u.from !== u.to);
  for (const u of updates) {
    const { error: e } = await supabase.from("notices").update({ order_index: u.to }).eq("id", u.id);
    if (e) return { ok: false, error: e.message };
  }
  revalidateNotices();
  return { ok: true, data: undefined };
}
