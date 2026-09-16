import Link from "next/link";
import { AstraLogo } from "@/components/ui/logo";
import { signOut } from "@/app/admin/utenti/actions";

const SECTIONS = [
  { href: "/admin/stella-polare", label: "Stella Polare" },
  { href: "/admin/utenti", label: "Operatori" },
];

export function AdminShell({
  active,
  actions,
  children,
}: {
  active: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col bg-gray-50">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-gray-200 bg-white px-6 py-3">
        <Link href="/admin/stella-polare" className="flex items-center gap-2.5">
          <AstraLogo className="h-6 w-6 text-astra-primary" />
          <span className="text-sm font-semibold text-gray-900">Backoffice</span>
        </Link>

        <nav className="flex items-center gap-1">
          {SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                s.href === active
                  ? "bg-astra-light text-astra-primary"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {actions}
          <form action={signOut}>
            <button className="text-xs font-medium text-gray-500 hover:text-gray-900">
              Esci
            </button>
          </form>
        </div>
      </header>

      {children}
    </div>
  );
}
