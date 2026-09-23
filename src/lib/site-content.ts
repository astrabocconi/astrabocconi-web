import { createPublicClient } from "@/lib/supabase/public";

// Shapes of the editable home page blocks. The jsonb columns are written by
// the backoffice, but they are still parsed defensively on read so a bad row
// hides one button rather than crashing the home page.

export type NoticeTone = "info" | "important" | "urgent";
export type NoticeButton = { label: string; url: string; style: "primary" | "secondary" };

export type Notice = {
  id: string;
  title: string;
  body: string | null;
  tone: NoticeTone;
  buttons: NoticeButton[];
};

export type ConferenceData = {
  eyebrow?: string;
  title: string;
  dates?: string;
  location?: string;
  description?: string;
  imageUrl?: string;
  buttons: NoticeButton[];
};

export const MAX_BUTTONS = 3;

export function isSafeUrl(url: string) {
  return /^https?:\/\//i.test(url) || (url.startsWith("/") && !url.startsWith("//"));
}

export function isExternal(url: string) {
  return /^https?:\/\//i.test(url);
}

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

export function parseButtons(value: unknown): NoticeButton[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((b) => {
      const label = str(b?.label);
      const url = str(b?.url);
      if (!label || !url || !isSafeUrl(url)) return null;
      return { label, url, style: b?.style === "secondary" ? "secondary" : "primary" } as NoticeButton;
    })
    .filter((b): b is NoticeButton => b !== null)
    .slice(0, MAX_BUTTONS);
}

// Strict on the way in, unlike parseButtons on the way out: an editor should
// hear that a link is wrong rather than watch the button silently vanish.
export function validateButtons(
  buttons: NoticeButton[],
): { ok: true; data: NoticeButton[] } | { ok: false; error: string } {
  if (!Array.isArray(buttons) || buttons.length > MAX_BUTTONS)
    return { ok: false, error: `Massimo ${MAX_BUTTONS} pulsanti` };
  const out: NoticeButton[] = [];
  for (const b of buttons) {
    const label = String(b?.label ?? "").trim();
    const url = String(b?.url ?? "").trim();
    if (!label) return { ok: false, error: "Ogni pulsante deve avere un testo" };
    if (label.length > 40) return { ok: false, error: "Testo del pulsante troppo lungo (max 40)" };
    if (!isSafeUrl(url))
      return { ok: false, error: `Link non valido per "${label}": usa https://... oppure /percorso` };
    out.push({ label, url, style: b.style === "secondary" ? "secondary" : "primary" });
  }
  return { ok: true, data: out };
}

export function parseTone(value: unknown): NoticeTone {
  return value === "important" || value === "urgent" ? value : "info";
}

export function parseConference(value: unknown): ConferenceData | null {
  if (!value || typeof value !== "object") return null;
  const d = value as Record<string, unknown>;
  const title = str(d.title);
  if (!title) return null;
  const imageUrl = str(d.imageUrl);
  return {
    eyebrow: str(d.eyebrow),
    title,
    dates: str(d.dates),
    location: str(d.location),
    description: str(d.description),
    imageUrl: imageUrl && isSafeUrl(imageUrl) ? imageUrl : undefined,
    buttons: parseButtons(d.buttons),
  };
}

// <input type="datetime-local"> values are wall clock time in Milan, whatever
// time zone the editor's laptop or the server happens to be in.
const ROME = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Rome",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function isoToRomeLocal(iso: string | null): string {
  if (!iso) return "";
  return ROME.format(new Date(iso)).replace(" ", "T");
}

export function romeLocalToIso(local: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!m) return null;
  const asUtc = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  // Rome's offset at that instant, found by formatting the guess back in Rome.
  const offset = Date.parse(isoToRomeLocal(new Date(asUtc).toISOString()) + ":00Z") - asUtc;
  return new Date(asUtc - offset).toISOString();
}

// RLS already drops inactive and out of window notices for anon.
export async function getLiveNotices(): Promise<Notice[]> {
  try {
    const { data, error } = await createPublicClient()
      .from("notices")
      .select("id, title, body, tone, buttons")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      tone: parseTone(n.tone),
      buttons: parseButtons(n.buttons),
    }));
  } catch (e) {
    console.error("notices unavailable:", e instanceof Error ? e.message : e);
    return [];
  }
}

export async function getConference(): Promise<ConferenceData | null> {
  try {
    const { data, error } = await createPublicClient()
      .from("site_sections")
      .select("data")
      .eq("key", "conference")
      .maybeSingle();
    if (error) throw error;
    return parseConference(data?.data);
  } catch (e) {
    console.error("conference unavailable:", e instanceof Error ? e.message : e);
    return null;
  }
}
