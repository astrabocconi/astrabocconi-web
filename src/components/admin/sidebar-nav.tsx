"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminNavSection } from "@/lib/admin-nav";
import { pageIcon } from "./page-icons";

// Same look as astra-app's dashboard sidebar, minus the collapsible sections:
// with ten links a collapse control costs more than it saves. Sections arrive
// already filtered to what this operator may open.
export function SidebarNav({ sections }: { sections: AdminNavSection[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-5">
      {sections.map((section) => (
        <div key={section.key} className="flex flex-col gap-0.5">
          {section.label && (
            <p className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              {section.label}
            </p>
          )}
          {section.pages.map((page) => {
            const active = pathname.startsWith(page.href);
            const Icon = pageIcon(page.href);
            return (
              <Link
                key={page.href}
                href={page.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-astra-light font-semibold text-astra-primary"
                    : "font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-astra-primary" : "text-gray-400"}`} />
                {page.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
