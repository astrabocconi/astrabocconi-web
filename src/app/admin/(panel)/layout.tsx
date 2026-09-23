import Link from "next/link";
import { LogOut } from "lucide-react";
import { AstraLogo } from "@/components/ui/logo";
import { Badge } from "@/components/admin/ui/badge";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { getOperator } from "@/lib/auth/operator";
import { signOut } from "./utenti/actions";

// Every backoffice page reads the operator's session, so none of them can be
// static. Saying so here keeps a build from trying.
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const op = await getOperator();

  // Signed in to Supabase but not an operator, or disabled. The proxy has
  // already bounced anyone with no session at all.
  if (!op) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <AstraLogo className="h-12 w-12 text-astra-primary" />
        <h1 className="text-xl font-semibold text-gray-900">Nessun accesso</h1>
        <p className="text-sm text-gray-500">
          Questo account non è abilitato al backoffice. Chiedi a un proprietario
          di aggiungerti da Operatori.
        </p>
        <form action={signOut}>
          <button type="submit" className="text-sm font-medium text-astra-primary hover:text-astra-accent">
            Esci
          </button>
        </form>
      </main>
    );
  }

  const allowed = ADMIN_NAV.flatMap((s) => s.pages)
    .filter((p) => p.permission === null || op.can(p.permission))
    .map((p) => p.href);
  const who = op.fullName ?? op.email;

  return (
    <div className="flex min-h-screen bg-gray-50/60">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-gray-100 bg-white/80 px-4 py-5 backdrop-blur">
        <Link href="/admin/panoramica" className="mb-8 flex items-center gap-2.5 px-2 text-astra-primary">
          <AstraLogo className="h-7 w-7" />
          <span className="text-lg font-bold tracking-tight">ASTRA</span>
          <Badge tone="neutral">{op.role === "owner" ? "Owner" : "Editor"}</Badge>
        </Link>

        <div className="-mr-2 min-h-0 flex-1 overflow-y-auto pr-2">
          <SidebarNav allowed={allowed} />
        </div>

        <div className="mt-auto border-t border-gray-100 pt-4">
          <div className="mb-3 flex items-center gap-3 px-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-astra-light text-sm font-semibold text-astra-primary">
              {who.charAt(0).toUpperCase()}
            </div>
            <p className="truncate text-xs text-gray-500" title={op.email}>
              {who}
            </p>
          </div>
          <div className="flex items-center gap-2 px-1">
            <Link
              href="/"
              target="_blank"
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Apri il sito
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                title="Esci"
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                <LogOut className="h-3.5 w-3.5" />
                Esci
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-8 py-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
