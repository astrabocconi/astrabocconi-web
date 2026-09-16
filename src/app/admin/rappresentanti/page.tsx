import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { RepresentativesManager, type Representative } from "./representatives-manager";

export const metadata = { title: "Rappresentanti" };

export default async function RepresentativesPage() {
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

  const has = (p: string) =>
    !!me && !me.disabled && (me.role === "owner" || me.permissions.includes(p));

  const { data: reps } = await supabase
    .from("representatives")
    .select("id, name, section, url")
    .order("section", { ascending: true })
    .order("name", { ascending: true });

  return (
    <AdminShell active="/admin/rappresentanti">
      <RepresentativesManager
        representatives={(reps ?? []) as Representative[]}
        canWrite={has("representatives:write")}
        canDelete={has("representatives:delete")}
      />
    </AdminShell>
  );
}
