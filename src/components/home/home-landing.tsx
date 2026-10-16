"use client";

import Link from "@/i18n/link";
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
import { homeCopy } from "@/i18n/copy/home";
import { useLang } from "@/i18n/locale-context";

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

type Partner = {
  name: keyof (typeof homeCopy)["en"]["partners"];
  logo: string;
  /** Tailwind size classes for the logo inside its panel. */
  logoClass: string;
  /** Panel background (CSS); matches the logo's own background so no box shows. */
  panel?: string;
  href?: string;
  code?: string;
  span: string;
};

const PARTNERS: Partner[] = [
  {
    name: "BookFlow",
    logo: "/partners/bookflow.png",
    logoClass: "w-[78%]",
    href: "https://bookflow.it",
    span: "lg:col-span-7",
  },
  {
    name: "Free@B",
    logo: "/partners/freeatb.png",
    logoClass: "w-full h-full",
    href: "https://freeatb.it",
    span: "lg:col-span-5",
  },
  {
    name: "UniMarket",
    logo: "/partners/unimarket.png",
    logoClass: "w-[68%]",
    panel: "#0c50c3",
    href: "https://uni-market.it",
    span: "lg:col-span-4",
  },
  {
    name: "StudyCheetah",
    logo: "/partners/studycheetah.svg",
    logoClass: "h-[92%]",
    panel: "#fcaa07",
    code: "ASTRA20",
    href: "https://studycheetah.com",
    span: "lg:col-span-4",
  },
  {
    name: "Notion",
    logo: "/partners/notion.png",
    logoClass: "h-[62%]",
    href: "https://notion.so",
    span: "lg:col-span-4",
  },
];


export function HomeLanding({
  previews = [],
  notices = [],
  events = [],
  conference = null,
  partners = [],
}: {
  previews?: string[];
  notices?: Notice[];
  events?: SiteEvent[];
  conference?: ConferenceData | null;
  partners?: BrandItem[];
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
      <PartnerBar items={partners} />
      <Partners />
      <SiteFooter />
    </div>
  );
}


function Hero() {
  const c = homeCopy[useLang()];
  return (
    <section
      id="top"
      // Same white as the section below, so there is no seam between them; the
      // hero's colour comes from the glow behind the cards instead.
      // On phones a full-screen hero left the band floating in empty space, so
      // it gets a fixed height there and the full viewport from sm up.
      className="relative h-[510px] overflow-hidden bg-white pt-[104px] sm:h-auto sm:min-h-screen"
    >
      {/* The band sits low in the section, so the copy reads clear above it. */}
      <HeroCarousel />

      <div className="relative z-10 mx-auto w-[min(1180px,calc(100%-48px))] text-center">
        <h1 className="mx-auto max-w-4xl text-[clamp(2.6rem,5.6vw,5.4rem)] leading-[0.92] font-semibold tracking-[-0.05em] text-astra-primary">
          {c.hero}
        </h1>
      </div>
    </section>
  );
}

function Association() {
  const c = homeCopy[useLang()];
  return (
    <section
      id="chi-siamo"
      className="mx-auto w-[min(1280px,calc(100%-48px))] py-24 lg:py-32"
    >
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <h2 className="text-[clamp(2.2rem,3.6vw,3.4rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-astra-primary">
            {c.associationTitle}
          </h2>
          <div className="mt-7 max-w-lg space-y-5 text-[1.02rem] leading-relaxed text-[#545d70]">
            <p>{c.associationP1}</p>
            <p>{c.associationP2}</p>
          </div>
          <a
            href="#"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-astra-primary hover:text-astra-accent"
          >
            {c.ourStory}
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <div className="min-w-0 pt-4 lg:pt-0">
          <p className="mb-4 text-xs font-semibold tracking-wide text-gray-400 uppercase">
            {c.board}
          </p>
          <BoardScroller members={BOARD_MEMBERS} />
        </div>

      </div>
    </section>
  );
}

function ForbesBar() {
  const c = homeCopy[useLang()];
  return (
    <section className="bg-astra-primary text-white">
      <div className="mx-auto flex w-[min(1280px,calc(100%-48px))] flex-col items-center gap-6 py-7 sm:flex-row">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/astra-regione-lombardia-next-leaders.jpeg"
          alt={c.forbesImgAlt}
          className="h-20 w-32 shrink-0 rounded-xl border border-white/20 object-cover object-top"
        />

        <p className="flex-1 text-center text-[0.98rem] leading-relaxed sm:text-left">
          <span className="font-semibold">{c.forbesNetwork}</span>
          {c.forbesMid}
          <span className="font-semibold">{c.forbesName}</span>
          {c.forbesAfter}
        </p>

        <a
          href="https://forbes.it/2025/03/28/giovani-futuri-ambasciatori-made-lombardia"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-astra-primary transition-transform hover:-translate-y-0.5"
        >
          {c.readArticle}
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}

function Handouts({ previews }: { previews: string[] }) {
  const c = homeCopy[useLang()];
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
            {c.handoutsTitle}
          </h2>
        </div>
        <Link
          href="/dispense"
          className="inline-flex h-12 items-center gap-2 rounded-full bg-astra-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-astra-dark"
        >
          {c.allHandouts}
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
  const c = homeCopy[useLang()];
  return (
    <section
      id="calcolatori"
      className="bg-[#f7f8fc] py-24 lg:py-32"
    >
      <div className="mx-auto w-[min(1280px,calc(100%-48px))]">
        <h2 className="max-w-3xl text-[clamp(2.2rem,3.6vw,3.4rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-astra-primary">
          {c.calcTitle}
        </h2>
        <p className="mt-6 max-w-xl text-[1.02rem] leading-relaxed text-[#545d70]">
          {c.calcLead}
        </p>

        <CalculatorCards className="mt-12" />
      </div>
    </section>
  );
}

// Edited from /admin/partner; hidden or empty, the bar is not rendered.
function PartnerBar({ items }: { items: BrandItem[] }) {
  if (items.length === 0) return null;
  return (
    // Height matches the Forbes bar above it: py-7 around an 80px plate.
    <section className="flex min-h-[136px] items-center bg-astra-primary py-6 text-white">
      {/* Full bleed: the rows run the whole viewport and the mask fades them
          at the edges, rather than stopping at the page gutter. */}
      <div className="flex w-full flex-col gap-3">
        <BrandScroller items={items} />
        {/* Second row runs the other way and starts halfway through the list,
            so the two rows never show the same plate at the same point. */}
        <BrandScrollerReverse
          items={[
            ...items.slice(Math.floor(items.length / 2)),
            ...items.slice(0, Math.floor(items.length / 2)),
          ]}
        />
      </div>
    </section>
  );
}

function Partners() {
  const c = homeCopy[useLang()];
  return (
    <section id="partner" className="py-24 lg:py-32">
      <div className="mx-auto w-[min(1280px,calc(100%-48px))]">
        <h2 className="max-w-2xl text-[clamp(2.2rem,3.6vw,3.4rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-astra-primary">
          {c.partnersTitle}
        </h2>

        <div className="mt-12 grid gap-3 lg:grid-cols-12">
          {PARTNERS.map((partner, index) => {
            const Card = partner.href ? "a" : "div";
            return (
              <Card
                key={partner.name}
                {...(partner.href
                  ? { href: partner.href, target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className={`${partner.span} group flex flex-col rounded-3xl border border-astra-primary/10 bg-white p-2.5 ${
                  partner.href ? "transition-transform hover:-translate-y-0.5" : ""
                }`}
              >
                <div
                  className={`flex items-center justify-center overflow-hidden rounded-[1.15rem] ${
                    index < 2 ? "h-56 sm:h-60 lg:h-56" : "h-44 sm:h-48"
                  }`}
                  style={{ background: partner.panel }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className={`${partner.logoClass} max-h-[90%] object-contain`}
                  />
                </div>

                <div className="flex items-start justify-between gap-4 px-3.5 pt-4 pb-3">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-astra-accent uppercase">
                      {c.partners[partner.name].role}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-astra-primary">
                      {partner.name}
                    </h3>
                    <p className="mt-1 text-sm text-[#6b7280]">{c.partners[partner.name].blurb}</p>
                    {partner.code && (
                      <p className="mt-2.5 inline-flex rounded-full bg-astra-light px-3 py-1 text-xs font-semibold text-astra-primary">
                        {c.code} {partner.code}
                      </p>
                    )}
                  </div>
                  {partner.href && (
                    <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-astra-primary/50 transition-colors group-hover:text-astra-primary" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HomeLanding;
