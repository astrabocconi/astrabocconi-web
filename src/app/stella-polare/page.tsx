import Link from "next/link";
import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import { AstraLogo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Stella Polare",
  description:
    "La rivista editoriale di ASTRA Bocconi: attualità, cultura, economia e diritto raccontati dagli studenti.",
};

export const revalidate = 300;

export default async function StellaPolareIndex() {
  const supabase = createPublicClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("id, slug, title, category, excerpt, author, cover_url, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  const rows = articles ?? [];

  return (
    <main className="flex-1">
      <header className="bg-linear-to-b from-astra-light to-white px-6 pt-16 pb-10">
        <div className="mx-auto max-w-5xl">
          <AstraLogo className="h-9 w-9 text-astra-primary" />
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-astra-primary">
            Stella Polare
          </h1>
          <p className="mt-2 max-w-xl text-gray-600">
            La rivista editoriale di ASTRA Bocconi. Attualità, cultura, economia
            e diritto raccontati dagli studenti.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 pb-20">
        {rows.length === 0 ? (
          <p className="text-sm text-gray-500">
            Non ci sono ancora articoli pubblicati.
          </p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/stella-polare/${a.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
                >
                  {a.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.cover_url}
                      alt=""
                      className="aspect-16/10 w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-16/10 w-full items-center justify-center bg-astra-light">
                      <AstraLogo className="h-8 w-8 text-astra-primary/40" />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-5">
                    {a.category && (
                      <span className="text-xs font-semibold tracking-wide text-astra-accent uppercase">
                        {a.category}
                      </span>
                    )}
                    <h2 className="mt-1.5 text-base leading-snug font-semibold text-gray-900 group-hover:text-astra-primary">
                      {a.title}
                    </h2>
                    {a.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                        {a.excerpt}
                      </p>
                    )}
                    {a.author && (
                      <p className="mt-auto pt-4 text-xs text-gray-400">
                        {a.author}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
