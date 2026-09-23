// Category metadata: title, description and cover art. Structural taxonomy,
// like the fixed course lists in handouts.ts, not content an editor publishes.
// Titles and descriptions are carried over from the old site's copy.
// The `magistrali` category is retired (that material now lives under
// Dispense) and the synthetic `languages` category is dropped: those
// materials are already reachable at /dispense/languages.

export type GuideCategory = {
  slug: string;
  title: string;
  description: string;
};

export const GUIDE_CATEGORIES: GuideCategory[] = [
  { slug: "funding", title: "Funding", description: "Opportunità di finanziamento disponibili" },
  { slug: "residenze", title: "Residenze", description: "Guide per le residenze degli studenti" },
  { slug: "ecdl", title: "ECDL", description: "Tutto quello che devi sapere" },
  { slug: "tesi", title: "Tesi", description: "Guida per la tesi triennale" },
  { slug: "linkedin", title: "LinkedIn", description: "Consigli e guide per il tuo profilo LinkedIn" },
  { slug: "associations", title: "Associations", description: "Scopri le associazioni Bocconi" },
  { slug: "opzionali", title: "Opzionali", description: "Guide per la scelta dei tuoi opzionali" },
  { slug: "stage", title: "Stage", description: "Le nostre guide per il tuo stage" },
  { slug: "spring weeks", title: "Spring Weeks", description: "Scopri le spring weeks disponibili" },
  { slug: "freemover", title: "Freemover", description: "Le nostre guide per il freemover" },
  { slug: "exchange_triennale", title: "Exchange Triennale", description: "Guide per il tuo exchange triennale" },
  { slug: "exchange_magistrale", title: "Exchange Magistrale", description: "Guide per il tuo exchange magistrale" },
  { slug: "graduate", title: "Graduate", description: "Le nostre guide per la tua magistrale" },
  { slug: "university", title: "University", description: "Guide al primo anno di Università" },
  { slug: "milan", title: "Milan", description: "Scopri Milano prima di trasferirti" },
  { slug: "burocrazia", title: "Burocrazia", description: "Come districarsi nella burocrazia italiana" },
  { slug: "master_admissions", title: "Master Admissions", description: "Guide per le ammissioni magistrali" },
  { slug: "bgl_domestic_track", title: "BGL Domestic Track", description: "Guida al percorso BGL Domestic Track" },
  { slug: "program_change", title: "Cambio Corso Triennale", description: "Guida al cambio corso triennale" },
];

const HAS_COVER = new Set(GUIDE_CATEGORIES.map((c) => c.slug).filter((s) => s !== "graduate"));

const BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/guide-covers`;

export function guideCoverUrl(slug: string): string | undefined {
  return HAS_COVER.has(slug) ? `${BASE}/${slug.replace(/\s+/g, "-")}.jpg` : undefined;
}

export function findGuideCategory(slug: string): GuideCategory | undefined {
  return GUIDE_CATEGORIES.find((c) => c.slug === slug);
}

// Only "spring weeks" has a space; URLs can't carry one.
export function categoryToParam(slug: string): string {
  return slug.replace(/\s+/g, "-");
}

export function paramToCategory(param: string): string {
  return param === "spring-weeks" ? "spring weeks" : param;
}
