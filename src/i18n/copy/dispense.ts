import type { Copy } from "@/i18n/config";

type DispenseCopy = {
  metaTitle: string;
  metaDescription: string;
  rotating: string[];
  heroPrefix: string;
  heroSub: string;
  triennali: string;
  magistrali: string;
  altro: string;
  /** Display names for the non-programme courses, keyed by course code. */
  courseNames: Record<string, string>;
  courseNotFound: string;
  courseMetaTitle: (name: string) => string;
  courseMetaDescription: (name: string) => string;
  allCourses: string;
  noHandoutsYet: string;
  // Browser
  yearLabel: (y: number) => string;
  noYear: string;
  semester: string;
  semesterOption: (s: number) => string;
  type: string;
  examTypes: Record<"generale" | "parziale", string>;
  reset: string;
  searchPlaceholder: string;
  clear: string;
  count: (n: number) => string;
  noResults: string;
  // Cards
  previewUnavailable: string;
  downloadPdf: string;
};

export const dispenseCopy: Copy<DispenseCopy> = {
  en: {
    metaTitle: "Handouts",
    metaDescription:
      "Every ASTRA handout, gathered course by course and sorted by year, semester and exam type.",
    rotating: ["faster", "better", "smarter", "harder"],
    heroPrefix: "Handouts to study",
    heroSub: "By students, for students.",
    triennali: "Bachelor's",
    magistrali: "Master's",
    altro: "Other",
    courseNames: { ELECTIVES: "Electives", LANGUAGES: "Languages", SPANISH: "Spanish" },
    courseNotFound: "Course not found",
    courseMetaTitle: (n) => `${n} handouts`,
    courseMetaDescription: (n) =>
      `All the ${n} handouts, sorted by year, semester and exam type.`,
    allCourses: "All courses",
    noHandoutsYet: "There are no handouts for this course yet.",
    yearLabel: (y) => `Year ${y}`,
    noYear: "No year",
    semester: "Semester",
    semesterOption: (s) => `${s}${s === 1 ? "st" : "nd"}`,
    type: "Type",
    examTypes: { generale: "General", parziale: "Partial" },
    reset: "Reset",
    searchPlaceholder: "Search handouts by name",
    clear: "Clear",
    count: (n) => `${n} ${n === 1 ? "handout" : "handouts"}`,
    noResults: "No handouts match these filters.",
    previewUnavailable: "Preview not available",
    downloadPdf: "Download PDF",
  },
  it: {
    metaTitle: "Dispense",
    metaDescription:
      "Tutte le dispense ASTRA, raccolte corso per corso e divise per anno, semestre e tipo di esame.",
    rotating: ["faster", "better", "smarter", "harder"],
    heroPrefix: "Handouts to study",
    heroSub: "By students, for students.",
    triennali: "Triennali",
    magistrali: "Magistrali",
    altro: "Altro",
    courseNames: { ELECTIVES: "Electives", LANGUAGES: "Lingue", SPANISH: "Spagnolo" },
    courseNotFound: "Corso non trovato",
    courseMetaTitle: (n) => `Dispense ${n}`,
    courseMetaDescription: (n) =>
      `Tutte le dispense di ${n}, divise per anno, semestre e tipo di esame.`,
    allCourses: "Tutti i corsi",
    noHandoutsYet: "Non ci sono ancora dispense per questo corso.",
    yearLabel: (y) => `${y}º anno`,
    noYear: "Senza anno",
    semester: "Semestre",
    semesterOption: (s) => `${s}º`,
    type: "Tipo",
    examTypes: { generale: "generale", parziale: "parziale" },
    reset: "Azzera",
    searchPlaceholder: "Cerca una dispensa per nome",
    clear: "Cancella",
    count: (n) => `${n} ${n === 1 ? "dispensa" : "dispense"}`,
    noResults: "Nessuna dispensa con questi filtri.",
    previewUnavailable: "Anteprima non disponibile",
    downloadPdf: "Scarica PDF",
  },
};
