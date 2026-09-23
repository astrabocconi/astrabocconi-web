"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/admin/ui/button";
import { Card } from "@/components/admin/ui/card";
import { Field, Input, Select, Textarea, Toggle } from "@/components/admin/ui/field";
import { NoticeStrip } from "@/components/home/notice-strip";
import { parseButtons, type NoticeButton, type NoticeTone } from "@/lib/site-content";
import { ButtonsEditor } from "../buttons-editor";
import { saveNotice } from "../actions";

export type NoticeFormValue = {
  id?: string;
  title: string;
  body: string;
  tone: NoticeTone;
  buttons: NoticeButton[];
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};

export function NoticeForm({ initial }: { initial: NoticeFormValue }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  function set<K extends keyof NoticeFormValue>(key: K, value: NoticeFormValue[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    start(async () => {
      const res = await saveNotice(form);
      if (!res.ok) {
        setMessage({ ok: false, text: res.error });
        return;
      }
      setMessage({ ok: true, text: "Salvato" });
      if (!form.id) router.replace(`/admin/avvisi/${res.data}`);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <p className="mb-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">Anteprima</p>
        {/* The public component, so what you see is what the home page shows.
            Half-typed buttons are dropped the same way the site would drop them. */}
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white pb-6">
          <NoticeStrip
            notices={[
              {
                id: "preview",
                title: form.title || "Titolo dell'avviso",
                body: form.body || null,
                tone: form.tone,
                buttons: parseButtons(form.buttons),
              },
            ]}
          />
        </div>
      </section>

      <form onSubmit={submit}>
        <Card className="flex flex-col gap-5">
          <Field label="Titolo" required>
            <Input value={form.title} maxLength={120} onChange={(e) => set("title", e.target.value)} required />
          </Field>

          <Field label="Testo" hint="Facoltativo, massimo 500 caratteri.">
            <Textarea value={form.body} maxLength={500} onChange={(e) => set("body", e.target.value)} />
          </Field>

          <Field label="Tono">
            <Select value={form.tone} onChange={(e) => set("tone", e.target.value as NoticeTone)}>
              <option value="info">Informativo (azzurro chiaro)</option>
              <option value="important">Importante (blu ASTRA)</option>
              <option value="urgent">Urgente (oro)</option>
            </Select>
          </Field>

          <ButtonsEditor value={form.buttons} onChange={(b) => set("buttons", b)} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Visibile dal" hint="Ora di Milano. Vuoto: da subito.">
              <Input type="datetime-local" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
            </Field>
            <Field label="Visibile fino al" hint="Ora di Milano. Vuoto: finché non lo disattivi.">
              <Input type="datetime-local" value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
            </Field>
          </div>

          <Toggle
            label="Attivo"
            hint="Spento, l'avviso resta salvato ma non compare sul sito."
            checked={form.isActive}
            onChange={(v) => set("isActive", v)}
          />

          <div className="flex items-center gap-3 border-t border-gray-100 pt-5">
            <Button type="submit" disabled={pending}>
              {pending ? "Salvataggio…" : form.id ? "Salva modifiche" : "Crea avviso"}
            </Button>
            {message && (
              <p className={`text-sm ${message.ok ? "text-astra-primary" : "text-red-600"}`}>{message.text}</p>
            )}
            <p className="ml-auto text-xs text-gray-400">La home si aggiorna al salvataggio; gli orari programmati scattano entro 5 minuti.</p>
          </div>
        </Card>
      </form>
    </div>
  );
}
