import type { FlowGroup } from "@/components/flow/grouped-toggle-flow";

// These keys are the contract with the database. Every `<resource>:write` and
// `<resource>:delete` here has a matching RLS policy in
// supabase/migrations/20260915_001_roles_and_rls.sql. Adding a permission here
// without adding the policy gives an operator a button that silently fails.
export const PERMISSION_GROUPS: FlowGroup[] = [
  {
    key: "stella_polare",
    label: "Stella Polare",
    items: [
      {
        key: "stella_polare:write",
        label: "Pubblica",
        blurb: "Crea e modifica articoli",
      },
      {
        key: "stella_polare:delete",
        label: "Elimina",
        blurb: "Rimuove articoli",
      },
    ],
  },
  {
    key: "guides",
    label: "Guide",
    items: [
      { key: "guides:write", label: "Pubblica", blurb: "Carica e modifica" },
      { key: "guides:delete", label: "Elimina", blurb: "Rimuove guide" },
    ],
  },
  {
    key: "dispense",
    label: "Dispense",
    items: [
      {
        key: "dispense:write",
        label: "Pubblica",
        blurb: "Triennale, CLMG, magistrali",
      },
      { key: "dispense:delete", label: "Elimina", blurb: "Rimuove dispense" },
    ],
  },
  {
    key: "representatives",
    label: "Rappresentanti",
    items: [
      { key: "representatives:write", label: "Modifica", blurb: "Aggiorna l'elenco" },
      { key: "representatives:delete", label: "Elimina", blurb: "Rimuove persone" },
    ],
  },
  {
    key: "site",
    label: "Home page",
    items: [
      {
        key: "site:write",
        label: "Modifica",
        blurb: "Avvisi e sezione conferenza",
      },
      { key: "site:delete", label: "Elimina", blurb: "Rimuove avvisi" },
    ],
  },
  {
    key: "events",
    label: "Eventi",
    items: [
      { key: "events:write", label: "Pubblica", blurb: "Crea e modifica eventi" },
      { key: "events:delete", label: "Elimina", blurb: "Rimuove eventi" },
    ],
  },
  {
    key: "users",
    label: "Accessi",
    items: [
      {
        key: "users:write",
        label: "Gestisci operatori",
        blurb: "Crea account e assegna permessi",
      },
    ],
  },
];

export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((g) =>
  g.items.map((i) => i.key),
);

export function isValidPermission(key: string) {
  return ALL_PERMISSIONS.includes(key);
}

export type AdminRole = "owner" | "editor";

export type AdminUser = {
  user_id: string;
  email: string;
  full_name: string | null;
  role: AdminRole;
  permissions: string[];
  disabled: boolean;
  created_at: string;
};

// Owners are deliberately not stored with an expanded permission list; the
// database treats role='owner' as implying everything. Mirror that here so the
// UI shows an owner as fully checked without writing the rows.
export function effectivePermissions(user: {
  role: AdminRole;
  permissions: string[];
}) {
  return user.role === "owner" ? ALL_PERMISSIONS : user.permissions;
}
