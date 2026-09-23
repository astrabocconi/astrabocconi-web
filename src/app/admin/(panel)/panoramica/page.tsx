import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireOperator } from "@/lib/auth/operator";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Card, StatCard } from "@/components/admin/ui/card";

export const metadata = { title: "Panoramica" };

const TABLE_LABEL: Record<string, string> = {
  articles: "Stella Polare",
  guides: "Guide",
  representatives: "Rappresentanti",
  handouts: "Dispense",
  clmg_handouts: "Dispense CLMG",
  magistrali_handouts: "Dispense magistrali",
  notices: "Avvisi",
  site_sections: "Home page",
};

const ACTION_LABEL: Record<string, string> = {
  insert: "ha creato",
  update: "ha modificato",
  delete: "ha eliminato",
};

const rtf = new Intl.RelativeTimeFormat("it-IT", { numeric: "auto" });

function ago(iso: string) {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  return rtf.format(Math.round(hours / 24), "day");
}

export default async function OverviewPage() {
  const op = await requireOperator();
  const supabase = await createClient();

  const head = { count: "exact" as const, head: true };
  const [published, drafts, handouts, clmg, magistrali, guides, notices, activity] = await Promise.all([
    supabase.from("articles").select("id", head).eq("status", "published"),
    supabase.from("articles").select("id", head).eq("status", "draft"),
    supabase.from("handouts").select("id", head),
    supabase.from("clmg_handouts").select("id", head),
    supabase.from("magistrali_handouts").select("id", head),
    supabase.from("guides").select("id", head).eq("is_active", true),
    // Counts every active row the operator can see; scheduled and expired
    // notices included, which is what an editor wants to know about.
    supabase.from("notices").select("id", head).eq("is_active", true),
    supabase
      .from("content_audit")
      .select("id, table_name, action, actor_email, summary, changed_at")
      .order("changed_at", { ascending: false })
      .limit(12),
  ]);

  const n = (r: { count: number | null; error: unknown }) => (r.error ? "n/d" : (r.count ?? 0));
  const dispense =
    handouts.error || clmg.error || magistrali.error
      ? "n/d"
      : (handouts.count ?? 0) + (clmg.count ?? 0) + (magistrali.count ?? 0);

  const sections = ADMIN_NAV.flatMap((s) => s.pages).filter(
    (p) => p.href !== "/admin/panoramica" && (p.permission === null || op.can(p.permission)),
  );

  return (
    <>
      <PageHeader title={`Ciao ${op.fullName?.split(" ")[0] ?? ""}`.trim()} subtitle="Cosa c'è sul sito in questo momento." />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Articoli pubblicati" value={n(published)} tone="brand" />
        <StatCard label="Bozze" value={n(drafts)} />
        <StatCard label="Dispense" value={dispense} />
        <StatCard label="Guide attive" value={n(guides)} />
        <StatCard label="Avvisi attivi" value={n(notices)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-2">
          <h2 className="mb-2 text-sm font-semibold text-gray-800">Vai a</h2>
          <div className="flex flex-col gap-2">
            {sections.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm transition-all hover:border-astra-light hover:shadow-md"
              >
                {s.label}
                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-astra-accent" />
              </Link>
            ))}
          </div>
        </section>

        <section className="lg:col-span-3">
          <h2 className="mb-2 text-sm font-semibold text-gray-800">Attività recente</h2>
          <Card className="p-0!">
            {(activity.data ?? []).length === 0 ? (
              <p className="p-5 text-sm text-gray-400">Nessuna modifica registrata.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {(activity.data ?? []).map((a) => (
                  <li key={a.id} className="flex items-start gap-3 px-5 py-3 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-700">
                        <span className="font-medium text-gray-900">{a.actor_email ?? "sistema"}</span>{" "}
                        {ACTION_LABEL[a.action] ?? a.action}{" "}
                        <span className="text-gray-900">{a.summary || "un elemento"}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">{TABLE_LABEL[a.table_name] ?? a.table_name}</p>
                    </div>
                    <span className="shrink-0 text-xs text-gray-400">{ago(a.changed_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>
      </div>
    </>
  );
}
