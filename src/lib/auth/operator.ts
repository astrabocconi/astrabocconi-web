import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Operator = {
  userId: string;
  email: string;
  fullName: string | null;
  role: "owner" | "editor";
  can: (permission: string) => boolean;
};

// cache() so the panel layout and the page it wraps share one lookup per
// request. The UI checks are for hiding buttons only; RLS is the real gate.
export const getOperator = cache(async (): Promise<Operator | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: me } = await supabase
    .from("admin_users")
    .select("email, full_name, role, permissions, disabled")
    .eq("user_id", user.id)
    .single();
  if (!me || me.disabled) return null;

  const role = me.role === "owner" ? "owner" : "editor";
  return {
    userId: user.id,
    email: me.email,
    fullName: me.full_name,
    role,
    can: (p) => role === "owner" || me.permissions.includes(p),
  };
});

export async function requireOperator(): Promise<Operator> {
  const op = await getOperator();
  if (!op) redirect("/admin");
  return op;
}
