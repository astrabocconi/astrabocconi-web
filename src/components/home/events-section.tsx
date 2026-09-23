import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import type { ConferenceData } from "@/lib/site-content";
import type { SiteEvent } from "@/lib/events";
import { NoticeButtonLink } from "@/components/home/notice-strip";

const TZ = "Europe/Rome";
const day = new Intl.DateTimeFormat("it-IT", { day: "numeric", timeZone: TZ });
const month = new Intl.DateTimeFormat("it-IT", { month: "short", timeZone: TZ });
const time = new Intl.DateTimeFormat("it-IT", { weekday: "long", hour: "2-digit", minute: "2-digit", timeZone: TZ });

function EventCard({ event }: { event: SiteEvent }) {
  const start = new Date(event.startsAt);
  return (
    <article className="flex gap-4 rounded-2xl border border-astra-primary/10 bg-white p-4">
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-astra-light text-astra-primary">
        <span className="text-xl leading-none font-semibold">{day.format(start)}</span>
        <span className="mt-1 text-[11px] font-semibold tracking-wide uppercase">{month.format(start)}</span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-[1.02rem] leading-snug font-semibold text-astra-primary">{event.title}</h3>
        <p className="mt-1 text-sm text-[#6b7280] first-letter:uppercase">{time.format(start)}</p>
        {event.location && (
          <p className="mt-0.5 flex items-center gap-1 text-sm text-[#6b7280]">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{event.location}</span>
          </p>
        )}
        {event.ticketUrl && (
          <a
            href={event.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-astra-primary hover:text-astra-accent"
          >
            Biglietti
            <ArrowUpRight className="h-4 w-4" />
          </a>
        )}
      </div>

      {event.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={event.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="hidden h-24 w-32 shrink-0 rounded-xl object-cover sm:block"
        />
      )}
    </article>
  );
}

// `wide` puts the image beside the copy, for when the card has the row to itself.
export function ConferenceCard({ conference, wide = false }: { conference: ConferenceData; wide?: boolean }) {
  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-3xl bg-astra-primary text-white ${
        wide && conference.imageUrl ? "lg:grid lg:grid-cols-2" : ""
      }`}
    >
      {conference.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={conference.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className={`aspect-16/9 w-full object-cover ${wide ? "lg:aspect-auto lg:h-full" : ""}`}
        />
      )}
      <div className="flex flex-1 flex-col p-6">
        {conference.eyebrow && (
          <p className="text-xs font-semibold tracking-wide text-astra-gold uppercase">{conference.eyebrow}</p>
        )}
        <h3 className="mt-2 text-[1.6rem] leading-[1.08] font-semibold tracking-[-0.03em]">{conference.title}</h3>
        {(conference.dates || conference.location) && (
          <div className="mt-4 flex flex-col gap-1 text-sm text-white/75">
            {conference.dates && (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {conference.dates}
              </span>
            )}
            {conference.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {conference.location}
              </span>
            )}
          </div>
        )}
        {conference.description && (
          <p className="mt-4 text-sm leading-relaxed whitespace-pre-line text-white/80">{conference.description}</p>
        )}
        {conference.buttons.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2 pt-6">
            {conference.buttons.map((b, i) => (
              <NoticeButtonLink
                key={i}
                button={b}
                className={
                  b.style === "primary"
                    ? "bg-white text-astra-primary hover:bg-astra-light"
                    : "border border-white/30 text-white hover:bg-white/10"
                }
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export function EventsSection({
  events,
  conference,
}: {
  events: SiteEvent[];
  conference: ConferenceData | null;
}) {
  if (events.length === 0 && !conference) return null;
  const both = events.length > 0 && conference;

  return (
    <section id="eventi" className="py-24 lg:py-32">
      <div className="mx-auto w-[min(1280px,calc(100%-48px))]">
        <h2 className="max-w-2xl text-[clamp(2.2rem,3.6vw,3.4rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-astra-primary">
          {events.length > 0 ? "Prossimi eventi." : "La conferenza."}
        </h2>

        <div className={`mt-12 grid gap-6 ${both ? "lg:grid-cols-3" : ""}`}>
          {events.length > 0 && (
            <div className={both ? "flex flex-col gap-3 lg:col-span-2" : "grid gap-3 md:grid-cols-2"}>
              {events.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
          {conference && (
            <ConferenceCard conference={conference} wide={!both} />
          )}
        </div>
      </div>
    </section>
  );
}
