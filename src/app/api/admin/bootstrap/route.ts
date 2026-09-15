import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ALL_PERMISSIONS } from "@/lib/auth/permissions";

export const runtime = "nodejs";

// The seven-click gesture only reveals this form. It is not what authorises
// anything: creating the first owner still needs ADMIN_BOOTSTRAP_SECRET, and
// this route refuses to do anything once an operator exists. Any later account
// is created from inside the backoffice by someone holding users:write.

async function operatorCount() {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("admin_users")
    .select("user_id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

function secretMatches(provided: string) {
  const expected = process.env.ADMIN_BOOTSTRAP_SECRET;
  if (!expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET() {
  try {
    return NextResponse.json({ needsBootstrap: (await operatorCount()) === 0 });
  } catch {
    return NextResponse.json({ needsBootstrap: false }, { status: 200 });
  }
}

export async function POST(request: Request) {
  let body: { email?: string; password?: string; secret?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }

  const { email, password, secret } = body;
  if (!email || !password || !secret) {
    return NextResponse.json({ error: "Campi mancanti" }, { status: 400 });
  }
  if (password.length < 12) {
    return NextResponse.json(
      { error: "La password deve avere almeno 12 caratteri" },
      { status: 400 },
    );
  }
  if (!secretMatches(secret)) {
    return NextResponse.json({ error: "Codice non valido" }, { status: 403 });
  }

  if ((await operatorCount()) > 0) {
    return NextResponse.json(
      { error: "Esiste già un operatore. Il primo accesso è disabilitato." },
      { status: 409 },
    );
  }

  const supabase = createAdminClient();
  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
  if (createError || !created.user) {
    return NextResponse.json(
      { error: createError?.message ?? "Creazione non riuscita" },
      { status: 400 },
    );
  }

  const { error: insertError } = await supabase.from("admin_users").insert({
    user_id: created.user.id,
    email,
    role: "owner",
    permissions: ALL_PERMISSIONS,
  });

  if (insertError) {
    // Do not leave an auth user behind that has no operator row; it would be a
    // login with no access and no way to see it in the backoffice.
    await supabase.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
