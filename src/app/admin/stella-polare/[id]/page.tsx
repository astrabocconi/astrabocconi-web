import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";
import { ArticleEditor } from "./article-editor";

export const metadata = { title: "Articolo" };

const EMPTY = {
  id: undefined,
  slug: "",
  title: "",
  category: "",
  excerpt: "",
  author: "",
  cover_url: "",
  body_html: "",
  status: "draft" as const,
};

export default async function ArticlePage({
  params,
}: PageProps<"/admin/stella-polare/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin");

  if (id === "nuovo") {
    return (
      <AdminShell active="/admin/stella-polare">
        <ArticleEditor article={EMPTY} history={[]} />
      </AdminShell>
    );
  }

  const { data: article } = await supabase
    .from("articles")
    .select("id, slug, title, category, excerpt, author, cover_url, body_html, status")
    .eq("id", id)
    .single();

  if (!article) notFound();

  const { data: history } = await supabase
    .from("content_audit")
    .select("action, actor_email, summary, changed_at")
    .eq("table_name", "articles")
    .eq("record_id", id)
    .order("changed_at", { ascending: false })
    .limit(8);

  return (
    <AdminShell active="/admin/stella-polare">
      <ArticleEditor
        article={{
          ...article,
          category: article.category ?? "",
          excerpt: article.excerpt ?? "",
          author: article.author ?? "",
          cover_url: article.cover_url ?? "",
          status: article.status as "draft" | "published",
        }}
        history={history ?? []}
      />
    </AdminShell>
  );
}
