import { createClient } from "@/lib/supabase/server";
import { requireOperator } from "@/lib/auth/operator";
import { PageHeader } from "@/components/admin/ui/page-header";
import { parseButtons } from "@/lib/site-content";
import { ConferenceForm } from "./conference-form";

export const metadata = { title: "Conferenza" };

export default async function ConferencePage() {
  await requireOperator();
  const supabase = await createClient();

  // Read raw rather than through parseConference, which returns null without a
  // title: the editor still has to load a half-filled draft.
  const { data: row } = await supabase
    .from("site_sections")
    .select("data, is_visible, updated_at")
    .eq("key", "conference")
    .maybeSingle();

  const d = (row?.data ?? {}) as Record<string, unknown>;
  const s = (k: string) => (typeof d[k] === "string" ? (d[k] as string) : "");

  return (
    <>
      <PageHeader
        title="Conferenza"
        subtitle="La scheda accanto agli eventi, in fondo alla home. Nascosta, non compare."
      />
      <ConferenceForm
        initial={{
          eyebrow: s("eyebrow"),
          title: s("title"),
          dates: s("dates"),
          location: s("location"),
          description: s("description"),
          imageUrl: s("imageUrl"),
          buttons: parseButtons(d.buttons),
        }}
        initialVisible={row?.is_visible ?? false}
      />
    </>
  );
}
