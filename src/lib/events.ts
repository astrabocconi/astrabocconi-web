import "server-only";
import { neon } from "@neondatabase/serverless";

// Events live in astra-app's Neon database and are entered once, in the app's
// dashboard. This is a read-only mirror of its /api/events query.

export type SiteEvent = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  ticketUrl: string | null;
};

const APP_URL = (process.env.ASTRA_APP_URL || "https://astra-app-cyan.vercel.app").replace(/\/$/, "");

export function isEventsConfigured() {
  return Boolean(process.env.NEON_DATABASE_URL);
}

let warned = false;
function warn(message: string) {
  if (warned) return;
  warned = true;
  console.error(`events unavailable: ${message}`);
}

type Row = {
  id: string;
  title: string;
  description: string | null;
  cover: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  ticket_url: string | null;
};

export async function getUpcomingEvents(limit = 6): Promise<SiteEvent[]> {
  const url = process.env.NEON_DATABASE_URL;
  if (!url) {
    warn("NEON_DATABASE_URL is not set");
    return [];
  }

  try {
    const sql = neon(url);
    // Prisma DateTime columns are timestamp without time zone holding UTC, so
    // every comparison is done in naive UTC and formatted back as ISO text.
    const rows = (await sql`
      select id, title, description, "coverImageKey" as cover, location,
             to_char("startsAt", 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as starts_at,
             to_char("endsAt", 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as ends_at,
             "externalTicketUrl" as ticket_url
      from "Event"
      where published and "deletedAt" is null
        and (
          "endsAt" >= (now() at time zone 'UTC')
          or ("endsAt" is null and "startsAt" >=
              ((date_trunc('day', now() at time zone 'Europe/Rome') at time zone 'Europe/Rome') at time zone 'UTC'))
        )
      order by "startsAt" asc
      limit ${limit}
    `) as Row[];

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      imageUrl: r.cover ? (r.cover.startsWith("/") ? APP_URL + r.cover : r.cover) : null,
      location: r.location,
      startsAt: r.starts_at,
      endsAt: r.ends_at,
      ticketUrl: r.ticket_url && /^https?:\/\//i.test(r.ticket_url) ? r.ticket_url : null,
    }));
  } catch (e) {
    warn(e instanceof Error ? e.message : String(e));
    return [];
  }
}

export const ASTRA_APP_EVENTS_URL = `${APP_URL}/dashboard/events`;
