import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireOperator } from "@/lib/auth/operator";
import { PageHeader } from "@/components/admin/ui/page-header";
import { isoToRomeLocal, parseButtons, parseTone } from "@/lib/site-content";
import { NoticeForm, type NoticeFormValue } from "./notice-form";

export const metadata = { title: "Avviso" };

const EMPTY: NoticeFormValue = {
  title: "",
  body: "",
  tone: "info",
  buttons: [],
  startsAt: "",
  endsAt: "",
  isActive: true,
};

export default async function NoticePage({ params }: PageProps<"/admin/avvisi/[id]">) {
  const { id } = await params;
  await requireOperator();

  let value = EMPTY;
  if (id !== "nuovo") {
    const supabase = await createClient();
    const { data: n } = await supabase
      .from("notices")
      .select("id, title, body, tone, buttons, starts_at, ends_at, is_active")
      .eq("id", id)
      .maybeSingle();
    if (!n) notFound();
    value = {
      id: n.id,
      title: n.title,
      body: n.body ?? "",
      tone: parseTone(n.tone),
      buttons: parseButtons(n.buttons),
      startsAt: isoToRomeLocal(n.starts_at),
      endsAt: isoToRomeLocal(n.ends_at),
      isActive: n.is_active,
    };
  }

  return (
    <>
      <Link
        href="/admin/avvisi"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-astra-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Tutti gli avvisi
      </Link>
      <PageHeader
        title={value.id ? "Modifica avviso" : "Nuovo avviso"}
        subtitle="Compare nella fascia sotto la hero della home, nell'ordine scelto in elenco."
      />
      <NoticeForm initial={value} />
    </>
  );
}
