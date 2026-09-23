import Link from "next/link";
import { GraduationCap } from "lucide-react";

export interface GuideCategoryCardProps {
  title: string;
  description: string;
  href: string;
  cover?: string;
  priority?: boolean;
}

export function GuideCategoryCard({ title, description, href, cover, priority = false }: GuideCategoryCardProps) {
  return (
    <Link
      href={href}
      className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-astra-primary/12 bg-astra-light shadow-[0_10px_30px_rgba(4,16,126,0.1)] transition-shadow hover:shadow-[0_18px_44px_rgba(4,16,126,0.18)]"
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
            className="h-full w-full object-cover object-right transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-astra-dark/85 via-astra-dark/25 to-transparent" />
        </>
      ) : (
        <span className="absolute top-5 left-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-astra-primary">
          <GraduationCap className="h-6 w-6" />
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-5">
        <h3 className={`text-xl font-bold tracking-tight drop-shadow-sm ${cover ? "text-white" : "text-astra-primary"}`}>
          {title}
        </h3>
        <p className={`line-clamp-2 text-sm ${cover ? "text-white/80" : "text-astra-primary/70"}`}>{description}</p>
        <span
          className={`mt-1 rounded-full border px-3 py-1 text-xs font-semibold ${
            cover ? "border-white/30 text-white" : "border-astra-primary/25 text-astra-primary"
          }`}
        >
          Esplora
        </span>
      </div>
    </Link>
  );
}

export default GuideCategoryCard;
