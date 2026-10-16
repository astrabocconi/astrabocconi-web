import { createClient } from "@/lib/supabase/server";
import { requireOperator } from "@/lib/auth/operator";
import { PageHeader } from "@/components/admin/ui/page-header";
import { parsePartnerBar } from "@/lib/site-content";
import { PartnerBarForm } from "./partner-bar-form";

export const metadata = { title: "Partner" };

export default async function PartnerPage() {
  await requireOperator();
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("site_sections")
    .select("data, is_visible")
    .eq("key", "partner_bar")
    .maybeSingle();

  return (
    <>
      <PageHeader
        title="Partner"
        subtitle="I loghi che scorrono nella fascia blu della home. Nascosta, la fascia non compare."
      />
      <PartnerBarForm initial={parsePartnerBar(row?.data)} initialVisible={row?.is_visible ?? false} />
    </>
  );
}
