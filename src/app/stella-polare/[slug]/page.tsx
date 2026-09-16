import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 300;

// Published slugs are known at build time; drafts and later edits fall through
// to on demand rendering and the revalidate window above.
export async function generateStaticParams() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("articles")
    .select("slug")
    .eq("status", "published");
  return (data ?? []).map((a) => ({ slug: a.slug }));
}

async function getArticle(slug: string) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("articles")
    .select("title, category, excerpt, author, cover_url, body_html, published_at")
    .eq("slug", slug)
    .single();
  return data;
}

export async function generateMetadata({
  params,
}: PageProps<"/stella-polare/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Articolo non trovato" };

  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      type: "article",
      images: article.cover_url ? [article.cover_url] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: PageProps<"/stella-polare/[slug]">) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  return (
    <main className="flex-1 bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/stella-polare"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-astra-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Stella Polare
        </Link>

        <article className="mt-8">
          <header>
            {article.category && (
              <p className="text-xs font-semibold tracking-widest text-astra-accent uppercase">
                {article.category}
              </p>
            )}
            <h1 className="mt-2 text-3xl leading-tight font-semibold tracking-tight text-gray-900 sm:text-4xl">
              {article.title}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-2 text-sm text-gray-500">
              {article.author && <span>{article.author}</span>}
              {article.author && article.published_at && <span>·</span>}
              {article.published_at && (
                <time dateTime={article.published_at}>
                  {new Date(article.published_at).toLocaleDateString("it-IT", {
                    month: "long",
                    year: "numeric",
                  })}
                </time>
              )}
            </p>
          </header>

          {article.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.cover_url}
              alt=""
              className="mt-8 aspect-16/9 w-full rounded-2xl object-cover"
            />
          )}

          {/* Sanitised with an allowlist in src/lib/sanitize.ts on every write. */}
          <div
            className="prose-astra mt-10"
            dangerouslySetInnerHTML={{ __html: article.body_html }}
          />
        </article>
      </div>
    </main>
  );
}
