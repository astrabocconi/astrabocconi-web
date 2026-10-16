"use client";

import { usePathname } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/i18n/config";
import { useLang } from "@/i18n/locale-context";

// Plain anchors (full navigation): the proxy reads the cookie, so the choice
// sticks for the next visit. usePathname is the browser path, which for English
// has no prefix.
export function LanguageSwitch({ className = "" }: { className?: string }) {
  const lang = useLang();
  const path = usePathname() || "/";
  const bare = path === "/it" ? "/" : path.replace(/^\/it(?=\/)/, "");
  const target = (to: Locale) => (to === "en" ? bare : bare === "/" ? "/it" : `/it${bare}`);
  const pick = (to: Locale) => {
    // eslint-disable-next-line react-hooks/immutability -- plain cookie write inside a click handler
    document.cookie = `${LOCALE_COOKIE}=${to}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <div className={`inline-flex items-center gap-1 text-xs font-semibold ${className}`} role="group" aria-label="Language">
      {(["en", "it"] as const).map((to, i) => (
        <span key={to} className="inline-flex items-center gap-1">
          {i > 0 && <span aria-hidden="true" className="opacity-30">/</span>}
          <a
            href={target(to)}
            hrefLang={to}
            onClick={() => pick(to)}
            aria-current={lang === to ? "true" : undefined}
            className={lang === to ? "opacity-100" : "opacity-50 transition-opacity hover:opacity-100"}
          >
            {to.toUpperCase()}
          </a>
        </span>
      ))}
    </div>
  );
}
