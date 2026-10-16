import {
  BookOpen,
  CalendarDays,
  FileText,
  History,
  LayoutDashboard,
  Handshake,
  Megaphone,
  Mic,
  Newspaper,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

// One icon per backoffice page. Shared by the sidebar and the overview cards.
const ICONS: Record<string, LucideIcon> = {
  "/admin/panoramica": LayoutDashboard,
  "/admin/avvisi": Megaphone,
  "/admin/conferenza": Mic,
  "/admin/partner": Handshake,
  "/admin/eventi": CalendarDays,
  "/admin/stella-polare": Newspaper,
  "/admin/dispense": FileText,
  "/admin/guide": BookOpen,
  "/admin/rappresentanti": Users,
  "/admin/utenti": ShieldCheck,
  "/admin/attivita": History,
};

export function pageIcon(href: string): LucideIcon {
  return ICONS[href] ?? FileText;
}
