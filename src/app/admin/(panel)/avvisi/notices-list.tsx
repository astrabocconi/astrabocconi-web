"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronRight, Trash2 } from "lucide-react";
import { Badge } from "@/components/admin/ui/badge";
import { deleteNotice, moveNotice, setNoticeActive } from "./actions";

export type NoticeStatus = "live" | "scheduled" | "expired" | "off";

export type NoticeRow = {
  id: string;
  title: string;
  tone: string;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  status: NoticeStatus;
};

const STATUS: Record<NoticeStatus, { label: string; cls: string }> = {
  live: { label: "Attivo", cls: "bg-astra-light text-astra-primary" },
  scheduled: { label: "Programmato", cls: "bg-astra-gold/20 text-astra-dark" },
  expired: { label: "Scaduto", cls: "bg-gray-100 text-gray-500" },
  off: { label: "Disattivato", cls: "bg-gray-100 text-gray-500" },
};

const TONE_LABEL: Record<string, string> = { info: "Informativo", important: "Importante", urgent: "Urgente" };

const fmt = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Rome",
});

function windowLabel(r: NoticeRow) {
  if (r.startsAt && r.endsAt) return `${fmt.format(new Date(r.startsAt))} - ${fmt.format(new Date(r.endsAt))}`;
  if (r.startsAt) return `dal ${fmt.format(new Date(r.startsAt))}`;
  if (r.endsAt) return `fino al ${fmt.format(new Date(r.endsAt))}`;
  return "sempre";
}

export function NoticesList({ rows, canDelete }: { rows: NoticeRow[]; canDelete: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    start(async () => {
      const res = await action();
      if (!res.ok) setError(res.error ?? "Operazione non riuscita");
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}

      {rows.map((r, i) => {
        const s = STATUS[r.status];
        return (
          <div
            key={r.id}
            className={`flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 pl-4 shadow-sm ${
              pending ? "opacity-70" : ""
            }`}
          >
            <div className="flex flex-col">
              <button
                type="button"
                aria-label="Sposta su"
                disabled={pending || i === 0}
                onClick={() => run(() => moveNotice(r.id, "up"))}
                className="rounded p-0.5 text-gray-400 hover:text-gray-900 disabled:opacity-25"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Sposta giù"
                disabled={pending || i === rows.length - 1}
                onClick={() => run(() => moveNotice(r.id, "down"))}
                className="rounded p-0.5 text-gray-400 hover:text-gray-900 disabled:opacity-25"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>

            <Link href={`/admin/avvisi/${r.id}`} className="group flex min-w-0 flex-1 items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900">{r.title}</p>
                <p className="mt-0.5 truncate text-sm text-gray-500">
                  {TONE_LABEL[r.tone] ?? r.tone} · {windowLabel(r)}
                </p>
              </div>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${s.cls}`}>
                {s.label}
              </span>
              <ChevronRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-astra-accent" />
            </Link>

            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => setNoticeActive(r.id, !r.isActive))}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            >
              {r.isActive ? "Disattiva" : "Attiva"}
            </button>

            {canDelete && (
              <button
                type="button"
                aria-label="Elimina"
                disabled={pending}
                onClick={() => {
                  if (confirm(`Eliminare "${r.title}"?`)) run(() => deleteNotice(r.id));
                }}
                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      })}

      <p className="mt-2 text-xs text-gray-400">
        L&apos;ordine qui è l&apos;ordine sulla home. <Badge tone="neutral">Scaduto</Badge> e{" "}
        <Badge tone="neutral">Programmato</Badge> non si vedono sul sito.
      </p>
    </div>
  );
}
