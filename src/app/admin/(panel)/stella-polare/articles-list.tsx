"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { Badge } from "@/components/admin/ui/badge";
import { Input, Select } from "@/components/admin/ui/field";

type Row = {
  id: string;
  title: string;
  category: string | null;
  status: string;
  published_at: string | null;
  updated_at: string;
  author: string | null;
  cover_url: string | null;
};

const STATUSES = [
  { key: "all", label: "Tutti" },
  { key: "published", label: "Pubblicati" },
  { key: "draft", label: "Bozze" },
] as const;

const fmt = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short", year: "numeric" });

export function ArticlesList({ articles }: { articles: Row[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]["key"]>("all");
  const [category, setCategory] = useState("");

  const categories = useMemo(
    () => [...new Set(articles.map((a) => a.category).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, "it")),
    [articles],
  );

  const counts = {
    all: articles.length,
    published: articles.filter((a) => a.status === "published").length,
    draft: articles.filter((a) => a.status === "draft").length,
  };

  const needle = query.trim().toLowerCase();
  const shown = articles.filter(
    (a) =>
      (status === "all" || a.status === status) &&
      (!category || a.category === category) &&
      (!needle || a.title.toLowerCase().includes(needle) || (a.author ?? "").toLowerCase().includes(needle)),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-gray-200 bg-white p-1">
          {STATUSES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setStatus(s.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                status === s.key ? "bg-astra-light text-astra-primary" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {s.label} <span className="text-xs opacity-60">{counts[s.key]}</span>
            </button>
          ))}
        </div>
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-auto!">
          <option value="">Tutte le categorie</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca per titolo o autore" className="pl-9" />
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
          Nessun articolo con questi filtri.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {shown.map((a) => (
            <li key={a.id}>
              <Link
                href={`/admin/stella-polare/${a.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:border-astra-light hover:shadow-md"
              >
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-astra-light">
                  {a.cover_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.cover_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">{a.title}</p>
                  <p className="mt-0.5 truncate text-sm text-gray-500">
                    {[a.category, a.author].filter(Boolean).join(" · ") || "Senza categoria"}
                  </p>
                </div>
                <span className="hidden text-xs text-gray-400 sm:block">
                  {a.published_at ? fmt.format(new Date(a.published_at)) : `Modificato ${fmt.format(new Date(a.updated_at))}`}
                </span>
                <Badge tone={a.status === "published" ? "brand" : "neutral"}>
                  {a.status === "published" ? "Pubblicato" : "Bozza"}
                </Badge>
                <ChevronRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-astra-accent" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
