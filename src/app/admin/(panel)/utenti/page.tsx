import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOperator } from "@/lib/auth/operator";
import { PageHeader } from "@/components/admin/ui/page-header";
import { TeamManager, type OperatorRow } from "./team-manager";

export const metadata = { title: "Operatori" };

export default async function OperatorsPage() {
  const op = await requireOperator();
  const supabase = await createClient();

  // RLS limits this to operators. Without users:write the list renders read only.
  const [{ data: operators }, { data: auth }] = await Promise.all([
    supabase
      .from("admin_users")
      .select("user_id, email, full_name, role, permissions, disabled, created_at")
      .order("created_at", { ascending: true }),
    // Last sign-in lives on the auth user, readable only with the secret key.
    createAdminClient().auth.admin.listUsers({ perPage: 1000 }),
  ]);
  const lastIn = new Map((auth?.users ?? []).map((u) => [u.id, u.last_sign_in_at ?? null]));

  const rows: OperatorRow[] = (operators ?? []).map((o) => ({
    userId: o.user_id,
    email: o.email,
    fullName: o.full_name,
    role: o.role === "owner" ? "owner" : "editor",
    permissions: o.permissions,
    disabled: o.disabled,
    createdAt: o.created_at,
    lastSignInAt: lastIn.get(o.user_id) ?? null,
  }));

  // Owners first, then by name, so the people who can do everything sit on top.
  rows.sort((a, b) => (a.role === b.role ? (a.fullName ?? a.email).localeCompare(b.fullName ?? b.email) : a.role === "owner" ? -1 : 1));

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Operatori"
        subtitle="Chi può entrare nel backoffice e cosa può fare. Entrano da /admin con email e password."
      />
      <TeamManager
        accounts={rows}
        viewer={{ userId: op.userId, role: op.role, canManage: op.can("users:write") }}
      />
    </div>
  );
}
