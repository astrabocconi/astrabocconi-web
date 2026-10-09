import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Operator } from "@/lib/auth/operator";

// content_audit is filled by triggers for the Supabase content tables. Changes
// that no trigger sees (events in Neon, operator accounts) are logged here by
// hand with the secret key, since the table has no insert policy on purpose.
// Best effort: a failed log line must not fail the change it describes.
export async function logAudit(
  op: Pick<Operator, "userId" | "email">,
  table: "Event" | "admin_users",
  recordId: string,
  action: "insert" | "update" | "delete",
  summary: string,
) {
  const { error } = await createAdminClient().from("content_audit").insert({
    table_name: table,
    record_id: recordId,
    action,
    actor_id: op.userId,
    actor_email: op.email,
    summary,
  });
  if (error) console.error("content_audit insert failed:", error.message);
}
