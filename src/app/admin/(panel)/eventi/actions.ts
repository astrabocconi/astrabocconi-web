"use server";

import { revalidatePath } from "next/cache";
import { getOperator } from "@/lib/auth/operator";
import { logAudit } from "@/lib/admin-audit";
import { romeLocalToIso } from "@/lib/site-content";
import { IN_APP_ROUTES, MAX_LINKS, type EventLink } from "@/lib/event-links";
import {
  insertEvent,
  setEventPublished,
  softDeleteEvent,
  updateEvent,
  writeAppAudit,
  type EventWrite,
} from "@/lib/events-admin";

export type Result<T = void> = { ok: true; data: T } | { ok: false; error: string };

export type EventFormInput = {
  id?: string;
  title: string;
  description: string;
  location: string;
  startsAt: string; // datetime-local, Milan wall clock
  endsAt: string;
  externalTicketUrl: string;
  imageUrl: string;
  published: boolean;
  links: EventLink[];
};

// Neon has no RLS for site operators: this check is the only gate.
async function guard(permission: string) {
  const op = await getOperator();
  if (!op) return null;
  return op.can(permission) ? op : null;
}

const NO_PERMISSION = { ok: false as const, error: "Non hai il permesso per questa modifica" };
const isHttpUrl = (v: string) => /^https?:\/\/\S+$/i.test(v);

function validate(input: EventFormInput): Result<EventWrite> {
  const title = input.title.trim();
  if (!title) return { ok: false, error: "Il titolo è obbligatorio" };
  if (title.length > 200) return { ok: false, error: "Titolo troppo lungo (max 200)" };
  const description = input.description.trim();
  if (description.length > 5000) return { ok: false, error: "Descrizione troppo lunga" };

  const startsAt = input.startsAt ? romeLocalToIso(input.startsAt) : null;
  if (!startsAt) return { ok: false, error: "Data di inizio non valida" };
  const endsAt = input.endsAt ? romeLocalToIso(input.endsAt) : null;
  if (input.endsAt && !endsAt) return { ok: false, error: "Data di fine non valida" };
  if (endsAt && endsAt <= startsAt) return { ok: false, error: "La fine deve essere dopo l'inizio" };

  const ticket = input.externalTicketUrl.trim();
  if (ticket && !isHttpUrl(ticket)) return { ok: false, error: "Il link ai biglietti deve iniziare con https://" };

  // Same rule as the app: an uploaded /api/media/<id> path or an absolute URL.
  const image = input.imageUrl.trim();
  if (image && !/^\/api\/media\/[a-z0-9]+$/.test(image) && !isHttpUrl(image))
    return { ok: false, error: "Immagine non valida" };

  if (input.links.length > MAX_LINKS) return { ok: false, error: `Al massimo ${MAX_LINKS} link` };
  const links: EventLink[] = [];
  for (const [i, l] of input.links.entries()) {
    const label = l.label.trim();
    if (!label || label.length > 60) return { ok: false, error: `Link ${i + 1}: etichetta da 1 a 60 caratteri` };
    if (l.kind === "external") {
      // https only: the app's iOS build blocks http links outright.
      if (!/^https:\/\/\S+$/i.test(l.value.trim()))
        return { ok: false, error: `Link ${i + 1}: l'indirizzo deve iniziare con https://` };
      links.push({ kind: "external", label, value: l.value.trim() });
    } else if (l.kind === "internal" && (IN_APP_ROUTES as readonly string[]).includes(l.value)) {
      links.push({ kind: "internal", label, value: l.value });
    } else {
      return { ok: false, error: `Link ${i + 1}: destinazione non valida` };
    }
  }

  return {
    ok: true,
    data: {
      title,
      description: description || null,
      location: input.location.trim() || null,
      startsAt,
      endsAt,
      externalTicketUrl: ticket || null,
      coverImageKey: image || null,
      published: input.published,
      links,
    },
  };
}

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/eventi");
}

export async function saveEvent(input: EventFormInput): Promise<Result<string>> {
  const op = await guard("events:write");
  if (!op) return NO_PERMISSION;
  const v = validate(input);
  if (!v.ok) return v;

  try {
    if (input.id) {
      if (!(await updateEvent(input.id, v.data))) return { ok: false, error: "Evento non trovato" };
      await writeAppAudit("update", input.id, v.data.title, op.email);
      await logAudit(op, "Event", input.id, "update", v.data.title);
      revalidate();
      return { ok: true, data: input.id };
    }
    const id = await insertEvent(v.data);
    await writeAppAudit("create", id, v.data.title, op.email);
    await logAudit(op, "Event", id, "insert", v.data.title + (v.data.published ? "" : " (bozza)"));
    revalidate();
    return { ok: true, data: id };
  } catch (e) {
    console.error("saveEvent failed:", e);
    return { ok: false, error: "Salvataggio non riuscito" };
  }
}

export async function togglePublished(id: string, published: boolean): Promise<Result> {
  const op = await guard("events:write");
  if (!op) return NO_PERMISSION;
  const title = await setEventPublished(id, published);
  if (!title) return { ok: false, error: "Evento non trovato" };
  await writeAppAudit(published ? "publish" : "unpublish", id, title, op.email);
  await logAudit(op, "Event", id, "update", `${title} (${published ? "pubblicato" : "ritirato"})`);
  revalidate();
  return { ok: true, data: undefined };
}

export async function deleteEvent(id: string): Promise<Result> {
  const op = await guard("events:delete");
  if (!op) return NO_PERMISSION;
  const title = await softDeleteEvent(id);
  if (!title) return { ok: false, error: "Evento non trovato" };
  await writeAppAudit("delete", id, title, op.email);
  await logAudit(op, "Event", id, "delete", title);
  revalidate();
  return { ok: true, data: undefined };
}
