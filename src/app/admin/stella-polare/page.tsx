import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = { title: "Stella Polare" };

export default async function ArticlesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  // Drafts come back only for operators holding stella_polare:write, because
  // that is what the second select policy checks.
  const { data: articles } = await supabase
    .from("articles")
    .select("id, slug, title, category, status, published_at, updated_at, author")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });

  const rows = articles ?? [];
  const drafts = rows.filter((a) => a.status === "draft").length;

  return (
    <AdminShell
      active="/admin/stella-polare"
      actions={
        <Link
          href="/admin/stella-polare/nuovo"
          className="rounded-xl bg-astra-primary px-3.5 py-1.5 text-xs font-medium text-white hover:bg-astra-dark"
        >
          Nuovo articolo
        </Link>
      }
    >
      <div className="p-6">
        <p className="mb-4 text-xs text-gray-500">
          {rows.length} articoli{drafts > 0 && `, di cui ${drafts} in bozza`}
        </p>

        {rows.length === 0 && (
          <p className="text-sm text-gray-500">
            Nessun articolo. Creane uno con Nuovo articolo.
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {rows.map((a) => (
            <li key={a.id}>
              <Link
                href={`/admin/stella-polare/${a.id}`}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-astra-accent"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                  {a.title}
                </span>
                {a.category && (
                  <span className="text-xs text-gray-500">{a.category}</span>
                )}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    a.status === "published"
                      ? "bg-astra-light text-astra-primary"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {a.status === "published" ? "Pubblicato" : "Bozza"}
                </span>
                <span className="w-20 text-right text-xs text-gray-400">
                  {a.published_at
                    ? new Date(a.published_at).toLocaleDateString("it-IT", {
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </AdminShell>
  );
}
