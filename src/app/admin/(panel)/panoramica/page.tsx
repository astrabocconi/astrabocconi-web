import Link from "next/link";
import { CalendarDays, ChevronRight, FileText, Megaphone, Newspaper } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireOperator } from "@/lib/auth/operator";
import { visibleSections } from "@/lib/admin-nav";
import { getUpcomingEvents, isEventsConfigured } from "@/lib/events";
import { ACTION_LABEL, TABLE_LABEL, ago } from "@/lib/admin-activity";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Card, StatCard } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { pageIcon } from "@/components/admin/page-icons";

export const metadata = { title: "Panoramica" };

export default async function OverviewPage() {
  const op = await requireOperator();
  const supabase = await createClient();

  const head = { count: "exact" as const, head: true };
  const [published, drafts, handouts, clmg, magistrali, guides, notices, activity, events] = await Promise.all([
    supabase.from("articles").select("id", head).eq("status", "published"),
    supabase.from("articles").select("id", head).eq("status", "draft"),
    supabase.from("handouts").select("id", head),
    supabase.from("clmg_handouts").select("id", head),
    supabase.from("magistrali_handouts").select("id", head),
    supabase.from("guides").select("id", head).eq("is_active", true),
    // Every active notice, scheduled and expired included: what an editor wants to know about.
    supabase.from("notices").select("id", head).eq("is_active", true),
    supabase
      .from("content_audit")
      .select("id, table_name, action, actor_email, summary, changed_at")
      .order("changed_at", { ascending: false })
      .limit(8),
    isEventsConfigured() ? getUpcomingEvents(100) : Promise.resolve(null),
  ]);

  const n = (r: { count: number | null; error: unknown }) => (r.error ? "n/d" : (r.count ?? 0));
  const dispense =
    handouts.error || clmg.error || magistrali.error
      ? "n/d"
      : (handouts.count ?? 0) + (clmg.count ?? 0) + (magistrali.count ?? 0);

  // Cards mirror the sidebar, so nobody is shown a section that would bounce them.
  const sections = visibleSections(op.can).filter((s) => s.key !== "overview");
  const firstName = op.fullName?.split(" ")[0];

  return (
    <>
      <PageHeader
        title={firstName ? `Ciao, ${firstName}` : "Backoffice ASTRA"}
        subtitle="Cosa c'è sul sito in questo momento."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard
          tone="brand"
          label="Eventi in programma"
          value={events ? events.length : "n/d"}
          hint="Pubblicati, sito e app"
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <StatCard
          label="Articoli"
          value={n(published)}
          hint={`${n(drafts)} in bozza`}
          icon={<Newspaper className="h-5 w-5" />}
        />
        <StatCard label="Dispense" value={dispense} hint="Tutti i corsi" icon={<FileText className="h-5 w-5" />} />
        <StatCard label="Guide attive" value={n(guides)} icon={<FileText className="h-5 w-5" />} />
        <StatCard label="Avvisi attivi" value={n(notices)} icon={<Megaphone className="h-5 w-5" />} />
      </div>

      {sections.map((section) => (
        <div key={section.key}>
          <div className="mt-8 mb-3 flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">{section.label}</h2>
            <Badge tone="neutral">{section.pages.length}</Badge>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {section.pages.map((page) => {
              const Icon = pageIcon(page.href);
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  className="group flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-astra-light hover:shadow-md"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-astra-light text-astra-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-gray-900">{page.label}</span>
                    <span className="block truncate text-sm text-gray-500">{page.blurb}</span>
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-astra-accent" />
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Attività recente</h2>
          <Link href="/admin/attivita" className="text-sm font-medium text-astra-primary hover:text-astra-accent">
            Vedi tutto
          </Link>
        </div>
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
    </>
  );
}
