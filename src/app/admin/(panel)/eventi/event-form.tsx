"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/admin/ui/button";
import { Card } from "@/components/admin/ui/card";
import { Field, Input, Textarea, Toggle } from "@/components/admin/ui/field";
import { ImageInput } from "@/components/admin/image-input";
import { LinksEditor } from "./links-editor";
import { deleteEvent, saveEvent, type EventFormInput } from "./actions";

export function EventForm({
  initial,
  appUrl,
  canDelete,
  hasAppDiscount,
}: {
  initial: EventFormInput;
  appUrl: string;
  canDelete: boolean;
  hasAppDiscount: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function set<K extends keyof EventFormInput>(key: K, value: EventFormInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function save() {
    setError(null);
    start(async () => {
      const res = await saveEvent(form);
      if (!res.ok) return setError(res.error);
      router.push("/admin/eventi");
      router.refresh();
    });
  }

  function remove() {
    if (!form.id || !confirm("Eliminare questo evento? Sparisce dal sito e dall'app.")) return;
    start(async () => {
      const res = await deleteEvent(form.id!);
      if (!res.ok) return setError(res.error);
      router.push("/admin/eventi");
      router.refresh();
    });
  }

  return (
    <Card className="flex flex-col gap-5">
      <Field label="Titolo" required>
        <Input value={form.title} maxLength={200} onChange={(e) => set("title", e.target.value)} placeholder="es. Open Wine" />
      </Field>
      <Field label="Descrizione">
        <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Di cosa si tratta?" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Inizio" required hint="Ora di Milano.">
          <Input type="datetime-local" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
        </Field>
        <Field label="Fine" hint="Facoltativa. Senza, l'evento resta visibile fino a fine giornata.">
          <Input type="datetime-local" value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
        </Field>
      </div>
      <Field label="Luogo">
        <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="es. Aula Magna, Via Röntgen" />
      </Field>
      <Field label="Link ai biglietti" hint="Dove si comprano i biglietti. Sul sito diventa il pulsante dell'evento.">
        <Input
          value={form.externalTicketUrl}
          onChange={(e) => set("externalTicketUrl", e.target.value)}
          placeholder="https://www.eventbrite.it/e/..."
        />
      </Field>
      <Field label="Copertina">
        <ImageInput
          value={form.imageUrl}
          onChange={(v) => set("imageUrl", v)}
          appUrl={appUrl}
          hint="Consigliata 1200 × 675 px (16:9). Viene salvata nell'archivio immagini dell'app, quindi compare sia sul sito sia nell'app."
        />
      </Field>
      <Toggle
        label="Pubblicato"
        hint="Visibile sulla home del sito e nell'app"
        checked={form.published}
        onChange={(v) => set("published", v)}
      />

      <LinksEditor value={form.links} onChange={(v) => set("links", v)} />

      {hasAppDiscount && (
        <p className="rounded-xl bg-astra-light px-4 py-2.5 text-xs text-astra-primary">
          Questo evento ha uno sconto Eventbrite per chi compra dall&apos;app. Si gestisce dal dashboard
          dell&apos;app; salvare qui non lo tocca.
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between border-t border-gray-100 pt-5">
        {form.id && canDelete ? (
          <button type="button" onClick={remove} disabled={pending} className="text-sm font-medium text-red-600 hover:text-red-700">
            Elimina
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push("/admin/eventi")} disabled={pending}>
            Annulla
          </Button>
          <Button onClick={save} disabled={pending || !form.title.trim() || !form.startsAt}>
            {pending ? "Salvataggio…" : form.id ? "Salva modifiche" : form.published ? "Pubblica" : "Salva bozza"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
