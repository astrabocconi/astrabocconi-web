import { GRADE_PLANS } from "./grade-plans";
import { newState, type CalcRow, type CalcState, type CalcType } from "./grade-calc";

/**
 * What a calculator saves: the chosen plan and only what the student changed.
 * Rows are rebuilt from the plan, so the value stays small and picks up plan
 * corrections in later releases. Mirrors astra-app/apps/mobile/lib/calc-state.ts;
 * the app keeps it in SecureStore, the website in localStorage.
 */
export interface SavedCalc {
  plan: string;
  grades: Record<string, number>;
  noGrade: string[];
  credits: Record<string, number>;
  removed: string[];
  custom: { id: string; name: string; credits: number; year: number }[];
  settings: Pick<CalcState, "internship" | "thesis" | "bonus" | "thesisType" | "onTime" | "athlete" | "target">;
  /**
   * Graduation grade from a typed-in average instead of the exam list, for
   * students who don't want to fill in every exam. Optional: saves from
   * before this existed don't have it.
   */
  direct?: { on: boolean; average: string };
}

/** localStorage key of each degree type's saved transcript. */
export const calcKey = (type: CalcType) => `astra.web.calculator.v1.${type}`;

// localStorage throws in some private modes and when blocked; a calculator
// that can't save still works for the session.
export function readSaved<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeSaved(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function freshSave(type: CalcType, plan: string): SavedCalc {
  const { internship, thesis, bonus, thesisType, onTime, athlete, target } = newState(
    type,
    plan,
    GRADE_PLANS[type][plan] ?? [],
  );
  return {
    plan,
    grades: {},
    noGrade: [],
    credits: {},
    removed: [],
    custom: [],
    settings: { internship, thesis, bonus, thesisType, onTime, athlete, target },
  };
}

export function toState(type: CalcType, saved: SavedCalc): CalcState {
  const base = newState(type, saved.plan, GRADE_PLANS[type][saved.plan] ?? []);
  const custom: CalcRow[] = saved.custom.map((c) => ({ ...c, kind: "g", grade: null }));
  const rows = [...base.rows, ...custom]
    .filter((r) => !saved.removed.includes(r.id))
    .map((r) => ({
      ...r,
      credits: saved.credits[r.id] ?? r.credits,
      grade: saved.grades[r.id] ?? null,
      noGrade: saved.noGrade.includes(r.id),
    }));
  return { ...base, ...saved.settings, rows };
}
