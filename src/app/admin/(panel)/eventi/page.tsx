import { CalendarDays, ExternalLink } from "lucide-react";
import { requireOperator } from "@/lib/auth/operator";
import { ASTRA_APP_EVENTS_URL, getUpcomingEvents, isEventsConfigured } from "@/lib/events";
import { PageHeader } from "@/components/admin/ui/page-header";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { Card } from "@/components/admin/ui/card";

export const metadata = { title: "Eventi" };

const fmt = new Intl.DateTimeFormat("it-IT", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Rome",
});

export default async function EventsPage() {
  await requireOperator();
  const configured = isEventsConfigured();
  const events = configured ? await getUpcomingEvents() : [];

  const manage = (
    <a
      href={ASTRA_APP_EVENTS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-astra-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-astra-dark"
    >
      Gestisci nell&apos;app
      <ExternalLink className="h-4 w-4" />
    </a>
  );

  return (
    <>
      <PageHeader
        title="Eventi"
        subtitle="Letti dal dashboard di astra-app: si inseriscono una volta sola, lì, e compaiono nell'app e sul sito."
        actions={manage}
      />

      {!configured ? (
        <EmptyState
          icon={<CalendarDays className="h-7 w-7" />}
          title="Collegamento non configurato"
          description="Manca NEON_DATABASE_URL tra le variabili d'ambiente del sito, quindi la sezione eventi della home resta nascosta."
        />
      ) : events.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-7 w-7" />}
          title="Nessun evento in programma"
          description="Quando un evento viene pubblicato nel dashboard dell'app, compare qui e sulla home entro 5 minuti."
          action={manage}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {events.map((e) => (
            <Card key={e.id} className="flex items-center gap-4 p-4">
              {e.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.imageUrl} alt="" loading="lazy" className="h-14 w-20 shrink-0 rounded-xl object-cover" />
              ) : (
                <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-xl bg-astra-light text-astra-primary">
                  <CalendarDays className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900">{e.title}</p>
                <p className="mt-0.5 truncate text-sm text-gray-500">
                  {fmt.format(new Date(e.startsAt))}
                  {e.location ? ` · ${e.location}` : ""}
                </p>
              </div>
              {e.ticketUrl && (
                <a
                  href={e.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-sm font-medium text-astra-primary hover:text-astra-accent"
                >
                  Biglietti
                </a>
              )}
            </Card>
          ))}
          <p className="mt-2 text-xs text-gray-400">
            La home mostra i primi {events.length} eventi non ancora conclusi. Per modificarli usa il dashboard
            dell&apos;app.
          </p>
        </div>
      )}
    </>
  );
}
