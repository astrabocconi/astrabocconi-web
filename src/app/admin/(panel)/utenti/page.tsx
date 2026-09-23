import { createClient } from "@/lib/supabase/server";
import type { AdminUser } from "@/lib/auth/permissions";
import { requireOperator } from "@/lib/auth/operator";
import { PageHeader } from "@/components/admin/ui/page-header";
import { OperatorsEditor } from "./operators-editor";

export const metadata = { title: "Operatori" };

export default async function OperatorsPage() {
  const op = await requireOperator();
  const supabase = await createClient();

  // RLS already limits this to admins; an operator without users:write can see
  // the list but the editor renders read only.
  const { data: operators } = await supabase
    .from("admin_users")
    .select("user_id, email, full_name, role, permissions, disabled, created_at")
    .order("created_at", { ascending: true });

  return (
    <>
      <PageHeader title="Operatori" subtitle="Chi può entrare nel backoffice e cosa può modificare." />
      <OperatorsEditor
        operators={(operators ?? []) as AdminUser[]}
        currentUserId={op.userId}
        canManage={op.can("users:write")}
      />
    </>
  );
}
