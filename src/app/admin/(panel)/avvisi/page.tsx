import Link from "next/link";
import { Megaphone, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireOperator } from "@/lib/auth/operator";
import { PageHeader } from "@/components/admin/ui/page-header";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { buttonClass } from "@/components/admin/ui/button";
import { NoticesList, type NoticeRow, type NoticeStatus } from "./notices-list";

export const metadata = { title: "Avvisi" };

function statusOf(n: { is_active: boolean; starts_at: string | null; ends_at: string | null }, now: number): NoticeStatus {
  if (!n.is_active) return "off";
  if (n.starts_at && Date.parse(n.starts_at) > now) return "scheduled";
  if (n.ends_at && Date.parse(n.ends_at) <= now) return "expired";
  return "live";
}

// Outside the component: statuses depend on the clock at request time.
async function loadNotices(): Promise<NoticeRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notices")
    .select("id, title, tone, starts_at, ends_at, is_active")
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: false });

  const now = Date.now();
  return (data ?? []).map((n) => ({
    id: n.id,
    title: n.title,
    tone: n.tone,
    startsAt: n.starts_at,
    endsAt: n.ends_at,
    isActive: n.is_active,
    status: statusOf(n, now),
  }));
}

export default async function NoticesPage() {
  const op = await requireOperator();
  const rows = await loadNotices();
  const live = rows.filter((r) => r.status === "live").length;

  const newButton = (
    <Link href="/admin/avvisi/nuovo" className={buttonClass()}>
      <Plus className="h-4 w-4" />
      Nuovo avviso
    </Link>
  );

  return (
    <>
      <PageHeader
        title="Avvisi"
        subtitle={
          live === 0
            ? "Nessun avviso visibile: la fascia sotto la hero è nascosta."
            : `${live === 1 ? "1 avviso visibile" : `${live} avvisi visibili`} sotto la hero della home.`
        }
        actions={newButton}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<Megaphone className="h-7 w-7" />}
          title="Nessun avviso"
          description="Gli avvisi compaiono in una fascia subito sotto la hero. Quando non ce ne sono, la fascia sparisce."
          action={newButton}
        />
      ) : (
        <NoticesList rows={rows} canDelete={op.can("site:delete")} />
      )}
    </>
  );
}
