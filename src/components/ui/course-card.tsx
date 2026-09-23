import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";

// Replaces the old fanned-stack-of-thumbnails folder: a photographic hero
// card per course, in the style (and, for the eleven that have one, the
// actual illustrated cover) of the old site. See DECISIONS 2026-09-23.

export interface CourseCardProps {
  name: string;
  href: string;
  cover?: string;
  /** Renders muted and unclickable when the course has nothing in it yet. */
  empty?: boolean;
  /** Load the cover eagerly for the first row. */
  priority?: boolean;
}

export function CourseCard({ name, href, cover, empty = false, priority = false }: CourseCardProps) {
  const body = (
    <div
      className={`group relative aspect-square w-full overflow-hidden rounded-2xl border border-astra-primary/12 bg-astra-light shadow-[0_10px_30px_rgba(4,16,126,0.1)] transition-shadow ${
        empty ? "opacity-40" : "hover:shadow-[0_18px_44px_rgba(4,16,126,0.18)]"
      }`}
    >
      {cover ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover}
            alt=""
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            width={960}
            height={960}
            className="h-full w-full object-cover object-bottom transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-astra-dark/85 via-astra-dark/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-5">
            <h3 className="text-xl font-bold tracking-tight text-white drop-shadow-sm">{name}</h3>
            {!empty && (
              <ArrowUpRight className="h-5 w-5 shrink-0 text-white/80 transition-colors group-hover:text-white" />
            )}
          </div>
        </>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-astra-primary">
            <FileText className="h-7 w-7" />
          </span>
          <h3 className="text-lg font-semibold text-astra-primary">{name}</h3>
        </div>
      )}
    </div>
  );

  if (empty) return <div aria-disabled="true">{body}</div>;

  return (
    <Link href={href} className="block">
      {body}
    </Link>
  );
}

export default CourseCard;
