import "server-only";
import { randomBytes } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import { IN_APP_ROUTES, type EventLink, type InAppRoute } from "@/lib/event-links";

// Read/write access to astra-app's "Event" and "ImageAsset" tables in Neon, for
// /admin/eventi. Neon has no RLS tied to Supabase users: every caller must have
// checked the operator's permission before reaching this module.
//
// Storage follows the app exactly so a row written here renders in the mobile
// app: images are bytes in "ImageAsset", referenced from "coverImageKey" as
// "/api/media/<id>", which astra-app serves. A pasted absolute URL is also
// accepted, as in the app's dashboard. Prisma DateTime columns are
// `timestamp without time zone` holding UTC.


export type AdminEvent = {
  id: string;
  title: string;
  description: string | null;
  coverImageKey: string | null;
  location: string | null;
  startsAt: string; // ISO UTC
  endsAt: string | null;
  externalTicketUrl: string | null;
  published: boolean;
  links: EventLink[];
  hasAppDiscount: boolean;
};

export type EventWrite = Omit<AdminEvent, "id" | "hasAppDiscount">;

function db() {
  const url = process.env.NEON_DATABASE_URL;
  if (!url) throw new Error("NEON_DATABASE_URL is not set");
  return neon(url);
}

// Same shape as Prisma's cuid(): a lowercase "c", then base36. Prisma only
// stores the string, it never parses it.
export function cuid() {
  const time = Date.now().toString(36);
  const rand = Array.from(randomBytes(16), (b) => (b % 36).toString(36)).join("");
  return ("c" + time + rand).slice(0, 25);
}

// Links come out of a JSON column, so they are parsed, not cast. A bad row
// yields fewer links instead of a broken page.
export function parseLinks(value: unknown): EventLink[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((l): EventLink[] => {
    if (!l || typeof l !== "object") return [];
    const { kind, label, value: v } = l as Record<string, unknown>;
    if (typeof label !== "string" || typeof v !== "string") return [];
    if (kind === "external") return [{ kind, label, value: v }];
    if (kind === "internal" && (IN_APP_ROUTES as readonly string[]).includes(v))
      return [{ kind, label, value: v as InAppRoute }];
    return [];
  });
}

type Row = {
  id: string;
  title: string;
  description: string | null;
  coverImageKey: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  externalTicketUrl: string | null;
  published: boolean;
  links: unknown;
  appDiscountPercent: number | null;
};

const toEvent = (r: Row): AdminEvent => ({
  id: r.id,
  title: r.title,
  description: r.description,
  coverImageKey: r.coverImageKey,
  location: r.location,
  startsAt: r.starts_at,
  endsAt: r.ends_at,
  externalTicketUrl: r.externalTicketUrl,
  published: r.published,
  links: parseLinks(r.links),
  hasAppDiscount: Boolean(r.appDiscountPercent),
});

export async function listEvents(): Promise<AdminEvent[]> {
  const rows = (await db()`
    select id, title, description, "coverImageKey", location, published, links,
           "externalTicketUrl", "appDiscountPercent",
           to_char("startsAt", 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as starts_at,
           to_char("endsAt", 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as ends_at
    from "Event" where "deletedAt" is null order by "startsAt" asc
  `) as Row[];
  return rows.map(toEvent);
}

export async function getEvent(id: string): Promise<AdminEvent | null> {
  const rows = (await db()`
    select id, title, description, "coverImageKey", location, published, links,
           "externalTicketUrl", "appDiscountPercent",
           to_char("startsAt", 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as starts_at,
           to_char("endsAt", 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as ends_at
    from "Event" where id = ${id} and "deletedAt" is null
  `) as Row[];
  return rows[0] ? toEvent(rows[0]) : null;
}

// ISO with a Z -> naive UTC text for a timestamp without time zone column.
const naive = (iso: string | null) => (iso ? iso.replace("Z", "").replace("T", " ") : null);

export async function insertEvent(e: EventWrite): Promise<string> {
  const id = cuid();
  await db()`
    insert into "Event" (id, title, description, "coverImageKey", location, "startsAt", "endsAt",
                         "externalTicketUrl", published, links, "updatedAt")
    values (${id}, ${e.title}, ${e.description}, ${e.coverImageKey}, ${e.location},
            ${naive(e.startsAt)}::timestamp, ${naive(e.endsAt)}::timestamp,
            ${e.externalTicketUrl}, ${e.published}, ${JSON.stringify(e.links)}::jsonb,
            now() at time zone 'UTC')
  `;
  return id;
}

// Only the columns the site edits. Coordinates, the Eventbrite discount and the
// legacy columns belong to the app and are left exactly as they are.
export async function updateEvent(id: string, e: EventWrite): Promise<boolean> {
  const rows = await db()`
    update "Event" set
      title = ${e.title}, description = ${e.description}, "coverImageKey" = ${e.coverImageKey},
      location = ${e.location}, "startsAt" = ${naive(e.startsAt)}::timestamp,
      "endsAt" = ${naive(e.endsAt)}::timestamp, "externalTicketUrl" = ${e.externalTicketUrl},
      published = ${e.published}, links = ${JSON.stringify(e.links)}::jsonb,
      "updatedAt" = now() at time zone 'UTC'
    where id = ${id} and "deletedAt" is null
    returning id
  `;
  return rows.length > 0;
}

export async function setEventPublished(id: string, published: boolean): Promise<string | null> {
  const rows = (await db()`
    update "Event" set published = ${published}, "updatedAt" = now() at time zone 'UTC'
    where id = ${id} and "deletedAt" is null returning title
  `) as { title: string }[];
  return rows[0]?.title ?? null;
}

// Soft delete, as the app does: the row stays for tickets and RSVPs that point at it.
export async function softDeleteEvent(id: string): Promise<string | null> {
  const rows = (await db()`
    update "Event" set "deletedAt" = now() at time zone 'UTC', published = false,
                       "updatedAt" = now() at time zone 'UTC'
    where id = ${id} and "deletedAt" is null returning title
  `) as { title: string }[];
  return rows[0]?.title ?? null;
}

export async function insertImageAsset(bytes: Uint8Array, mimeType: string): Promise<string> {
  const id = cuid();
  await db()`
    insert into "ImageAsset" (id, "mimeType", data, "byteSize")
    values (${id}, ${mimeType}, ${"\\x" + Buffer.from(bytes).toString("hex")}::bytea, ${bytes.length})
  `;
  return id;
}

// Mirrors the app's own audit trail, so its Audit log page also shows changes
// made from the site. actorId is a Neon user id; site operators are not Neon
// users, so it stays null and the operator is named in metadata.
export async function writeAppAudit(
  action: "create" | "update" | "delete" | "publish" | "unpublish",
  eventId: string,
  title: string,
  by: string,
) {
  await db()`
    insert into "AuditLog" (id, action, "targetType", "targetId", metadata)
    values (${cuid()}, ${action}, 'Event', ${eventId},
            ${JSON.stringify({ title, by, source: "astrabocconi.it" })}::jsonb)
  `;
}
