import type { Copy } from "@/i18n/config";

type StellaCopy = {
  metaTitle: string;
  metaDescription: string;
  heading: string;
  intro: string;
  empty: string;
  notFound: string;
};

export const stellaCopy: Copy<StellaCopy> = {
  en: {
    metaTitle: "Stella Polare",
    metaDescription:
      "ASTRA Bocconi's student magazine: current affairs, culture, economics and law, written by students.",
    heading: "Stella Polare",
    intro:
      "ASTRA Bocconi's student magazine. Current affairs, culture, economics and law, written by students.",
    empty: "No articles have been published yet.",
    notFound: "Article not found",
  },
  it: {
    metaTitle: "Stella Polare",
    metaDescription:
      "La rivista editoriale di ASTRA Bocconi: attualità, cultura, economia e diritto raccontati dagli studenti.",
    heading: "Stella Polare",
    intro:
      "La rivista editoriale di ASTRA Bocconi. Attualità, cultura, economia e diritto raccontati dagli studenti.",
    empty: "Non ci sono ancora articoli pubblicati.",
    notFound: "Articolo non trovato",
  },
};
