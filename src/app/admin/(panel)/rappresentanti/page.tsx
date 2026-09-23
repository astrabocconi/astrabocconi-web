import { createClient } from "@/lib/supabase/server";
import { requireOperator } from "@/lib/auth/operator";
import { PageHeader } from "@/components/admin/ui/page-header";
import { RepresentativesManager, type Representative } from "./representatives-manager";

export const metadata = { title: "Rappresentanti" };

export default async function RepresentativesPage() {
  const op = await requireOperator();
  const supabase = await createClient();

  const { data: reps } = await supabase
    .from("representatives")
    .select("id, name, section, url")
    .order("section", { ascending: true })
    .order("name", { ascending: true });

  return (
    <>
      <PageHeader title="Rappresentanti" subtitle="Le persone elencate su /rappresentanti, divise per sezione." />
      <RepresentativesManager
        representatives={(reps ?? []) as Representative[]}
        canWrite={op.can("representatives:write")}
        canDelete={op.can("representatives:delete")}
      />
    </>
  );
}
