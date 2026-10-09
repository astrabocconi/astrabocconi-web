import Link from "next/link";
import { CalendarDays, ChevronRight, Plus } from "lucide-react";
import { requirePermission } from "@/lib/auth/operator";
import { isEventsConfigured, ASTRA_APP_URL } from "@/lib/events";
import { listEvents, type AdminEvent } from "@/lib/events-admin";
import { romeLocalToIso } from "@/lib/site-content";
import { PageHeader } from "@/components/admin/ui/page-header";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { buttonClass } from "@/components/admin/ui/button";
import { PublishToggle } from "./publish-toggle";

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

function Row({ e, past }: { e: AdminEvent; past?: boolean }) {
  const img = e.coverImageKey ? (e.coverImageKey.startsWith("/") ? ASTRA_APP_URL + e.coverImageKey : e.coverImageKey) : null;
  return (
    <div
      className={`group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-3 pr-4 shadow-sm transition-all hover:border-astra-light hover:shadow-md ${
        past ? "opacity-70 hover:opacity-100" : ""
      }`}
    >
      <Link href={`/admin/eventi/${e.id}`} className="flex min-w-0 flex-1 items-center gap-4">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" loading="lazy" className="h-14 w-24 shrink-0 rounded-xl object-cover" />
        ) : (
          <div className="flex h-14 w-24 shrink-0 items-center justify-center rounded-xl bg-astra-light text-astra-primary">
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
      </Link>
      <PublishToggle id={e.id} published={e.published} />
      <Link href={`/admin/eventi/${e.id}`} aria-label="Modifica" className="text-gray-300 group-hover:text-astra-accent">
        <ChevronRight className="h-5 w-5" />
      </Link>
    </div>
  );
}

export default async function EventsPage() {
  await requirePermission("events:write");

  const newButton = (
    <Link href="/admin/eventi/nuovo" className={buttonClass()}>
      <Plus className="h-4 w-4" /> Nuovo evento
    </Link>
  );

  if (!isEventsConfigured()) {
    return (
      <>
        <PageHeader title="Eventi" />
        <EmptyState
          icon={<CalendarDays className="h-7 w-7" />}
          title="Collegamento non configurato"
          description="Manca NEON_DATABASE_URL tra le variabili d'ambiente del sito: senza, gli eventi non si possono leggere né scrivere."
        />
      </>
    );
  }

  const rows = await listEvents();

  // Past once the end has gone by, or with no end once its start day (in Milan)
  // is over. Same rule as the home page and the app.
  const now = new Date().toISOString();
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Rome" }).format(new Date());
  const dayStart = romeLocalToIso(`${today}T00:00`) ?? now;
  const isPast = (e: AdminEvent) => (e.endsAt ? e.endsAt < now : e.startsAt < dayStart);
  const upcoming = rows.filter((e) => !isPast(e));
  const past = rows.filter(isPast).reverse();

  const count = (n: number) => (n === 1 ? "1 evento" : `${n} eventi`);

  return (
    <>
      <PageHeader
        title="Eventi"
        subtitle="Un solo elenco per il sito e per l'app. Quelli pubblicati compaiono sulla home e nella scheda Eventi dell'app."
        actions={newButton}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-7 w-7" />}
          title="Nessun evento"
          description="Crea un evento con il link ai biglietti: compare sulla home e nell'app."
          action={newButton}
        />
      ) : (
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-gray-800">In programma</h2>
              <span className="text-xs text-gray-400">{count(upcoming.length)}</span>
            </div>
            {upcoming.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
                Niente in programma. I nuovi eventi compaiono qui, sul sito e nell&apos;app.
              </p>
            ) : (
              upcoming.map((e) => <Row key={e.id} e={e} />)
            )}
          </section>

          {past.length > 0 && (
            <section className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold text-gray-800">Passati</h2>
                <span className="text-xs text-gray-400">{count(past.length)}</span>
              </div>
              <p className="-mt-1 mb-1 text-xs text-gray-400">
                Già conclusi, quindi non più visibili al pubblico. Restano modificabili.
              </p>
              {past.map((e) => (
                <Row key={e.id} e={e} past />
              ))}
            </section>
          )}
        </div>
      )}
    </>
  );
}
