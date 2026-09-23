import { createClient } from "@/lib/supabase/server";
import { requireOperator } from "@/lib/auth/operator";
import { PageHeader } from "@/components/admin/ui/page-header";
import { GuidesManager, type Guide } from "./guides-manager";

export const metadata = { title: "Guide" };

export default async function GuidesPage() {
  const op = await requireOperator();
  const supabase = await createClient();

  // Deactivated guides come back only for holders of guides:write, via the
  // second select policy added in migration 004.
  const { data: guides } = await supabase
    .from("guides")
    .select("id, title, category, description, file_url, thumbnail_url, order_index, is_active")
    .order("category", { ascending: true })
    .order("order_index", { ascending: true, nullsFirst: false });

  return (
    <>
      <PageHeader title="Guide" subtitle="PDF raggruppati per categoria, pubblicati su /guide." />
      <GuidesManager
        guides={(guides ?? []) as Guide[]}
        canWrite={op.can("guides:write")}
        canDelete={op.can("guides:delete")}
      />
    </>
  );
}
