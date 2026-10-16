import type { Copy } from "@/i18n/config";

type Partner = { role: string; blurb: string };

export const homeCopy: Copy<{
  hero: string;
  associationTitle: string;
  associationP1: string;
  associationP2: string;
  ourStory: string;
  board: string;
  forbesImgAlt: string;
  forbesMid: string;
  forbesAfter: string;
  forbesNetwork: string;
  forbesName: string;
  readArticle: string;
  handoutsTitle: string;
  allHandouts: string;
  calcTitle: string;
  calcLead: string;
  partnersTitle: string;
  code: string;
  // Keyed by brand name; brand names themselves are never translated.
  partners: Record<"BookFlow" | "Free@B" | "UniMarket" | "StudyCheetah" | "Notion", Partner>;
}> = {
  en: {
    hero: "Everything you need to study at Bocconi.",
    associationTitle: "A network of students passing the baton.",
    associationP1:
      "ASTRA was born at Bocconi University as a reference point for students: we collect handouts, write guides, build tools and bring the student voice to where decisions are made.",
    associationP2:
      "Every year the baton passes to a new group of representatives. What stays is the material: organised, accessible and free for everyone.",
    ourStory: "Discover our story",
    board: "The board",
    forbesImgAlt: "ASTRA and Regione Lombardia, Next Leaders",
    forbesMid: " is a fast-growing Italian inter-university student network, recognised by ",
    forbesAfter: " as the best network of university associations in Italy.",
    forbesNetwork: "Astra Network",
    forbesName: "Forbes Italia",
    readArticle: "Read the article",
    handoutsTitle: "Hundreds of handouts, gathered course by course.",
    allHandouts: "See all handouts",
    calcTitle: "Your next goal, grade by grade.",
    calcLead: "The same tools we use ourselves, with the university's official formulas.",
    partnersTitle: "The organisations growing with us.",
    code: "Code",
    partners: {
      BookFlow: { role: "Main partner", blurb: "Buy and resell your university books." },
      "Free@B": { role: "Study spaces partner", blurb: "Find the free study rooms at Bocconi." },
      UniMarket: { role: "Marketplace partner", blurb: "Bocconi's official marketplace." },
      StudyCheetah: { role: "Study partner", blurb: "Your study companion." },
      Notion: { role: "Community partner", blurb: "Alongside the ASTRA community." },
    },
  },
  it: {
    hero: "Tutto quello che serve per studiare in Bocconi.",
    associationTitle: "Una rete di studenti che si passa il testimone.",
    associationP1:
      "ASTRA nasce in Università Bocconi come punto di riferimento per chi studia: raccogliamo dispense, scriviamo guide, costruiamo strumenti e portiamo la voce degli studenti dove si prendono le decisioni.",
    associationP2:
      "Ogni anno il testimone passa a un nuovo gruppo di rappresentanti. Quello che resta è il materiale: ordinato, accessibile e gratuito per tutti.",
    ourStory: "Scopri la nostra storia",
    board: "Il board",
    forbesImgAlt: "ASTRA e Regione Lombardia, Next Leaders",
    forbesMid:
      " è una rete studentesca interuniversitaria italiana in rapida crescita, riconosciuta da ",
    forbesAfter: " come la migliore rete di associazioni universitarie in Italia.",
    forbesNetwork: "Astra Network",
    forbesName: "Forbes Italia",
    readArticle: "Leggi l'articolo",
    handoutsTitle: "Centinaia di dispense, raccolte corso per corso.",
    allHandouts: "Vedi tutte le dispense",
    calcTitle: "Il tuo prossimo traguardo, voto per voto.",
    calcLead: "Gli stessi strumenti che usiamo noi, con le formule ufficiali dell'ateneo.",
    partnersTitle: "Le realtà che crescono insieme a noi.",
    code: "Codice",
    partners: {
      BookFlow: { role: "Partner principale", blurb: "Compra e rivendi i libri universitari." },
      "Free@B": { role: "Partner spazi studio", blurb: "Trova le aule studio libere in Bocconi." },
      UniMarket: { role: "Partner marketplace", blurb: "Il marketplace ufficiale di Bocconi." },
      StudyCheetah: { role: "Study partner", blurb: "Il tuo compagno di studio." },
      Notion: { role: "Community partner", blurb: "Al fianco della community di ASTRA." },
    },
  },
};

export const eventsCopy: Copy<{
  tickets: string;
  upcoming: string;
  comingTitle: string;
  comingBody: string;
  conferenceAndEvents: string;
}> = {
  en: {
    tickets: "Tickets",
    upcoming: "Upcoming events",
    comingTitle: "New dates coming soon.",
    comingBody: "The calendar updates here as soon as we publish an event.",
    conferenceAndEvents: "Conference and events.",
  },
  it: {
    tickets: "Biglietti",
    upcoming: "Prossimi eventi",
    comingTitle: "Nuove date in arrivo.",
    comingBody: "Il calendario si aggiorna qui appena pubblichiamo un evento.",
    conferenceAndEvents: "Conferenza ed eventi.",
  },
};

export const noticeCopy: Copy<{ label: string }> = {
  en: { label: "Notices" },
  it: { label: "Avvisi" },
};
