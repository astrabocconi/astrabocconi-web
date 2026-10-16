import { GRADE_PLANS } from "./grade-plans";
import type { CalcType } from "./grade-calc";
import type { Locale } from "@/i18n/config";

// Picker labels for the calculator plans. Keys are GRADE_PLANS keys; anything
// missing here falls back to its key.
const PLAN_NAMES_IT: Record<string, string> = {
  CLEAM: "CLEAM · Economia aziendale e management",
  CLEF: "CLEF · Economia e finanza",
  BESS: "BESS · Economic and Social Sciences",
  BEMACS: "BEMACS · Economics, Management and Computer Science",
  BIEM: "BIEM · International Economics and Management",
  "BIEF-ECON": "BIEF · Economics",
  "BIEF-FIN": "BIEF · Finance",
  CLEACC: "CLEACC · Classe italiana",
  "CLEACC-ENG": "CLEACC · English class",
  BEMACC: "BEMACC · Arts, Culture and Communication",
  BIG: "BIG · Politics and Policy Making",
  "BIG-DSO": "BIG · Data, Society and Organisation (HEC)",
  BAI: "BAI · Mathematical and Computing Sciences for AI",
  "BGL-GL": "BGL · Global Law",
  "BGL-DL": "BGL · Domestic Lawyer",
  ACME: "ACME · Arts, Culture, Media and Entertainment",
  AFM: "AFM · Accounting and Financial Management",
  AI: "AI · Artificial Intelligence",
  CLELI: "CLELI · Economia e legislazione per l'impresa",
  CRSG: "Cyber Risk Strategy and Governance",
  DAAIHS: "DAIHS · Data Analytics and AI in Health Sciences",
  DSBA: "DSBA · Data Science and Business Analytics",
  EMIT: "EMIT · Innovation and Technology",
  ESS: "ESS · Economic and Social Sciences",
  FINANCE: "Finance",
  GIO: "GIO · Government and International Organizations",
  IM: "IM · International Management",
  "IM-CONCENTRATION": "IM · Concentrations",
  "IM-GLOBAL": "IM · Global Experience",
  MM: "Marketing Management",
  PPA: "PPA · Politics and Policy Analysis",
  TS: "Transformative Sustainability",
  CLMG: "CLMG · Giurisprudenza",
};

// Only the Italian-language programmes need an English label; the rest are
// already English proper names.
const PLAN_NAMES_EN: Record<string, string> = {
  ...PLAN_NAMES_IT,
  CLEAM: "CLEAM · Business Administration and Management",
  CLEF: "CLEF · Economics and Finance",
  CLEACC: "CLEACC · Italian class",
  CLELI: "CLELI · Economics and Law for Business",
  CLMG: "CLMG · Law",
};

export const PLAN_NAMES: Record<Locale, Record<string, string>> = { en: PLAN_NAMES_EN, it: PLAN_NAMES_IT };

export const planName = (key: string, lang: Locale) => PLAN_NAMES[lang][key] ?? key;

// Sorted by the Italian labels by default, so the default plan (the first) is
// the same in every language; pass `lang` to sort a picker by what it shows.
export function plansFor(type: CalcType, lang: Locale = "it"): string[] {
  return Object.keys(GRADE_PLANS[type]).sort((a, b) => planName(a, lang).localeCompare(planName(b, lang)));
}

/**
 * The plan a calculator opens on. The app picks the student's own programme
 * from their profile; the website has no profile, so it falls back to the
 * first plan in the picker, as the app does for a student without one.
 */
export function defaultPlan(type: CalcType): string {
  return plansFor(type)[0]!;
}
