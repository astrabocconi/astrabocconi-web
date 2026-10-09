"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOperator, type Operator } from "@/lib/auth/operator";
import { logAudit } from "@/lib/admin-audit";
import { ALL_PERMISSIONS, isValidPermission, type AdminRole } from "@/lib/auth/permissions";

type Result = { ok: true } | { ok: false; error: string };

export type OperatorInput = {
  email: string;
  fullName: string;
  role: AdminRole;
  permissions: string[];
  password: string; // empty on update means keep the current one
};

// Writes to admin_users go through the caller's own session, so RLS
// (users:write) is a second gate. Auth changes need the secret key, which
// bypasses RLS entirely, so every rule is checked here first:
//  - users:write to touch anyone at all;
//  - only an owner may create, edit, disable or delete an owner, or make one;
//  - an editor may only hand out permissions they hold, and never edit their
//    own (otherwise users:write alone would be a path to everything);
//  - nobody may demote, disable or delete themselves (no accidental lockout).
async function manager(): Promise<Operator | null> {
  const op = await getOperator();
  return op?.can("users:write") ? op : null;
}

const DENIED = { ok: false as const, error: "Permesso mancante" };
const OWNER_ONLY = { ok: false as const, error: "Solo un proprietario può gestire i proprietari" };

function grantsTooMuch(op: Operator, permissions: string[]) {
  return op.role !== "owner" && permissions.some((p) => !op.can(p));
}
const TOO_MUCH = { ok: false as const, error: "Puoi assegnare solo permessi che hai anche tu" };

async function target(userId: string) {
  const { data } = await createAdminClient()
    .from("admin_users")
    .select("user_id, email, full_name, role")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

function clean(input: OperatorInput) {
  const email = input.email.trim().toLowerCase();
  const role: AdminRole = input.role === "owner" ? "owner" : "editor";
  return {
    email,
    fullName: input.fullName.trim() || null,
    role,
    // Owners hold everything through their role; storing the full list as well
    // keeps the row honest if the role is ever changed back.
    permissions: role === "owner" ? ALL_PERMISSIONS : [...new Set(input.permissions.filter(isValidPermission))],
    password: input.password,
  };
}

function checkPassword(p: string): string | null {
  return p.length < 12 ? "La password deve avere almeno 12 caratteri" : null;
}

const label = (o: { full_name?: string | null; fullName?: string | null; email: string }) =>
  o.full_name ?? o.fullName ?? o.email;

export async function createOperator(input: OperatorInput): Promise<Result> {
  const op = await manager();
  if (!op) return DENIED;
  const c = clean(input);
  if (!/^\S+@\S+\.\S+$/.test(c.email)) return { ok: false, error: "Email non valida" };
  const bad = checkPassword(c.password);
  if (bad) return { ok: false, error: bad };
  if (c.role === "owner" && op.role !== "owner") return OWNER_ONLY;
  if (grantsTooMuch(op, c.permissions)) return TOO_MUCH;

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: c.email,
    password: c.password,
    email_confirm: true,
  });
  if (createError || !created.user) return { ok: false, error: createError?.message ?? "Creazione non riuscita" };

  const supabase = await createClient();
  const { error } = await supabase.from("admin_users").insert({
    user_id: created.user.id,
    email: c.email,
    full_name: c.fullName,
    role: c.role,
    permissions: c.permissions,
    created_by: op.userId,
  });
  if (error) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { ok: false, error: error.message };
  }

  await logAudit(op, "admin_users", created.user.id, "insert", `${label(c)} (${c.role === "owner" ? "proprietario" : "editor"})`);
  revalidatePath("/admin/utenti");
  return { ok: true };
}

export async function updateOperator(userId: string, input: OperatorInput): Promise<Result> {
  const op = await manager();
  if (!op) return DENIED;
  const t = await target(userId);
  if (!t) return { ok: false, error: "Operatore non trovato" };
  const c = clean(input);
  const self = userId === op.userId;

  if ((t.role === "owner" || c.role === "owner") && op.role !== "owner") return OWNER_ONLY;
  if (self && c.role !== t.role) return { ok: false, error: "Non puoi cambiare il tuo ruolo" };
  if (self && op.role !== "owner") {
    const { data: mine } = await createAdminClient().from("admin_users").select("permissions").eq("user_id", userId).single();
    const before = [...(mine?.permissions ?? [])].sort().join();
    if (before !== [...c.permissions].sort().join()) return { ok: false, error: "Non puoi cambiare i tuoi permessi" };
  }
  if (grantsTooMuch(op, c.permissions)) return TOO_MUCH;
  if (!/^\S+@\S+\.\S+$/.test(c.email)) return { ok: false, error: "Email non valida" };
  if (c.password) {
    const bad = checkPassword(c.password);
    if (bad) return { ok: false, error: bad };
  }

  const admin = createAdminClient();
  const authPatch: { email?: string; email_confirm?: boolean; password?: string } = {};
  if (c.email !== t.email.toLowerCase()) Object.assign(authPatch, { email: c.email, email_confirm: true });
  if (c.password) authPatch.password = c.password;
  if (Object.keys(authPatch).length) {
    const { error } = await admin.auth.admin.updateUserById(userId, authPatch);
    if (error) return { ok: false, error: error.message };
  }

  const supabase = await createClient();
  const { error, count } = await supabase
    .from("admin_users")
    .update({ email: c.email, full_name: c.fullName, role: c.role, permissions: c.permissions }, { count: "exact" })
    .eq("user_id", userId);
  if (error) return { ok: false, error: error.message };
  if (!count) return DENIED;

  const changes = [
    c.role !== t.role && `ruolo ${c.role === "owner" ? "proprietario" : "editor"}`,
    c.password && "nuova password",
    authPatch.email && "nuova email",
  ].filter(Boolean);
  await logAudit(op, "admin_users", userId, "update", `${label(c)}${changes.length ? ` (${changes.join(", ")})` : " (permessi)"}`);
  revalidatePath("/admin/utenti");
  return { ok: true };
}

export async function setDisabled(userId: string, disabled: boolean): Promise<Result> {
  const op = await manager();
  if (!op) return DENIED;
  if (userId === op.userId) return { ok: false, error: "Non puoi disattivare il tuo account" };
  const t = await target(userId);
  if (!t) return { ok: false, error: "Operatore non trovato" };
  if (t.role === "owner" && op.role !== "owner") return OWNER_ONLY;

  const supabase = await createClient();
  const { error, count } = await supabase.from("admin_users").update({ disabled }, { count: "exact" }).eq("user_id", userId);
  if (error) return { ok: false, error: error.message };
  if (!count) return DENIED;

  await logAudit(op, "admin_users", userId, "update", `${label(t)} (${disabled ? "disattivato" : "riattivato"})`);
  revalidatePath("/admin/utenti");
  return { ok: true };
}

// Removes the login itself. admin_users goes with it (on delete cascade), and
// content they wrote keeps its rows with created_by/updated_by set to null.
export async function deleteOperator(userId: string): Promise<Result> {
  const op = await manager();
  if (!op) return DENIED;
  if (userId === op.userId) return { ok: false, error: "Non puoi eliminare il tuo account" };
  const t = await target(userId);
  if (!t) return { ok: false, error: "Operatore non trovato" };
  if (t.role === "owner" && op.role !== "owner") return OWNER_ONLY;

  const { error } = await createAdminClient().auth.admin.deleteUser(userId);
  if (error) return { ok: false, error: error.message };

  await logAudit(op, "admin_users", userId, "delete", label(t));
  revalidatePath("/admin/utenti");
  return { ok: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin");
}
