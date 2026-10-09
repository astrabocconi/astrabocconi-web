import { GRADE_PLANS } from "./grade-plans";
import type { CalcType } from "./grade-calc";

// Picker labels for the calculator plans. Keys are GRADE_PLANS keys; anything
// missing here falls back to its key.
export const PLAN_NAMES: Record<string, string> = {
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

export function plansFor(type: CalcType): string[] {
  return Object.keys(GRADE_PLANS[type]).sort((a, b) => (PLAN_NAMES[a] ?? a).localeCompare(PLAN_NAMES[b] ?? b));
}

/**
 * The plan a calculator opens on. The app picks the student's own programme
 * from their profile; the website has no profile, so it falls back to the
 * first plan in the picker, as the app does for a student without one.
 */
export function defaultPlan(type: CalcType): string {
  return plansFor(type)[0]!;
}
