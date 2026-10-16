export const LOCALES = ["en", "it"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "lang";

export const isLocale = (v: string): v is Locale => (LOCALES as readonly string[]).includes(v);

/**
 * English is the default and lives at the bare path (/dispense); Italian lives
 * under /it. External URLs and in-page anchors pass through untouched.
 */
export function withLocale(lang: Locale, href: string): string {
  if (lang === DEFAULT_LOCALE || !href.startsWith("/") || href.startsWith("//")) return href;
  return href === "/" ? "/it" : `/it${href}`;
}

/** Copy modules hold both languages side by side so they are edited together. */
export type Copy<T> = Record<Locale, T>;

/** Route params arrive as plain strings; the layout has already 404ed unknown ones. */
export const toLocale = (v: string): Locale => (isLocale(v) ? v : DEFAULT_LOCALE);

/** Locale for Intl formatting (dates, numbers). */
export const INTL_LOCALE: Record<Locale, string> = { en: "en-GB", it: "it-IT" };
