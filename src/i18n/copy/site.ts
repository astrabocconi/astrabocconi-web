import type { Copy } from "@/i18n/config";

type NavItem = { label: string; href: string };

// Hrefs are the same in both languages (the locale-aware Link adds /it), so the
// header's `active` prop can be matched on href whatever the language.
export const siteCopy: Copy<{
  nav: NavItem[];
  footerExtra: NavItem[];
  join: string;
  openMenu: string;
  closeMenu: string;
  logoAlt: string;
  tagline: string;
  loading: string;
}> = {
  en: {
    nav: [
      { label: "About us", href: "/#chi-siamo" },
      { label: "Handouts", href: "/dispense" },
      { label: "Guides", href: "/guide" },
      { label: "Calculators", href: "/calcolatori" },
      { label: "Stella Polare", href: "/stella-polare" },
    ],
    footerExtra: [
      { label: "Partners", href: "/#partner" },
      { label: "Representatives", href: "#" },
      { label: "Exchange", href: "#" },
      { label: "Contact", href: "#" },
    ],
    join: "Join us",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    logoAlt: "ASTRA Bocconi",
    tagline: "The student association of Bocconi University.",
    loading: "Loading",
  },
  it: {
    nav: [
      { label: "Chi siamo", href: "/#chi-siamo" },
      { label: "Dispense", href: "/dispense" },
      { label: "Guide", href: "/guide" },
      { label: "Calcolatori", href: "/calcolatori" },
      { label: "Stella Polare", href: "/stella-polare" },
    ],
    footerExtra: [
      { label: "Partner", href: "/#partner" },
      { label: "Rappresentanti", href: "#" },
      { label: "Exchange", href: "#" },
      { label: "Contatti", href: "#" },
    ],
    join: "Unisciti",
    openMenu: "Apri il menu",
    closeMenu: "Chiudi il menu",
    logoAlt: "ASTRA Bocconi",
    tagline: "Associazione studentesca dell'Università Bocconi.",
    loading: "Caricamento",
  },
};
