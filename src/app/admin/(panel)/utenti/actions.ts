"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidPermission } from "@/lib/auth/permissions";

type Result = { ok: true } | { ok: false; error: string };

// Permission checks here are belt and braces. Writes to admin_users go through
// the caller's own session, so RLS is the real gate; but creating an auth user
// needs the service key, which bypasses RLS entirely, so that path must check.
type Guard =
  | { ok: false; error: string }
  | {
      ok: true;
      user: { id: string };
      supabase: Awaited<ReturnType<typeof createClient>>;
    };

async function requireUserManager(): Promise<Guard> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non autenticato" };

  const { data } = await supabase
    .from("admin_users")
    .select("role, permissions, disabled")
    .eq("user_id", user.id)
    .single();

  if (!data || data.disabled) return { ok: false, error: "Non autorizzato" };
  const allowed =
    data.role === "owner" || data.permissions.includes("users:write");
  if (!allowed) return { ok: false, error: "Permesso mancante" };

  return { ok: true, user, supabase };
}

export async function createOperator(formData: FormData): Promise<Result> {
  const guard = await requireUserManager();
  if (!guard.ok) return guard;

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim() || null;

  if (!email || !password) return { ok: false, error: "Campi mancanti" };
  if (password.length < 12)
    return { ok: false, error: "La password deve avere almeno 12 caratteri" };

  const admin = createAdminClient();
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
  if (createError || !created.user)
    return { ok: false, error: createError?.message ?? "Creazione non riuscita" };

  const { error: insertError } = await guard.supabase
    .from("admin_users")
    .insert({
      user_id: created.user.id,
      email,
      full_name: fullName,
      role: "editor",
      permissions: [],
      created_by: guard.user.id,
    });

  if (insertError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { ok: false, error: insertError.message };
  }

  revalidatePath("/admin/utenti");
  return { ok: true };
}

export async function updatePermissions(
  userId: string,
  permissions: string[],
): Promise<Result> {
  const guard = await requireUserManager();
  if (!guard.ok) return guard;

  const clean = permissions.filter(isValidPermission);
  const { error } = await guard.supabase
    .from("admin_users")
    .update({ permissions: clean })
    .eq("user_id", userId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/utenti");
  return { ok: true };
}

export async function setDisabled(
  userId: string,
  disabled: boolean,
): Promise<Result> {
  const guard = await requireUserManager();
  if (!guard.ok) return guard;

  if (userId === guard.user.id)
    return { ok: false, error: "Non puoi disattivare il tuo account" };

  const { error } = await guard.supabase
    .from("admin_users")
    .update({ disabled })
    .eq("user_id", userId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/utenti");
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin");
}
