import { createPublicClient } from "@/lib/supabase/public";

export type Guide = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  thumbnailUrl: string | null;
};

/** How many active guides each category has, keyed by category slug. */
export async function getGuideCounts(): Promise<Record<string, number>> {
  const supabase = createPublicClient();
  const { data } = await supabase.from("guides").select("category").eq("is_active", true);
  const counts: Record<string, number> = {};
  for (const row of data ?? []) counts[row.category] = (counts[row.category] ?? 0) + 1;
  return counts;
}

export async function getGuides(slug: string): Promise<Guide[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("guides")
    .select("id, title, description, file_url, thumbnail_url")
    .eq("category", slug)
    .eq("is_active", true)
    .order("order_index", { ascending: true, nullsFirst: false });
  return (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    fileUrl: r.file_url,
    thumbnailUrl: r.thumbnail_url,
  }));
}
