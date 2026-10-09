import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import type { ConferenceData } from "@/lib/site-content";
import type { SiteEvent } from "@/lib/events";
import { NoticeButtonLink } from "@/components/home/notice-strip";

const TZ = "Europe/Rome";
const day = new Intl.DateTimeFormat("it-IT", { day: "numeric", timeZone: TZ });
const month = new Intl.DateTimeFormat("it-IT", { month: "short", timeZone: TZ });
const time = new Intl.DateTimeFormat("it-IT", { weekday: "long", hour: "2-digit", minute: "2-digit", timeZone: TZ });

// One row of the events list. Rows share a single panel instead of each
// being its own card, so a short list does not read as scattered boxes.
function EventRow({ event }: { event: SiteEvent }) {
  const start = new Date(event.startsAt);
  return (
    <li className="flex gap-4 py-5 first:pt-0 last:pb-0">
      <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-astra-light text-astra-primary">
        <span className="text-xl leading-none font-semibold">{day.format(start)}</span>
        <span className="mt-1 text-[11px] font-semibold tracking-wide uppercase">{month.format(start)}</span>
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="text-[1.02rem] leading-snug font-semibold text-astra-primary">{event.title}</h4>
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
            className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-astra-primary hover:text-astra-accent"
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
          className="hidden h-16 w-20 shrink-0 rounded-xl object-cover sm:block"
        />
      )}
    </li>
  );
}

function EventsPanel({ events }: { events: SiteEvent[] }) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-astra-primary/10 bg-white p-6 sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Prossimi eventi</h3>
        {events.length > 0 && (
          <span className="text-xs font-semibold text-astra-primary/60">{events.length}</span>
        )}
      </div>

      {events.length > 0 ? (
        <ul className="mt-6 divide-y divide-astra-primary/8">
          {events.map((e) => (
            <EventRow key={e.id} event={e} />
          ))}
        </ul>
      ) : (
        // Fills the column so it lines up with the conference card; copy sits
        // at the bottom, editorial style, rather than floating in the middle.
        <div className="mt-6 flex min-h-56 flex-1 flex-col justify-between gap-8 rounded-2xl bg-[#f7f8fc] p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-astra-primary">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[1.3rem] leading-tight font-semibold tracking-[-0.02em] text-astra-primary">
              Nuove date in arrivo.
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#6b7280]">
              Il calendario si aggiorna qui appena pubblichiamo un evento.
            </p>
          </div>
        </div>
      )}
    </div>
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
          className={`aspect-16/9 w-full object-cover ${wide ? "lg:aspect-auto lg:h-full" : "lg:aspect-2/1"}`}
        />
      )}
      <div className="flex flex-1 flex-col p-6 sm:p-8">
        {conference.eyebrow && (
          <p className="text-xs font-semibold tracking-wide text-astra-gold uppercase">{conference.eyebrow}</p>
        )}
        <h3 className="mt-2 text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
          {conference.title}
        </h3>
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
          <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed whitespace-pre-line text-white/80">{conference.description}</p>
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

// Conference and events sit side by side from lg up, stacked below. With no
// conference the events panel takes the row; with no events the conference
// keeps its column and the panel says new dates are coming, so the layout
// does not change shape every time the calendar empties.
export function EventsSection({
  events,
  conference,
}: {
  events: SiteEvent[];
  conference: ConferenceData | null;
}) {
  if (events.length === 0 && !conference) return null;

  return (
    <section id="eventi" className="pb-24 lg:pb-32">
      <div className="mx-auto w-[min(1280px,calc(100%-48px))]">
        <h2 className="max-w-2xl text-[clamp(2.2rem,3.6vw,3.4rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-astra-primary">
          {conference ? "Conferenza ed eventi." : "Prossimi eventi."}
        </h2>

        <div className="mt-12 grid items-stretch gap-4 lg:grid-cols-12">
          {conference && (
            <div className="lg:col-span-7">
              <ConferenceCard conference={conference} />
            </div>
          )}
          <div className={conference ? "lg:col-span-5" : "lg:col-span-12"}>
            <EventsPanel events={events} />
          </div>
        </div>
      </div>
    </section>
  );
}
