import type { Copy } from "@/i18n/config";

/** The graduation calculators, one per degree type: each is /calcolatori/[type]. */
export const CALC_TYPES = ["bachelor", "master", "clmg"] as const;
export type CalcTypeKey = (typeof CALC_TYPES)[number];

type TypeCopy = { name: string; tab: string; detail: string; years: string; credits: string };

export const calculatorCopy: Copy<{
  types: Record<CalcTypeKey, TypeCopy>;
  admissionsCard: { name: string; detail: string; left: string; right: string };
  hub: { title: string; description: string; eyebrow: string; h1: string; lead: string };
  calcPageTitle: (name?: string) => string;
  admissionsPage: { title: string; description: string; back: string; eyebrow: string; h1: string };
  calc: {
    typeNav: string;
    eyebrow: string;
    loading: string;
    saved: string;
    saveFailed: string;
    examsAria: string;
    programme: string;
    resetConfirm: string;
    internship: string;
    elective: (n: string) => string;
    electiveInstead: string;
    avgTitle: string;
    addGrades: string;
    gradedOf: (done: string, total: string) => string;
    outOf110: (v: string) => string;
    lodeCount: (n: number) => string;
    internshipCounts: string;
    internshipOff: string;
    internshipReplaces: (name: string) => string;
    internshipAsk: string;
    year: (y: number) => string;
    addExam: string;
    newExam: string;
    extraExams: string;
    panelLabel: string;
    tabGraduation: string;
    tabSimulate: string;
    resultsAria: string;
    estimate: string;
    rulesLink: string;
    startOver: string;
    credits: (n: string) => string;
    creditsLabel: string;
    notInAverage: string;
    passFail: string;
    ungraded: string;
    examName: string;
    gradeOf: (name: string) => string;
    clearGrade: string;
    giveGrade: string;
    noGradeAction: string;
    removeExam: string;
    averageToUse: string;
    fromExams: string;
    typeAverage: string;
    yourAverage: string;
    yourAverageSub: string;
    averagePlaceholder: string;
    thesisPoints: string;
    emptyDirect: string;
    gradMark: string;
    lodePossible: string;
    lodeNote: string;
    breakdown: (avg: string, thesis: string, bonus: string) => string;
    keepAverage: string;
    rounding: string;
    thesisType: string;
    research: string;
    applied: string;
    thesisSubBachelor: string;
    thesisSubClmg: string;
    thesisSubMaster: (max: number) => string;
    bonusTitle: string;
    bonusSub: string;
    clmgBonusTitle: string;
    clmgBonusSub: string;
    onTimeTitle: string;
    onTimeSub: string;
    athleteTitle: string;
    athleteSub: string;
    noneLeft: string;
    impossible: string;
    alreadySafe: string;
    simplest: string;
    inLast: string;
    inEach: (n: number) => string;
    needAverage: (avg: string, n: number) => string;
    otherWays: string;
    mixOne: (high: string, name: string, low: string) => string;
    mixMany: (high: string, n: number, low: string) => string;
    combos: (reaching: string, total: string, share: string) => string;
    combosShare: (share: string) => string;
    simThesisPoints: string;
    target: string;
    lodeBachelor: string;
    lodeClmg: string;
  };
  admissions: {
    yourData: string;
    round: string;
    round1: string;
    round2: string;
    average: string;
    averageSub: string;
    averagePlaceholder: string;
    useCalc: (v: string) => string;
    credits: string;
    creditsSub: string;
    onTime: string;
    onTimeSub: (min: number) => string;
    score: string;
    scoreEmpty: string;
    outOf110: (v: string) => string;
    dontKnow: string;
    workItOut: string;
    listAria: string;
    noSurvey: string;
    lowest: (v: string) => string;
    median: (v: string, n: number) => string;
    selective: string;
    emptyList: string;
    howTitle: string;
    how: [string, string][];
    disclaimer: string;
    chance: { likely: string; possible: string; unlikely: string; unknown: string };
  };
}> = {
  en: {
    types: {
      bachelor: { name: "Bachelor", tab: "Bachelor's", detail: "Bachelor's degree", years: "3 years", credits: "180 ECTS" },
      master: { name: "Master", tab: "Master's", detail: "Master's degree", years: "2 years", credits: "120 ECTS" },
      clmg: { name: "CLMG", tab: "Law", detail: "Law", years: "5 years", credits: "300 ECTS" },
    },
    admissionsCard: { name: "Admissions", detail: "Master's admissions", left: "2 rounds", right: "18 programmes" },
    hub: {
      title: "Calculators",
      description: "Weighted average, graduation mark and master's admissions: the ASTRA calculators for Bocconi students.",
      eyebrow: "Calculators",
      h1: "Your next milestone, grade by grade.",
      lead: "Enter your grades, work out your average and graduation mark, see how far you are from your target and where your score could take you for a master's.",
    },
    calcPageTitle: (name) => `${name ?? "Graduation"} calculator`,
    admissionsPage: {
      title: "Master's admissions",
      description: "Work out your admission score for Bocconi's master's degrees and compare it with last year's admits.",
      back: "All calculators",
      eyebrow: "Where your score could take you",
      h1: "Master's admissions",
    },
    calc: {
      typeNav: "Degree type",
      eyebrow: "Grade calculator",
      loading: "Loading your grades…",
      saved: "Saved in this browser as you type",
      saveFailed: "Saving isn't available in this browser: keep the page open so you don't lose your grades.",
      examsAria: "Exams and grades",
      programme: "Degree programme",
      resetConfirm: "Start over? This deletes all the grades entered in this calculator.",
      internship: "Internship",
      elective: (n) => `Elective ${n}`,
      electiveInstead: "Elective (instead of the internship)",
      avgTitle: "Weighted average",
      addGrades: "Add your grades below",
      gradedOf: (done, total) => `${done} of ${total} credits graded`,
      outOf110: (v) => `${v} out of 110`,
      lodeCount: (n) => `${n} × 30 cum laude`,
      internshipCounts: "Counts as credits without a grade",
      internshipOff: "Off: an elective takes its place",
      internshipReplaces: (name) => `Replaces ${name}. Ungraded, and it earns the +1 bonus`,
      internshipAsk: "Doing a curricular internship? It replaces an elective",
      year: (y) => `Year ${y}`,
      addExam: "Add an exam",
      newExam: "New exam",
      extraExams: "Extra exams beyond the required ones: only add your best two (if grades tie, the ones worth more credits).",
      panelLabel: "Panel",
      tabGraduation: "Graduation mark",
      tabSimulate: "Set a target",
      resultsAria: "Results",
      estimate: "An estimate based on Bocconi's regulations. The official mark is the one the board awards.",
      rulesLink: "Bocconi's rules",
      startOver: "Start over",
      credits: (n) => `${n} credits`,
      creditsLabel: "Credits",
      notInAverage: "Not in the average",
      passFail: "Pass/fail",
      ungraded: "Ungraded",
      examName: "Exam name",
      gradeOf: (name) => `Grade for ${name}`,
      clearGrade: "Clear the grade",
      giveGrade: "Give it a grade",
      noGradeAction: "No grade (pass/fail or certificate)",
      removeExam: "Remove this exam",
      averageToUse: "Average to use",
      fromExams: "From my exams",
      typeAverage: "I'll type my average",
      yourAverage: "Your weighted average",
      yourAverageSub: "On the 30-point scale, e.g. 27.40",
      averagePlaceholder: "27.40",
      thesisPoints: "Thesis points",
      emptyDirect: "Type your average above to see your mark",
      gradMark: "Graduation mark",
      lodePossible: "110 cum laude possible",
      lodeNote: "The board can award cum laude, by unanimous decision",
      breakdown: (avg, thesis, bonus) => `Average ${avg} + thesis ${thesis} + bonus ${bonus}`,
      keepAverage: "If you keep your current average on the exams you have left. ",
      rounding: "Bocconi doesn't say how the total is rounded. We round to the nearest point.",
      thesisType: "Thesis type",
      research: "Research",
      applied: "Applied",
      thesisSubBachelor: "From 0 to 4, awarded by the board",
      thesisSubClmg: "Up to 6, awarded by the board",
      thesisSubMaster: (max) => `Up to ${max} for this type of thesis`,
      bonusTitle: "+1 bonus",
      bonusSub: "Internship, exchange or double degree with a recognised exam, joint programme",
      clmgBonusTitle: "+1 excellent curriculum",
      clmgBonusSub: "Internship, moot court, legal clinic, exchange with a registered exam",
      onTimeTitle: "+1 graduating on time",
      onTimeSub: "July or October session of the second year",
      athleteTitle: "+1 student-athlete",
      athleteSub: "With official national or international results",
      noneLeft: "No exams left to take: your mark depends on the thesis and the bonus.",
      impossible: "Out of reach, even with 30 cum laude in every exam you have left. Try a lower target or more thesis points.",
      alreadySafe: "You're already there. Even with an 18 in every exam you have left, you reach your target.",
      simplest: "The simplest way",
      inLast: "in your last exam",
      inEach: (n) => `in each of your ${n} remaining exams`,
      needAverage: (avg, n) => `You need an average of ${avg} across your ${n} remaining exams`,
      otherWays: "Other ways to get there",
      mixOne: (high, name, low) => `${high} in ${name}, ${low} in the rest`,
      mixMany: (high, n, low) => `${high} in ${n} exams, ${low} in the rest`,
      combos: (reaching, total, share) => `${reaching} out of ${total} grade combinations work (${share})`,
      combosShare: (share) => `${share} of all possible grade combinations work`,
      simThesisPoints: "Thesis points you're aiming for",
      target: "Target mark",
      lodeBachelor: "For cum laude you also need at least 3 thesis points.",
      lodeClmg: "For cum laude, thesis and curriculum together must make 6.",
    },
    admissions: {
      yourData: "Your details",
      round: "Round",
      round1: "Round 1",
      round2: "Round 2",
      average: "Your average",
      averageSub: "Weighted average on the 30-point scale, e.g. 27.45",
      averagePlaceholder: "27.45",
      useCalc: (v) => `Use the calculator's average (${v})`,
      credits: "Credits registered",
      creditsSub: "By the round's deadline",
      onTime: "On time",
      onTimeSub: (min) => `+1 point, plus 0.05 for every credit above ${min}`,
      score: "Your admission score",
      scoreEmpty: "Enter your average to see where you stand",
      outOf110: (v) => `${v} out of 110`,
      dontKnow: "Don't know your average? ",
      workItOut: "Work it out here",
      listAria: "Master's programmes",
      noSurvey: "No survey responses for this round",
      lowest: (v) => `Lowest admit ${v}`,
      median: (v, n) => `median admit ${v} (${n} responses)`,
      selective: "Also needs a letter, CV or interview",
      emptyList: "Enter your average to see, programme by programme, how it compares with last year's admits.",
      howTitle: "How admission works",
      how: [
        ["Two rounds", "Round 1: you can apply with at least 90 credits registered (by the end of July) or with your bachelor's degree. Applications usually run from July to October, results arrive at the end of November, and this is where most places are allocated (around 60%). Round 2: from 110 credits (by the end of April); applications run from February to April, results come at the end of May, for the few places left."],
        ["Your score", "Your weighted average, converted to the 110 scale. Modules count one by one, so it can differ from the calculator's average. On-time students get 1 extra point plus 0.05 for every credit above the minimum (exams, internship, seminars and pass/fail items registered by the deadline). Exchange and internship give no extra points."],
        ["Your choices", "You can list up to 5 programmes. Everyone is ranked by score across all of them; places are allocated from the top down, and each person gets the highest choice that still has room. It doesn't matter when you apply within the window."],
        ["Programmes that ask for more", "CEMS MIM, IM Global Experience, China MIM, ESSEC, AI, Finance Global Experience and the PPA double degrees have language requirements, a motivation letter and a video interview. Cyber Risk and Transformative Sustainability (with PoliMi) also assess your letter and CV. If you choose AI you must upload a transcript showing your scientific sectors (SSD)."],
      ],
      disclaimer: "Based on anonymous surveys of last year's applicants (ASTRA and B.lab Bocconi). This is not official Bocconi data: answers can be inaccurate, not everyone replied and thresholds change every year.",
      chance: { likely: "Likely", possible: "Possible", unlikely: "Unlikely", unknown: "No data" },
    },
  },
  it: {
    types: {
      bachelor: { name: "Bachelor", tab: "Triennale", detail: "Laurea triennale", years: "3 anni", credits: "180 CFU" },
      master: { name: "Master", tab: "Magistrale", detail: "Laurea magistrale", years: "2 anni", credits: "120 CFU" },
      clmg: { name: "CLMG", tab: "Giurisprudenza", detail: "Giurisprudenza", years: "5 anni", credits: "300 CFU" },
    },
    admissionsCard: { name: "Ammissioni", detail: "Ammissioni magistrali", left: "2 round", right: "18 corsi" },
    hub: {
      title: "Calcolatori",
      description: "Media ponderata, voto di laurea e ammissioni magistrali: i calcolatori ASTRA per gli studenti Bocconi.",
      eyebrow: "Calcolatori",
      h1: "Il tuo prossimo traguardo, voto per voto.",
      lead: "Inserisci i voti, calcola la media e il voto di laurea, scopri quanto manca al tuo obiettivo e dove può portarti per la magistrale.",
    },
    calcPageTitle: (name) => `Calcolatore ${name ?? "laurea"}`,
    admissionsPage: {
      title: "Ammissioni magistrali",
      description: "Calcola il tuo punteggio di ammissione alle lauree magistrali Bocconi e confrontalo con gli ammessi dell'anno scorso.",
      back: "Tutti i calcolatori",
      eyebrow: "Dove può portarti il tuo punteggio",
      h1: "Ammissioni magistrali",
    },
    calc: {
      typeNav: "Tipo di laurea",
      eyebrow: "Calcolatore voti",
      loading: "Caricamento dei voti…",
      saved: "Salvato in questo browser mentre scrivi",
      saveFailed: "Salvataggio non disponibile in questo browser: tieni aperta la pagina per non perdere i voti.",
      examsAria: "Esami e voti",
      programme: "Corso di laurea",
      resetConfirm: "Ricominciare? Cancella tutti i voti inseriti in questo calcolatore.",
      internship: "Stage",
      elective: (n) => `Opzionale ${n}`,
      electiveInstead: "Opzionale (al posto dello stage)",
      avgTitle: "Media ponderata",
      addGrades: "Aggiungi i tuoi voti qui sotto",
      gradedOf: (done, total) => `${done} di ${total} crediti con voto`,
      outOf110: (v) => `${v} su 110`,
      lodeCount: (n) => `${n} × 30 e lode`,
      internshipCounts: "Conta come crediti senza voto",
      internshipOff: "Disattivato: al suo posto c'è un opzionale",
      internshipReplaces: (name) => `Sostituisce ${name}. Senza voto, e vale il bonus di +1`,
      internshipAsk: "Fai uno stage curriculare? Sostituisce un opzionale",
      year: (y) => `${y}° anno`,
      addExam: "Aggiungi un esame",
      newExam: "Nuovo esame",
      extraExams: "Esami in sovrannumero: aggiungi solo i due migliori (a parità di voto, quelli con più crediti).",
      panelLabel: "Pannello",
      tabGraduation: "Voto di laurea",
      tabSimulate: "Simula un obiettivo",
      resultsAria: "Risultati",
      estimate: "Una stima basata sui regolamenti Bocconi. Il voto ufficiale è quello della commissione.",
      rulesLink: "Le regole Bocconi",
      startOver: "Ricomincia",
      credits: (n) => `${n} crediti`,
      creditsLabel: "Crediti",
      notInAverage: "Non entra in media",
      passFail: "Idoneità",
      ungraded: "Senza voto",
      examName: "Nome dell'esame",
      gradeOf: (name) => `Voto di ${name}`,
      clearGrade: "Togli il voto",
      giveGrade: "Dagli un voto",
      noGradeAction: "Senza voto (idoneità o certificazione)",
      removeExam: "Rimuovi questo esame",
      averageToUse: "Media da usare",
      fromExams: "Dai miei esami",
      typeAverage: "Inserisco la media",
      yourAverage: "La tua media ponderata",
      yourAverageSub: "In trentesimi, es. 27,40",
      averagePlaceholder: "27,40",
      thesisPoints: "Punti della prova finale",
      emptyDirect: "Scrivi la tua media qui sopra per vedere il voto",
      gradMark: "Voto di laurea",
      lodePossible: "110 e lode possibile",
      lodeNote: "La commissione può assegnare la lode, all'unanimità",
      breakdown: (avg, thesis, bonus) => `Media ${avg} + prova finale ${thesis} + bonus ${bonus}`,
      keepAverage: "Se mantieni la media attuale negli esami che ti restano. ",
      rounding: "Bocconi non dice come si arrotonda il totale. Noi arrotondiamo al punto più vicino.",
      thesisType: "Tipo di tesi",
      research: "Di ricerca",
      applied: "Applicata",
      thesisSubBachelor: "Da 0 a 4, li assegna la commissione",
      thesisSubClmg: "Fino a 6, li assegna la commissione",
      thesisSubMaster: (max) => `Fino a ${max} per questo tipo di tesi`,
      bonusTitle: "Bonus di +1",
      bonusSub: "Stage, Exchange o Double Degree con un esame riconosciuto, Joint Program",
      clmgBonusTitle: "+1 curriculum d'eccellenza",
      clmgBonusSub: "Stage, moot court, legal clinic, Exchange con un esame registrato",
      onTimeTitle: "+1 laurea in corso",
      onTimeSub: "Sessione di luglio o ottobre del secondo anno",
      athleteTitle: "+1 studente-atleta",
      athleteSub: "Con risultati ufficiali nazionali o internazionali",
      noneLeft: "Nessun esame da dare: il voto dipende dalla prova finale e dal bonus.",
      impossible: "Fuori portata, anche con 30 e lode in ogni esame che resta. Prova un obiettivo più basso o più punti di tesi.",
      alreadySafe: "Ce l'hai già fatta. Anche con 18 in ogni esame che resta arrivi all'obiettivo.",
      simplest: "Il modo più semplice",
      inLast: "nel tuo ultimo esame",
      inEach: (n) => `in ognuno dei ${n} esami che ti restano`,
      needAverage: (avg, n) => `Ti serve una media di ${avg} nei ${n} esami che ti restano`,
      otherWays: "Altri modi per arrivarci",
      mixOne: (high, name, low) => `${high} in ${name}, ${low} negli altri`,
      mixMany: (high, n, low) => `${high} in ${n} esami, ${low} negli altri`,
      combos: (reaching, total, share) => `Funzionano ${reaching} combinazioni di voti su ${total} (${share})`,
      combosShare: (share) => `Funziona il ${share} di tutte le combinazioni di voti possibili`,
      simThesisPoints: "Punti della prova finale che vuoi ottenere",
      target: "Voto obiettivo",
      lodeBachelor: "Per la lode servono anche almeno 3 punti alla prova finale.",
      lodeClmg: "Per la lode prova finale e curriculum devono fare 6.",
    },
    admissions: {
      yourData: "I tuoi dati",
      round: "Round",
      round1: "1° round",
      round2: "2° round",
      average: "La tua media",
      averageSub: "Media ponderata in trentesimi, es. 27,45",
      averagePlaceholder: "27,45",
      useCalc: (v) => `Usa la media del calcolatore (${v})`,
      credits: "Crediti registrati",
      creditsSub: "Entro la scadenza del round",
      onTime: "In corso",
      onTimeSub: (min) => `+1 punto, più 0,05 per ogni credito oltre ${min}`,
      score: "Il tuo punteggio di ammissione",
      scoreEmpty: "Inserisci la tua media per vedere a che punto sei",
      outOf110: (v) => `${v} su 110`,
      dontKnow: "Non conosci la tua media? ",
      workItOut: "Calcolala qui",
      listAria: "Corsi di laurea magistrale",
      noSurvey: "Nessuna risposta al sondaggio per questo round",
      lowest: (v) => `Ammesso più basso ${v}`,
      median: (v, n) => `ammesso medio ${v} (${n} risposte)`,
      selective: "Serve anche lettera, CV o colloquio",
      emptyList: "Inserisci la tua media per vedere, corso per corso, come si confronta con gli ammessi dell'anno scorso.",
      howTitle: "Come funziona l'ammissione",
      how: [
        ["Due round", "Primo round: puoi candidarti con almeno 90 crediti registrati (entro fine luglio) o con la laurea triennale. Le candidature di solito vanno da luglio a ottobre, i risultati arrivano a fine novembre e qui si assegna la maggior parte dei posti (circa il 60%). Secondo round: da 110 crediti (entro fine aprile); candidature da febbraio ad aprile, risultati a fine maggio, per i pochi posti rimasti."],
        ["Il tuo punteggio", "La media ponderata, convertita in centodecimi. I moduli contano uno per uno, quindi può essere diversa dalla media del calcolatore. Gli studenti in corso hanno 1 punto in più e 0,05 per ogni credito oltre il minimo (esami, stage, seminari e idoneità registrati entro la scadenza). Exchange e stage non danno punti extra."],
        ["Le tue scelte", "Puoi indicare fino a 5 corsi. Tutti vengono messi in graduatoria per punteggio; i posti si assegnano dall'alto, e ognuno ottiene la scelta più alta che ha ancora posto. Quando ti candidi dentro la finestra non conta."],
        ["Corsi che chiedono di più", "CEMS MIM, IM Global Experience, China MIM, ESSEC, AI, Finance Global Experience e i double degree PPA richiedono requisiti linguistici, una lettera motivazionale e un video colloquio. Cyber Risk e Transformative Sustainability (con il PoliMi) valutano anche lettera e CV. Se scegli AI devi caricare il transcript con i settori scientifici (SSD)."],
      ],
      disclaimer: "Basato su sondaggi anonimi tra i candidati dell'anno scorso (ASTRA e B.lab Bocconi). Non sono dati ufficiali Bocconi: le risposte possono essere imprecise, non tutti hanno risposto e le soglie cambiano ogni anno.",
      chance: { likely: "Probabile", possible: "Possibile", unlikely: "Difficile", unknown: "Nessun dato" },
    },
  },
};
