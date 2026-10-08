"use client";

import { useState } from "react";
import Image from "next/image";
import { Download } from "lucide-react";
import type { Handout } from "@/lib/handouts";

// Responsive covers are cached by the image optimiser on the website's CDN.
export function HandoutCard({
  handout,
  priority = false,
}: {
  handout: Handout;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <a
      href={handout.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-2xl border border-astra-primary/10 bg-white transition-shadow hover:shadow-[0_18px_40px_rgba(4,16,126,0.13)]"
    >
      <div className="relative aspect-3/4 w-full overflow-hidden bg-astra-light">
        {failed ? (
          <span className="absolute inset-0 grid place-items-center px-4 text-center text-xs text-astra-primary/40">
            Anteprima non disponibile
          </span>
        ) : (
          <Image
            src={handout.thumbUrl}
            alt=""
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            width={480}
            height={640}
            sizes="(max-width: 639px) 45vw, (max-width: 1023px) 30vw, 260px"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-[0.95rem] leading-snug font-semibold text-gray-900">
          {handout.name}
        </h3>
        <span className="mt-auto inline-flex items-center gap-1.5 text-sm text-astra-primary/70 transition-colors group-hover:text-astra-accent">
          <Download className="h-4 w-4" />
          Scarica PDF
        </span>
      </div>
    </a>
  );
}

export default HandoutCard;
