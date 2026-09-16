import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AdminUser } from "@/lib/auth/permissions";
import { AdminShell } from "@/components/admin/admin-shell";
import { OperatorsEditor } from "./operators-editor";

export const metadata = { title: "Operatori" };

export default async function OperatorsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  const { data: me } = await supabase
    .from("admin_users")
    .select("role, permissions, disabled")
    .eq("user_id", user.id)
    .single();

  if (!me || me.disabled) {
    return (
      <main className="flex flex-1 items-center justify-center px-6">
        <p className="text-sm text-gray-600">
          Questo account non ha accesso al backoffice.
        </p>
      </main>
    );
  }

  const canManage =
    me.role === "owner" || me.permissions.includes("users:write");

  // RLS already limits this to admins; an operator without users:write can see
  // the list but the editor renders read only.
  const { data: operators } = await supabase
    .from("admin_users")
    .select("user_id, email, full_name, role, permissions, disabled, created_at")
    .order("created_at", { ascending: true });

  return (
    <AdminShell active="/admin/utenti">
      <OperatorsEditor
        operators={(operators ?? []) as AdminUser[]}
        currentUserId={user.id}
        canManage={canManage}
      />
    </AdminShell>
  );
}
