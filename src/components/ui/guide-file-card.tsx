"use client";

import { useState } from "react";
import { Download, FileText } from "lucide-react";
import type { Guide } from "@/lib/guides";

// A title's own wording is language enough: nearly every guide is titled
// "Guide ..." or "Guida ...", so that word alone tells IT from EN without a
// dedicated column. Falls back to no badge when neither is present.
function detectLanguageFlag(title: string): string | null {
  const t = title.toLowerCase();
  const isEnglish = /\b(eng|english|guide)\b/.test(t) || t.endsWith(" en");
  if (isEnglish) return "https://flagcdn.com/w80/gb.png";
  const isItalian = /\b(ita|italiano|guida)\b/.test(t) || t.endsWith(" it");
  if (isItalian) return "https://flagcdn.com/w80/it.png";
  return null;
}

export function GuideFileCard({ guide, priority = false }: { guide: Guide; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  const flag = detectLanguageFlag(guide.title);
  const showThumb = guide.thumbnailUrl && !failed;

  return (
    <a
      href={guide.fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-2xl border border-astra-primary/10 bg-white transition-shadow hover:shadow-[0_18px_40px_rgba(4,16,126,0.13)]"
    >
      <div className="relative aspect-3/4 w-full overflow-hidden bg-astra-light">
        {showThumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={guide.thumbnailUrl!}
            alt=""
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            width={480}
            height={640}
            onError={() => setFailed(true)}
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-astra-primary/25">
            <FileText className="h-12 w-12" />
          </span>
        )}

        {flag && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={flag}
            alt=""
            className="absolute top-2 right-2 h-6 w-6 rounded-full border-2 border-white object-cover shadow"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-[0.95rem] leading-snug font-semibold text-gray-900">{guide.title}</h3>
        {guide.description && (
          <p className="line-clamp-2 text-sm text-gray-500">{guide.description}</p>
        )}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-sm text-astra-primary/70 transition-colors group-hover:text-astra-accent">
          <Download className="h-4 w-4" />
          Scarica PDF
        </span>
      </div>
    </a>
  );
}

export default GuideFileCard;
