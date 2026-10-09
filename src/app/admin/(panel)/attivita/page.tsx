import Link from "next/link";
import { History } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireOperator } from "@/lib/auth/operator";
import { ACTION_LABEL, TABLE_LABEL } from "@/lib/admin-activity";
import { PageHeader } from "@/components/admin/ui/page-header";
import { EmptyState } from "@/components/admin/ui/empty-state";

export const metadata = { title: "Attività" };

const PAGE_SIZE = 100;

const fmt = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Rome",
});

// Area filter: the three handout tables read as one area.
const AREAS: { key: string; label: string; tables: string[] }[] = [
  { key: "eventi", label: "Eventi", tables: ["Event"] },
  { key: "home", label: "Home page", tables: ["notices", "site_sections"] },
  { key: "stella-polare", label: "Stella Polare", tables: ["articles"] },
  { key: "dispense", label: "Dispense", tables: ["handouts", "clmg_handouts", "magistrali_handouts"] },
  { key: "guide", label: "Guide", tables: ["guides"] },
  { key: "rappresentanti", label: "Rappresentanti", tables: ["representatives"] },
  { key: "operatori", label: "Operatori", tables: ["admin_users"] },
];

const TONE: Record<string, string> = {
  insert: "bg-astra-light text-astra-primary",
  update: "bg-gray-100 text-gray-600",
  delete: "bg-red-50 text-red-600",
};

export default async function ActivityPage({ searchParams }: PageProps<"/admin/attivita">) {
  await requireOperator();
  const sp = await searchParams;
  const areaKey = typeof sp.area === "string" ? sp.area : "";
  const area = AREAS.find((a) => a.key === areaKey);
  const page = Math.max(1, Number(sp.pagina) || 1);

  const supabase = await createClient();
  let query = supabase
    .from("content_audit")
    .select("id, table_name, action, actor_email, summary, changed_at", { count: "exact" })
    .order("changed_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (area) query = query.in("table_name", area.tables);
  const { data: rows, count } = await query;
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const href = (a: string, p = 1) => {
    const q = new URLSearchParams();
    if (a) q.set("area", a);
    if (p > 1) q.set("pagina", String(p));
    const s = q.toString();
    return `/admin/attivita${s ? `?${s}` : ""}`;
  };
  const chip = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs font-medium transition-colors ${
      active ? "bg-astra-primary text-white" : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
    }`;

  return (
    <>
      <PageHeader
        title="Attività"
        subtitle="Chi ha cambiato cosa, e quando. Il registro si scrive da solo e non si modifica: nemmeno un proprietario può cancellarne una riga."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Link href={href("")} className={chip(!area)}>
          Tutto
        </Link>
        {AREAS.map((a) => (
          <Link key={a.key} href={href(a.key)} className={chip(area?.key === a.key)}>
            {a.label}
          </Link>
        ))}
      </div>

      {(rows ?? []).length === 0 ? (
        <EmptyState
          icon={<History className="h-7 w-7" />}
          title="Niente da mostrare"
          description="Ogni creazione, modifica ed eliminazione fatta dal backoffice viene registrata qui."
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs tracking-wide text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Quando</th>
                <th className="px-4 py-3 font-medium">Chi</th>
                <th className="px-4 py-3 font-medium">Azione</th>
                <th className="px-4 py-3 font-medium">Cosa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(rows ?? []).map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">{fmt.format(new Date(r.changed_at))}</td>
                  <td className="px-4 py-3 text-gray-800">{r.actor_email ?? <span className="text-gray-400">sistema</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${TONE[r.action] ?? TONE.update}`}>
                      {ACTION_LABEL[r.action] ?? r.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <span className="font-medium">{TABLE_LABEL[r.table_name] ?? r.table_name}</span>
                    {r.summary && <span className="text-gray-500"> · {r.summary}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link href={href(areaKey, page - 1)} className="font-medium text-astra-primary hover:text-astra-accent">
              Più recenti
            </Link>
          ) : (
            <span />
          )}
          <span className="text-xs text-gray-400">
            Pagina {page} di {pages}
          </span>
          {page < pages ? (
            <Link href={href(areaKey, page + 1)} className="font-medium text-astra-primary hover:text-astra-accent">
              Meno recenti
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </>
  );
}
