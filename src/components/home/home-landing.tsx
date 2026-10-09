"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { useInView } from "motion/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import {
  BrandScroller,
  BrandScrollerReverse,
  type BrandItem,
} from "@/components/ui/brand-scoller";
import { BoardScroller, type BoardMember } from "@/components/ui/board-scroller";
import { CalculatorCards } from "@/components/calculators/calculator-cards";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import { NoticeStrip } from "@/components/home/notice-strip";
import { EventsSection } from "@/components/home/events-section";
import type { ConferenceData, Notice } from "@/lib/site-content";
import type { SiteEvent } from "@/lib/events";

// Imagery is still blank placeholder. Dispense and Stella Polare are wired to
// real pages; the remaining links are inert until those pages exist.
// Board cards are the official ASTRA graphics (name, role and department are
// already part of the image), sourced from public/board/.
const BOARD_MEMBERS: BoardMember[] = [
  { photo: "/board/2.jpg", name: "Presidents: Davide Dorigo, Ilaria Mandanici" },
  { photo: "/board/3.jpg", name: "Executive: Riccardo Lotti (Secretary), Jacopo Sciarappa (Treasurer)" },
  { photo: "/board/4.jpg", name: "Heads of Representation: Cristiano Moschella, Emma Bisogno" },
  { photo: "/board/5.jpg", name: "Casa Representative: Carlo Pagliula" },
  { photo: "/board/6.jpg", name: "Heads of Events: Pietro Cianci, Rachele Giannelli" },
  { photo: "/board/7.jpg", name: "Heads of Conferences: Cristian Benedetto, Simone Provini" },
  { photo: "/board/8.jpg", name: "Heads of Media: Nello Cortellessa, Niccolò Pavone" },
  { photo: "/board/9.jpg", name: "Heads of Partnerships: Giulia Zanini, Ludovica Tiri" },
  { photo: "/board/10.jpg", name: "Heads of International: Arina Gazina, Mishal Khan" },
  { photo: "/board/11.jpg", name: "Heads of Student Services: Giorgia Surian, Umberto Frijia" },
  { photo: "/board/12.jpg", name: "Heads of Career Services: Emanuele Bozzo, Maria Teresa Aiello" },
  { photo: "/board/13.jpg", name: "Heads of Press: Marco Ferraù, Greta Stacchio" },
  { photo: "/board/14.jpg", name: "Heads of Legal: Leonardo Barone, Valentina Zandri" },
  { photo: "/board/15.jpg", name: "Heads of Sport: Claudio Conti, Michele Capotosto" },
  { photo: "/board/16.jpg", name: "Heads of Tech: Michele Matozza, Antonino Galfo" },
];

const HANDOUT_COLUMNS = 6;
const HANDOUTS_PER_COLUMN = 5;

// Placeholder plates until the real partner logos arrive.
const PARTNER_BRANDS: BrandItem[] = [
  { name: "Partner 01" },
  { name: "Partner 02" },
  { name: "Partner 03" },
  { name: "Partner 04" },
  { name: "Partner 05" },
  { name: "Partner 06" },
  { name: "Partner 07" },
  { name: "Partner 08" },
];

const PARTNERS = [
  { name: "Partner principale", span: "lg:col-span-7" },
  { name: "Partner accademico", span: "lg:col-span-5" },
  { name: "Partner carriera", span: "lg:col-span-4" },
  { name: "Partner community", span: "lg:col-span-4" },
  { name: "Partner media", span: "lg:col-span-4" },
];


export function HomeLanding({
  previews = [],
  notices = [],
  events = [],
  conference = null,
}: {
  previews?: string[];
  notices?: Notice[];
  events?: SiteEvent[];
  conference?: ConferenceData | null;
}) {
  return (
    <div className="bg-white">
      <SiteHeader active="/" />
      <Hero />
      <NoticeStrip notices={notices} />
      <Association />
      <ForbesBar />
      <Handouts previews={previews} />
      <EventsSection events={events} conference={conference} />
      <Calculators />
      <PartnerBar />
      <Partners />
      <SiteFooter />
    </div>
  );
}


function Hero() {
  return (
    <section
      id="top"
      // Same white as the section below, so there is no seam between them; the
      // hero's colour comes from the glow behind the cards instead.
      className="relative min-h-screen overflow-hidden bg-white pt-[104px]"
    >
      {/* The band sits low in the section, so the copy reads clear above it. */}
      <HeroCarousel />

      <div className="relative z-10 mx-auto w-[min(1180px,calc(100%-48px))] text-center">
        <h1 className="mx-auto max-w-4xl text-[clamp(2.6rem,5.6vw,5.4rem)] leading-[0.92] font-semibold tracking-[-0.05em] text-astra-primary">
          Tutto quello che serve per studiare in Bocconi.
        </h1>
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
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
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

        <div className="min-w-0 pt-4 lg:pt-0">
          <p className="mb-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
            Il board
          </p>
          <BoardScroller members={BOARD_MEMBERS} />
        </div>

      </div>
    </section>
  );
}

function ForbesBar() {
  return (
    <section className="bg-astra-primary text-white">
      <div className="mx-auto flex w-[min(1280px,calc(100%-48px))] flex-col items-center gap-6 py-7 sm:flex-row">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/astra-regione-lombardia-next-leaders.jpeg"
          alt="ASTRA e Regione Lombardia, Next Leaders"
          className="h-20 w-32 shrink-0 rounded-xl border border-white/20 bg-white object-contain"
        />

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

function Handouts({ previews }: { previews: string[] }) {
  const ref = useRef<HTMLElement>(null);
  const nearby = useInView(ref, { once: true, margin: "800px" });
  // Deal distinct covers out column by column. Duplicates only appear if the
  // database has fewer than HANDOUT_COLUMNS * HANDOUTS_PER_COLUMN of them.
  const unique = [...new Set(previews.filter(Boolean))];
  const columns = Array.from({ length: HANDOUT_COLUMNS }, (_, c) =>
    Array.from({ length: HANDOUTS_PER_COLUMN }, (_, r) => {
      const i = c * HANDOUTS_PER_COLUMN + r;
      return unique.length ? unique[i % unique.length] : undefined;
    }),
  );

  return (
    <section ref={ref} id="dispense" className="overflow-hidden py-24 lg:py-32">
      <div className="mx-auto mb-12 flex w-[min(1280px,calc(100%-48px))] flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="max-w-2xl text-[clamp(2.2rem,3.6vw,3.4rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-astra-primary">
            Centinaia di dispense, raccolte corso per corso.
          </h2>
        </div>
        <Link
          href="/dispense"
          className="inline-flex h-12 items-center gap-2 rounded-full bg-astra-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-astra-dark"
        >
          Vedi tutte le dispense
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="relative">
        <div className="mx-auto grid w-[min(1280px,calc(100%-48px))] grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {columns.map((covers, column) => (
            <InfiniteSlider
              key={column}
              duration={30 + column * 5}
              reverse={column % 2 === 1}
              gap={12}
              className="h-[430px]"
            >
              {covers.map((cover, row) => (
                <div
                  key={row}
                  className="aspect-3/4 w-full overflow-hidden rounded-xl border border-astra-primary/10 bg-white shadow-[0_10px_30px_rgba(4,16,126,0.07)]"
                >
                  {cover ? (
                    <Image
                      src={cover}
                      alt=""
                      loading={nearby ? "eager" : "lazy"}
                      decoding="async"
                      width={480}
                      height={640}
                      sizes="(max-width: 639px) 30vw, (max-width: 1023px) 23vw, 210px"
                      className="h-full w-full object-cover object-top"
                    />
                  ) : null}
                </div>
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
        <h2 className="max-w-3xl text-[clamp(2.2rem,3.6vw,3.4rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-astra-primary">
          Il tuo prossimo traguardo, voto per voto.
        </h2>
        <p className="mt-6 max-w-xl text-[1.02rem] leading-relaxed text-[#545d70]">
          Gli stessi strumenti che usiamo noi, con le formule ufficiali
          dell&apos;ateneo.
        </p>

        <CalculatorCards className="mt-12" />
      </div>
    </section>
  );
}

function PartnerBar() {
  return (
    // Height matches the Forbes bar above it: py-7 around an 80px plate.
    <section className="flex min-h-[136px] items-center bg-astra-primary text-white">
      {/* Full bleed: the rows run the whole viewport and the mask fades them
          at the edges, rather than stopping at the page gutter. */}
      <div className="flex w-full flex-col gap-1.5">
        <BrandScroller items={PARTNER_BRANDS} />
        {/* Second row runs the other way and starts halfway through the list,
            so the two rows never show the same plate at the same point. */}
        <BrandScrollerReverse
          items={[
            ...PARTNER_BRANDS.slice(PARTNER_BRANDS.length / 2),
            ...PARTNER_BRANDS.slice(0, PARTNER_BRANDS.length / 2),
          ]}
        />
      </div>
    </section>
  );
}

function Partners() {
  return (
    <section id="partner" className="py-24 lg:py-32">
      <div className="mx-auto w-[min(1280px,calc(100%-48px))]">
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



export default HomeLanding;
