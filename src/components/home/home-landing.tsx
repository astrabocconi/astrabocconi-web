"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { AstraLogo } from "@/components/ui/logo";
import { EncryptedText } from "@/components/ui/encrypted-text";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import CircularSplitRoll from "@/components/ui/circular-split-roll";
import WovenCloth from "@/components/ui/woven-cloth";
import { HeroCarousel } from "@/components/home/hero-carousel";

// Scaffolding only. Nothing here is wired to the database or to other pages
// yet: every link is inert and every image is a blank white placeholder.
const NAV = ["Chi siamo", "Dispense", "Calcolatori", "Stella Polare", "Partner"];

const ASSOCIATION_ORBIT = [
  { id: 0, title: "Dispense" },
  { id: 1, title: "Guide" },
  { id: 2, title: "Exchange" },
  { id: 3, title: "Rappresentanza" },
  { id: 4, title: "Eventi" },
  { id: 5, title: "Community" },
];

const HANDOUT_COLUMNS = 6;
const HANDOUTS_PER_COLUMN = 5;

const CALCULATORS = [
  { name: "Media e GPA", hint: "Converti la media in GPA" },
  { name: "Voto di laurea", hint: "Triennale" },
  { name: "Voto di laurea magistrale", hint: "Magistrale" },
  { name: "Voto di laurea CLMG", hint: "Giurisprudenza" },
  { name: "Piano di studi", hint: "CFU e opzionali" },
  { name: "Punteggio exchange", hint: "Triennale e magistrale" },
  { name: "Exchange planner", hint: "Scegli le destinazioni" },
  { name: "Crediti liberi", hint: "Simulazione" },
];

const PARTNERS = [
  { name: "Partner principale", span: "lg:col-span-7" },
  { name: "Partner accademico", span: "lg:col-span-5" },
  { name: "Partner carriera", span: "lg:col-span-4" },
  { name: "Partner community", span: "lg:col-span-4" },
  { name: "Partner media", span: "lg:col-span-4" },
];

export function HomeLanding() {
  return (
    <div className="bg-white">
      <SiteHeader />
      <Hero />
      <Association />
      <ForbesBar />
      <Handouts />
      <Calculators />
      <Partners />
      <Banner />
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-astra-primary/8 bg-white/82 backdrop-blur-xl">
      <div className="mx-auto flex h-[74px] w-[min(1280px,calc(100%-48px))] items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <AstraLogo className="h-7 w-7 text-astra-primary" />
          <span className="text-[1.05rem] font-bold tracking-[0.16em] text-astra-primary">
            ASTRA
          </span>
        </a>

        <nav className="hidden items-center gap-1 rounded-full border border-astra-primary/10 bg-white/80 p-1.5 lg:flex">
          {NAV.map((item, i) => (
            <a
              key={item}
              href="#"
              className={`rounded-full px-4 py-2 text-[0.8rem] font-semibold transition-colors ${
                i === 0
                  ? "bg-astra-primary text-white"
                  : "text-[#51586b] hover:bg-astra-light hover:text-astra-primary"
              }`}
            >
              {item}
            </a>
          ))}
        </nav>

        <a
          href="#"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-astra-primary px-5 text-[0.8rem] font-semibold text-white transition-colors hover:bg-astra-dark"
        >
          Unisciti
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-b from-white to-[#f7f8fc] pt-[74px]"
    >
      <HeroCarousel />

      <div className="relative z-10 mx-auto w-[min(1180px,calc(100%-48px))] text-center">
        <p className="mb-6 font-mono text-[0.7rem] font-semibold tracking-[0.15em] text-astra-primary uppercase">
          Associazione studentesca · Università Bocconi
        </p>
        <h1 className="mx-auto max-w-4xl text-[clamp(3rem,7vw,7rem)] leading-[0.88] font-semibold tracking-[-0.055em] text-astra-primary">
          Tutto quello che serve per studiare in Bocconi.
        </h1>
        <p className="mx-auto mt-8 max-w-xl text-[clamp(1rem,1.2vw,1.15rem)] leading-relaxed text-[#545d70]">
          Dispense, guide, calcolatori e rappresentanza. Costruiti dagli
          studenti, per gli studenti.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#dispense"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-astra-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-astra-dark"
          >
            Esplora le dispense
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#chi-siamo"
            className="inline-flex h-12 items-center rounded-full border border-astra-primary/15 bg-white px-6 text-sm font-semibold text-astra-primary transition-colors hover:border-astra-accent"
          >
            Chi siamo
          </a>
        </div>
      </div>
    </section>
  );
}

function Association() {
  return (
    <section
      id="chi-siamo"
      className="mx-auto w-[min(1280px,calc(100%-48px))] py-24 lg:py-32"
    >
      <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
        <div className="lg:sticky lg:top-32">
          <p className="mb-5 font-mono text-[0.7rem] font-semibold tracking-[0.15em] text-astra-primary uppercase">
            01 · L&apos;associazione
          </p>
          <h2 className="text-[clamp(2.2rem,3.6vw,3.4rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-astra-primary">
            Una rete di studenti che si passa il testimone.
          </h2>
          <div className="mt-7 max-w-lg space-y-5 text-[1.02rem] leading-relaxed text-[#545d70]">
            <p>
              ASTRA nasce in Università Bocconi come punto di riferimento per
              chi studia: raccogliamo dispense, scriviamo guide, costruiamo
              strumenti e portiamo la voce degli studenti dove si prendono le
              decisioni.
            </p>
            <p>
              Ogni anno il testimone passa a un nuovo gruppo di rappresentanti.
              Quello che resta è il materiale: ordinato, accessibile e gratuito
              per tutti.
            </p>
          </div>
          <a
            href="#"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-astra-primary hover:text-astra-accent"
          >
            Scopri la nostra storia
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-astra-primary/10 bg-[#fbfbfe]">
          <CircularSplitRoll
            items={ASSOCIATION_ORBIT}
            radius={190}
            cardSize={108}
            sectionHeight={20}
            // pinSpacing must stay on: without the reserved scroll space the
            // pinned stage outlives this section and floats over the next one.
            pinSpacing
            scrub={1}
            columnSpreadVw={0}
            columnOffsetPx={118}
            titleSize="clamp(18px, 1.5vw, 28px)"
            background="transparent"
            titleColor="#04107e"
            stageClassName="h-[520px]"
            className="min-h-0"
          />
        </div>
      </div>
    </section>
  );
}

function ForbesBar() {
  return (
    <section className="bg-astra-primary text-white">
      <div className="mx-auto flex w-[min(1280px,calc(100%-48px))] flex-col items-center gap-6 py-7 sm:flex-row">
        {/* Static placeholder for the award photograph. */}
        <div className="h-20 w-32 shrink-0 rounded-xl border border-white/20 bg-white" />

        <p className="flex-1 text-center text-[0.98rem] leading-relaxed sm:text-left">
          <span className="font-semibold">Astra Network</span> è una rete
          studentesca interuniversitaria italiana in rapida crescita,
          riconosciuta da{" "}
          <span className="font-semibold">Forbes Italia</span> come la migliore
          rete di associazioni universitarie in Italia.
        </p>

        <a
          href="https://forbes.it/2025/03/28/giovani-futuri-ambasciatori-made-lombardia"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-astra-primary transition-transform hover:-translate-y-0.5"
        >
          Leggi l&apos;articolo
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}

function Handouts() {
  return (
    <section id="dispense" className="overflow-hidden py-24 lg:py-32">
      <div className="mx-auto mb-12 flex w-[min(1280px,calc(100%-48px))] flex-wrap items-end justify-between gap-6">
        <div>
          <p className="mb-5 font-mono text-[0.7rem] font-semibold tracking-[0.15em] text-astra-primary uppercase">
            02 · Dispense
          </p>
          <h2 className="max-w-2xl text-[clamp(2.2rem,3.6vw,3.4rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-astra-primary">
            Centinaia di dispense, raccolte corso per corso.
          </h2>
        </div>
        <a
          href="#"
          className="inline-flex h-12 items-center gap-2 rounded-full bg-astra-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-astra-dark"
        >
          Vedi tutte le dispense
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      <div className="relative">
        <div className="mx-auto grid w-[min(1280px,calc(100%-48px))] grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: HANDOUT_COLUMNS }).map((_, column) => (
            <InfiniteSlider
              key={column}
              duration={30 + column * 5}
              reverse={column % 2 === 1}
              gap={12}
              className="h-[430px]"
            >
              {Array.from({ length: HANDOUTS_PER_COLUMN }).map((__, row) => (
                <div
                  key={row}
                  className="aspect-3/4 w-full rounded-xl border border-astra-primary/10 bg-white shadow-[0_10px_30px_rgba(4,16,126,0.07)]"
                />
              ))}
            </InfiniteSlider>
          ))}
        </div>

        {/* Fades so the marquee dissolves instead of cutting off. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-white to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-white to-transparent" />
      </div>
    </section>
  );
}

function Calculators() {
  return (
    <section
      id="calcolatori"
      className="bg-[#f7f8fc] py-24 lg:py-32"
    >
      <div className="mx-auto w-[min(1280px,calc(100%-48px))]">
        <p className="mb-5 font-mono text-[0.7rem] font-semibold tracking-[0.15em] text-astra-primary uppercase">
          03 · Calcolatori
        </p>
        <h2 className="max-w-3xl text-[clamp(2.2rem,3.6vw,3.4rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-astra-primary">
          <EncryptedText
            text="Calcola media, voto di laurea e punteggio exchange."
            revealDelayMs={26}
            flipDelayMs={38}
            encryptedClassName="text-astra-primary/25"
            revealedClassName="text-astra-primary"
          />
        </h2>
        <p className="mt-6 max-w-xl text-[1.02rem] leading-relaxed text-[#545d70]">
          Gli stessi strumenti che usiamo noi, con le formule ufficiali
          dell&apos;ateneo.
        </p>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CALCULATORS.map((calculator) => (
            <a
              key={calculator.name}
              href="#"
              className="group flex min-h-[168px] flex-col justify-between rounded-2xl border border-astra-primary/10 bg-white p-5 transition-shadow hover:shadow-[0_18px_40px_rgba(4,16,126,0.1)]"
            >
              <div className="h-9 w-9 rounded-full bg-astra-light" />
              <div>
                <h3 className="text-[1.02rem] font-semibold text-astra-primary">
                  {calculator.name}
                </h3>
                <p className="mt-1 text-sm text-[#6b7280]">{calculator.hint}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-astra-primary/30 transition-colors group-hover:text-astra-accent" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Partners() {
  return (
    <section id="partner" className="py-24 lg:py-32">
      <div className="mx-auto w-[min(1280px,calc(100%-48px))]">
        <p className="mb-5 font-mono text-[0.7rem] font-semibold tracking-[0.15em] text-astra-primary uppercase">
          04 · Partner
        </p>
        <h2 className="max-w-2xl text-[clamp(2.2rem,3.6vw,3.4rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-astra-primary">
          Le realtà che crescono insieme a noi.
        </h2>

        <div className="mt-12 grid gap-3 lg:grid-cols-12">
          {PARTNERS.map((partner, index) => (
            <div
              key={partner.name}
              className={`${partner.span} flex flex-col justify-between rounded-3xl border border-astra-primary/10 bg-white p-6 ${
                index < 2 ? "min-h-[300px]" : "min-h-[220px]"
              }`}
            >
              {/* Blank logo plate until the real partners are loaded. */}
              <div
                className={`rounded-2xl bg-[#f7f8fc] ${index < 2 ? "h-36" : "h-20"}`}
              />
              <div className="mt-6">
                <h3 className="text-[1.02rem] font-semibold text-astra-primary">
                  {partner.name}
                </h3>
                <p className="mt-1 text-sm text-[#6b7280]">
                  Placeholder, da collegare
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Banner() {
  return (
    <section className="relative h-[560px] w-full overflow-hidden bg-astra-dark">
      <WovenCloth className="absolute inset-0 h-full w-full" />
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-astra-primary/10 bg-white">
      <div className="mx-auto flex w-[min(1280px,calc(100%-48px))] flex-col gap-8 py-14 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <AstraLogo className="h-6 w-6 text-astra-primary" />
            <span className="text-[0.95rem] font-bold tracking-[0.16em] text-astra-primary">
              ASTRA
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-[#6b7280]">
            Associazione studentesca dell&apos;Università Bocconi.
          </p>
        </div>

        <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm text-[#545d70] sm:grid-cols-3">
          {[...NAV, "Rappresentanti", "Exchange", "Contatti"].map((item) => (
            <a key={item} href="#" className="hover:text-astra-primary">
              {item}
            </a>
          ))}
        </nav>
      </div>

      <div className="border-t border-astra-primary/8">
        <div className="mx-auto w-[min(1280px,calc(100%-48px))] py-5 text-xs text-[#8a90a2]">
          © {new Date().getFullYear()} ASTRA Bocconi
        </div>
      </div>
    </footer>
  );
}

export default HomeLanding;
