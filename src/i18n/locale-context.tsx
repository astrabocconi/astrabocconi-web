"use client";

import { createContext, useContext } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({ lang, children }: { lang: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={lang}>{children}</LocaleContext.Provider>;
}

/** Current locale inside client components. Server components read `params.lang`. */
export const useLang = () => useContext(LocaleContext);
