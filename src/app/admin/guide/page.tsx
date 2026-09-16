import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { GuidesManager, type Guide } from "./guides-manager";

export const metadata = { title: "Guide" };

export default async function GuidesPage() {
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

  const canWrite =
    !!me &&
    !me.disabled &&
    (me.role === "owner" || me.permissions.includes("guides:write"));
  const canDelete =
    !!me &&
    !me.disabled &&
    (me.role === "owner" || me.permissions.includes("guides:delete"));

  // Deactivated guides come back only for holders of guides:write, via the
  // second select policy added in migration 004.
  const { data: guides } = await supabase
    .from("guides")
    .select("id, title, category, description, file_url, thumbnail_url, order_index, is_active")
    .order("category", { ascending: true })
    .order("order_index", { ascending: true, nullsFirst: false });

  return (
    <AdminShell active="/admin/guide">
      <GuidesManager
        guides={(guides ?? []) as Guide[]}
        canWrite={canWrite}
        canDelete={canDelete}
      />
    </AdminShell>
  );
}
