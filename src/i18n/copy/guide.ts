import type { Copy } from "@/i18n/config";

type Cat = { title: string; description: string };

type GuideCopy = {
  metaTitle: string;
  metaDescription: string;
  heading: string;
  intro: string;
  allGuides: string;
  categoryNotFound: string;
  noGuidesYet: string;
  explore: string;
  downloadPdf: string;
  /** Category names and blurbs, keyed by slug (slugs live in src/lib/guide-categories.ts). */
  categories: Record<string, Cat>;
};

export const guideCopy: Copy<GuideCopy> = {
  en: {
    metaTitle: "Guides",
    metaDescription:
      "ASTRA's guides to life at Bocconi: housing, thesis, internships, exchange, associations and more.",
    heading: "University Guides",
    intro: "Our guides, by students for students. Pick a category to get started.",
    allGuides: "All guides",
    categoryNotFound: "Category not found",
    noGuidesYet: "There are no guides in this category yet.",
    explore: "Explore",
    downloadPdf: "Download PDF",
    categories: {
      funding: { title: "Funding", description: "Funding opportunities available to you" },
      residenze: { title: "Residences", description: "Guides to student residences" },
      ecdl: { title: "ECDL", description: "Everything you need to know" },
      tesi: { title: "Thesis", description: "Your guide to the bachelor's thesis" },
      linkedin: { title: "LinkedIn", description: "Tips and guides for your LinkedIn profile" },
      associations: { title: "Associations", description: "Discover Bocconi's student associations" },
      opzionali: { title: "Electives", description: "Guides to choosing your electives" },
      stage: { title: "Internships", description: "Our guides to finding your internship" },
      "spring weeks": { title: "Spring Weeks", description: "Discover the spring weeks on offer" },
      freemover: { title: "Freemover", description: "Our guides to the freemover" },
      exchange_triennale: { title: "Bachelor's Exchange", description: "Guides to your bachelor's exchange" },
      exchange_magistrale: { title: "Master's Exchange", description: "Guides to your master's exchange" },
      graduate: { title: "Graduate", description: "Our guides to your master's degree" },
      university: { title: "University", description: "Guides to your first year at university" },
      milan: { title: "Milan", description: "Get to know Milan before you move" },
      burocrazia: { title: "Bureaucracy", description: "How to find your way through Italian bureaucracy" },
      master_admissions: { title: "Master's Admissions", description: "Guides to master's admissions" },
      bgl_domestic_track: { title: "BGL Domestic Track", description: "Your guide to the BGL Domestic Track" },
      program_change: { title: "Changing Bachelor's Course", description: "Your guide to changing bachelor's course" },
    },
  },
  it: {
    metaTitle: "Guide",
    metaDescription:
      "Le guide ASTRA per la vita universitaria in Bocconi: alloggi, tesi, stage, exchange, associazioni e altro.",
    heading: "Guide Universitarie",
    intro: "Le nostre guide, dagli studenti per gli studenti. Scegli una categoria per iniziare.",
    allGuides: "Tutte le guide",
    categoryNotFound: "Categoria non trovata",
    noGuidesYet: "Non ci sono ancora guide in questa categoria.",
    explore: "Esplora",
    downloadPdf: "Scarica PDF",
    categories: {
      funding: { title: "Funding", description: "Opportunità di finanziamento disponibili" },
      residenze: { title: "Residenze", description: "Guide per le residenze degli studenti" },
      ecdl: { title: "ECDL", description: "Tutto quello che devi sapere" },
      tesi: { title: "Tesi", description: "Guida per la tesi triennale" },
      linkedin: { title: "LinkedIn", description: "Consigli e guide per il tuo profilo LinkedIn" },
      associations: { title: "Associations", description: "Scopri le associazioni Bocconi" },
      opzionali: { title: "Opzionali", description: "Guide per la scelta dei tuoi opzionali" },
      stage: { title: "Stage", description: "Le nostre guide per il tuo stage" },
      "spring weeks": { title: "Spring Weeks", description: "Scopri le spring weeks disponibili" },
      freemover: { title: "Freemover", description: "Le nostre guide per il freemover" },
      exchange_triennale: { title: "Exchange Triennale", description: "Guide per il tuo exchange triennale" },
      exchange_magistrale: { title: "Exchange Magistrale", description: "Guide per il tuo exchange magistrale" },
      graduate: { title: "Graduate", description: "Le nostre guide per la tua magistrale" },
      university: { title: "University", description: "Guide al primo anno di Università" },
      milan: { title: "Milan", description: "Scopri Milano prima di trasferirti" },
      burocrazia: { title: "Burocrazia", description: "Come districarsi nella burocrazia italiana" },
      master_admissions: { title: "Master Admissions", description: "Guide per le ammissioni magistrali" },
      bgl_domestic_track: { title: "BGL Domestic Track", description: "Guida al percorso BGL Domestic Track" },
      program_change: { title: "Cambio Corso Triennale", description: "Guida al cambio corso triennale" },
    },
  },
};
