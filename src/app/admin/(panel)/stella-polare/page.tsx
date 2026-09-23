import Link from "next/link";
import { Newspaper, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireOperator } from "@/lib/auth/operator";
import { PageHeader } from "@/components/admin/ui/page-header";
import { buttonClass } from "@/components/admin/ui/button";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ArticlesList } from "./articles-list";

export const metadata = { title: "Stella Polare" };

export default async function ArticlesPage() {
  await requireOperator();
  const supabase = await createClient();

  // Drafts come back only for operators holding stella_polare:write, because
  // that is what the second select policy checks.
  const { data } = await supabase
    .from("articles")
    .select("id, slug, title, category, status, published_at, updated_at, author, cover_url")
    .order("published_at", { ascending: false, nullsFirst: true })
    .order("updated_at", { ascending: false });
  const rows = data ?? [];

  const newButton = (
    <Link href="/admin/stella-polare/nuovo" className={buttonClass()}>
      <Plus className="h-4 w-4" />
      Nuovo articolo
    </Link>
  );

  return (
    <>
      <PageHeader
        title="Stella Polare"
        subtitle="Gli articoli del magazine. Le bozze non sono visibili sul sito."
        actions={newButton}
      />
      {rows.length === 0 ? (
        <EmptyState
          icon={<Newspaper className="h-7 w-7" />}
          title="Nessun articolo"
          description="Scrivi il primo articolo: resta in bozza finché non lo pubblichi."
          action={newButton}
        />
      ) : (
        <ArticlesList articles={rows} />
      )}
    </>
  );
}
