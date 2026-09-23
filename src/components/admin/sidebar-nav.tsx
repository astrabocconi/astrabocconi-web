"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Megaphone,
  Mic,
  Newspaper,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ADMIN_NAV } from "@/lib/admin-nav";

const ICONS: Record<string, LucideIcon> = {
  "/admin/panoramica": LayoutDashboard,
  "/admin/avvisi": Megaphone,
  "/admin/conferenza": Mic,
  "/admin/eventi": CalendarDays,
  "/admin/stella-polare": Newspaper,
  "/admin/dispense": FileText,
  "/admin/guide": BookOpen,
  "/admin/rappresentanti": Users,
  "/admin/utenti": ShieldCheck,
};

// Same look as astra-app's dashboard sidebar, minus the collapsible sections:
// with nine links a collapse control costs more than it saves.
export function SidebarNav({ allowed }: { allowed: string[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-5">
      {ADMIN_NAV.map((section) => {
        const pages = section.pages.filter((p) => allowed.includes(p.href));
        if (pages.length === 0) return null;
        return (
          <div key={section.key} className="flex flex-col gap-0.5">
            {section.label && (
              <p className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                {section.label}
              </p>
            )}
            {pages.map((page) => {
              const active = pathname.startsWith(page.href);
              const Icon = ICONS[page.href] ?? FileText;
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
        );
      })}
    </nav>
  );
}
