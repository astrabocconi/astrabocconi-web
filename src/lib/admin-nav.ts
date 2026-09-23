// Backoffice sections. `permission: null` means any operator may open the page;
// otherwise the link only shows to holders of that permission (RLS still
// decides what a page can actually read or write).
export type AdminNavPage = { href: string; label: string; permission: string | null };

export const ADMIN_NAV: { key: string; label: string | null; pages: AdminNavPage[] }[] = [
  {
    key: "overview",
    label: null,
    pages: [{ href: "/admin/panoramica", label: "Panoramica", permission: null }],
  },
  {
    key: "home",
    label: "Home page",
    pages: [
      { href: "/admin/avvisi", label: "Avvisi", permission: "site:write" },
      { href: "/admin/conferenza", label: "Conferenza", permission: "site:write" },
      { href: "/admin/eventi", label: "Eventi", permission: null },
    ],
  },
  {
    key: "content",
    label: "Contenuti",
    pages: [
      { href: "/admin/stella-polare", label: "Stella Polare", permission: "stella_polare:write" },
      { href: "/admin/dispense", label: "Dispense", permission: "dispense:write" },
      { href: "/admin/guide", label: "Guide", permission: "guides:write" },
      { href: "/admin/rappresentanti", label: "Rappresentanti", permission: "representatives:write" },
    ],
  },
  {
    key: "admin",
    label: "Amministrazione",
    pages: [{ href: "/admin/utenti", label: "Operatori", permission: null }],
  },
];
