import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireOperator } from "@/lib/auth/operator";
import { ArticleEditor, type Article } from "./article-editor";

export const metadata = { title: "Articolo" };

const EMPTY: Article = {
  slug: "",
  title: "",
  category: "",
  excerpt: "",
  author: "",
  cover_url: "",
  body_html: "",
  status: "draft",
  published_on: "",
};

export default async function ArticlePage({ params }: PageProps<"/admin/stella-polare/[id]">) {
  const { id } = await params;
  const op = await requireOperator();
  const supabase = await createClient();

  // Categories already in use, so editors pick one instead of inventing a
  // near-duplicate spelling.
  const { data: cats } = await supabase.from("articles").select("category");
  const categories = [...new Set((cats ?? []).map((c) => c.category?.trim()).filter(Boolean) as string[])].sort(
    (a, b) => a.localeCompare(b, "it"),
  );

  const perms = { canDelete: op.can("stella_polare:delete") };

  if (id === "nuovo") {
    return <ArticleEditor article={EMPTY} history={[]} categories={categories} {...perms} />;
  }

  const { data: article } = await supabase
    .from("articles")
    .select("id, slug, title, category, excerpt, author, cover_url, body_html, status, published_at")
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
    <ArticleEditor
      article={{
        id: article.id,
        slug: article.slug,
        title: article.title,
        body_html: article.body_html,
        category: article.category ?? "",
        excerpt: article.excerpt ?? "",
        author: article.author ?? "",
        cover_url: article.cover_url ?? "",
        status: article.status as "draft" | "published",
        published_on: article.published_at ? article.published_at.slice(0, 10) : "",
      }}
      history={history ?? []}
      categories={categories}
      {...perms}
    />
  );
}
