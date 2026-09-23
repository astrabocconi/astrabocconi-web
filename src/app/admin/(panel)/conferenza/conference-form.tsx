"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Card } from "@/components/admin/ui/card";
import { Field, Input, Textarea, Toggle } from "@/components/admin/ui/field";
import { ConferenceCard } from "@/components/home/events-section";
import { createClient } from "@/lib/supabase/client";
import { parseConference, type ConferenceData } from "@/lib/site-content";
import { ButtonsEditor } from "../avvisi/buttons-editor";
import { saveConference } from "./actions";

type Form = Required<Omit<ConferenceData, "buttons">> & Pick<ConferenceData, "buttons">;

export function ConferenceForm({ initial, initialVisible }: { initial: Form; initialVisible: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [visible, setVisible] = useState(initialVisible);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const preview = parseConference({ ...form, title: form.title || "Titolo della conferenza" });

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) return setMessage({ ok: false, text: "Il file deve essere un'immagine" });
    if (file.size > 5 * 1024 * 1024) return setMessage({ ok: false, text: "Massimo 5 MB" });
    setUploading(true);
    setMessage(null);
    const supabase = createClient();
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `site/conferenza-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("images")
      .upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
    setUploading(false);
    if (error) return setMessage({ ok: false, text: error.message });
    set("imageUrl", supabase.storage.from("images").getPublicUrl(path).data.publicUrl);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    start(async () => {
      const res = await saveConference(form, visible);
      if (!res.ok) return setMessage({ ok: false, text: res.error });
      setMessage({ ok: true, text: visible ? "Salvato e visibile sulla home" : "Salvato, sezione nascosta" });
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <form onSubmit={submit}>
        <Card className="flex flex-col gap-5">
          <Toggle
            label="Visibile sulla home"
            hint="Spenta, la scheda sparisce e gli eventi prendono tutta la larghezza."
            checked={visible}
            onChange={setVisible}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Occhiello" hint="Es. ASTRA Conference 2026">
              <Input value={form.eyebrow} maxLength={40} onChange={(e) => set("eyebrow", e.target.value)} />
            </Field>
            <Field label="Titolo" required>
              <Input value={form.title} maxLength={120} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Date" hint="Testo libero, es. 14-15 novembre 2026">
              <Input value={form.dates} maxLength={80} onChange={(e) => set("dates", e.target.value)} />
            </Field>
            <Field label="Luogo">
              <Input value={form.location} maxLength={120} onChange={(e) => set("location", e.target.value)} />
            </Field>
          </div>

          <Field label="Descrizione">
            <Textarea
              value={form.description}
              maxLength={1200}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-gray-700">Immagine</span>
            {form.imageUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imageUrl} alt="" className="aspect-16/9 w-full rounded-xl border border-gray-200 object-cover" />
                <button
                  type="button"
                  onClick={() => set("imageUrl", "")}
                  className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 shadow-sm hover:text-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                  Rimuovi
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-8 text-sm text-gray-500 hover:border-astra-accent hover:text-astra-primary">
                <ImagePlus className="h-6 w-6" />
                {uploading ? "Caricamento…" : "Carica un'immagine (max 5 MB)"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) upload(file);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>

          <ButtonsEditor value={form.buttons} onChange={(b) => set("buttons", b)} />

          <div className="flex items-center gap-3 border-t border-gray-100 pt-5">
            <Button type="submit" disabled={pending || uploading}>
              {pending ? "Salvataggio…" : "Salva"}
            </Button>
            {message && (
              <p className={`text-sm ${message.ok ? "text-astra-primary" : "text-red-600"}`}>{message.text}</p>
            )}
          </div>
        </Card>
      </form>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <p className="mb-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">Anteprima</p>
        <div className={visible ? "" : "opacity-50"}>{preview && <ConferenceCard conference={preview} />}</div>
        {!visible && <p className="mt-2 text-xs text-gray-400">Nascosta: non compare sulla home.</p>}
      </aside>
    </div>
  );
}
