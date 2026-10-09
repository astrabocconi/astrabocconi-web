// The backoffice's map of itself. One list drives the sidebar, the overview
// cards and the page guards, so they cannot disagree. `permission: null` means
// any operator may open the page; otherwise the link only shows to holders of
// that permission, and the page itself calls requirePermission with the same key.
export type AdminNavPage = {
  href: string;
  label: string;
  blurb: string;
  permission: string | null;
};

export type AdminNavSection = { key: string; label: string | null; pages: AdminNavPage[] };

export const ADMIN_NAV: AdminNavSection[] = [
  {
    key: "overview",
    label: null,
    pages: [
      { href: "/admin/panoramica", label: "Panoramica", blurb: "Numeri e attività", permission: null },
    ],
  },
  {
    key: "home",
    label: "Home page",
    pages: [
      { href: "/admin/eventi", label: "Eventi", blurb: "Sul sito e nell'app", permission: "events:write" },
      { href: "/admin/avvisi", label: "Avvisi", blurb: "La fascia sotto la hero", permission: "site:write" },
      { href: "/admin/conferenza", label: "Conferenza", blurb: "Il blocco della conferenza", permission: "site:write" },
    ],
  },
  {
    key: "content",
    label: "Contenuti",
    pages: [
      { href: "/admin/stella-polare", label: "Stella Polare", blurb: "Articoli del giornale", permission: "stella_polare:write" },
      { href: "/admin/dispense", label: "Dispense", blurb: "Triennale, CLMG, magistrali", permission: "dispense:write" },
      { href: "/admin/guide", label: "Guide", blurb: "PDF per categoria", permission: "guides:write" },
      { href: "/admin/rappresentanti", label: "Rappresentanti", blurb: "Chi rappresenta chi", permission: "representatives:write" },
    ],
  },
  {
    key: "admin",
    label: "Amministrazione",
    pages: [
      { href: "/admin/utenti", label: "Operatori", blurb: "Accessi e permessi", permission: null },
      { href: "/admin/attivita", label: "Attività", blurb: "Chi ha cambiato cosa", permission: null },
    ],
  },
];

export function visibleSections(can: (permission: string) => boolean): AdminNavSection[] {
  return ADMIN_NAV.map((s) => ({
    ...s,
    pages: s.pages.filter((p) => p.permission === null || can(p.permission)),
  })).filter((s) => s.pages.length > 0);
}
