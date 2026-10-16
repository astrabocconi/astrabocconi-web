"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSafeUrl, MAX_PARTNER_BRANDS } from "@/lib/site-content";
import type { BrandItem } from "@/components/ui/brand-scoller";

type Result = { ok: true } | { ok: false; error: string };

export async function savePartnerBar(input: BrandItem[], isVisible: boolean): Promise<Result> {
  if (!Array.isArray(input) || input.length > MAX_PARTNER_BRANDS)
    return { ok: false, error: `Massimo ${MAX_PARTNER_BRANDS} partner` };
  const items: { name: string; logo?: string }[] = [];
  for (const i of input) {
    const name = String(i?.name ?? "").trim();
    const logo = String(i?.logo ?? "").trim();
    if (!name) return { ok: false, error: "Ogni partner deve avere un nome" };
    if (name.length > 40) return { ok: false, error: `Nome troppo lungo: "${name}" (max 40)` };
    if (logo && !isSafeUrl(logo)) return { ok: false, error: `Logo non valido per "${name}"` };
    items.push(logo ? { name, logo } : { name });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non autenticato" };

  const { error } = await supabase
    .from("site_sections")
    .upsert({ key: "partner_bar", data: { items }, is_visible: isVisible, updated_by: user.id });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  revalidatePath("/admin/partner");
  return { ok: true };
}
