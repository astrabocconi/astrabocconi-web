"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Card } from "@/components/admin/ui/card";
import { Input, Toggle } from "@/components/admin/ui/field";
import { BrandScroller, type BrandItem } from "@/components/ui/brand-scoller";
import { uploadFile } from "@/lib/r2-public";
import { MAX_PARTNER_BRANDS } from "@/lib/site-content";
import { IconButton } from "../avvisi/buttons-editor";
import { savePartnerBar } from "./actions";

export function PartnerBarForm({ initial, initialVisible }: { initial: BrandItem[]; initialVisible: boolean }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [visible, setVisible] = useState(initialVisible);
  const [uploading, setUploading] = useState<number | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  function update(i: number, patch: Partial<BrandItem>) {
    setItems((list) => list.map((b, j) => (j === i ? { ...b, ...patch } : b)));
  }

  function move(i: number, j: number) {
    setItems((list) => {
      const next = [...list];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function upload(i: number, file: File) {
    if (!file.type.startsWith("image/")) return setMessage({ ok: false, text: "Il file deve essere un'immagine" });
    if (file.size > 2 * 1024 * 1024) return setMessage({ ok: false, text: "Massimo 2 MB" });
    setUploading(i);
    setMessage(null);
    const ext = (file.name.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
    try {
      update(i, { logo: await uploadFile("images", `site/partner-${crypto.randomUUID()}.${ext}`, file, file.type) });
    } catch (e) {
      setMessage({ ok: false, text: (e as Error).message });
    } finally {
      setUploading(null);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    start(async () => {
      const res = await savePartnerBar(items, visible);
      if (!res.ok) return setMessage({ ok: false, text: res.error });
      setMessage({ ok: true, text: visible ? "Salvato e visibile sulla home" : "Salvato, fascia nascosta" });
      router.refresh();
    });
  }

  const preview = items.filter((b) => b.name.trim());

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <Card className="flex flex-col gap-5">
        <Toggle label="Visibile sulla home" checked={visible} onChange={setVisible} />

        <div className="flex flex-col gap-2">
          {items.length === 0 && (
            <p className="rounded-xl border border-dashed border-gray-200 px-4 py-3 text-xs text-gray-400">
              Nessun partner. Aggiungine uno.
            </p>
          )}
          {items.map((b, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
              <label
                title="Carica logo"
                className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 text-gray-400 hover:border-astra-accent hover:text-astra-primary"
              >
                {b.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.logo} alt="" className="h-full w-full object-contain" />
                ) : (
                  <ImagePlus className="h-5 w-5" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading !== null}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) upload(i, file);
                    e.target.value = "";
                  }}
                />
              </label>
              <Input
                value={b.name}
                placeholder="Nome del partner"
                maxLength={40}
                onChange={(e) => update(i, { name: e.target.value })}
                className="min-w-0 flex-1"
              />
              {uploading === i && <span className="text-xs text-gray-400">Caricamento…</span>}
              <div className="flex shrink-0 items-center gap-1">
                <IconButton label="Sposta su" disabled={i === 0} onClick={() => move(i, i - 1)}>
                  <ArrowUp className="h-4 w-4" />
                </IconButton>
                <IconButton label="Sposta giù" disabled={i === items.length - 1} onClick={() => move(i, i + 1)}>
                  <ArrowDown className="h-4 w-4" />
                </IconButton>
                <IconButton label="Rimuovi" onClick={() => setItems((list) => list.filter((_, j) => j !== i))}>
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
          ))}
          {items.length < MAX_PARTNER_BRANDS && (
            <Button variant="secondary" className="self-start" onClick={() => setItems([...items, { name: "" }])}>
              <Plus className="h-4 w-4" />
              Aggiungi partner
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-gray-100 pt-5">
          <Button type="submit" disabled={pending || uploading !== null}>
            {pending ? "Salvataggio…" : "Salva"}
          </Button>
          {message && (
            <p className={`text-sm ${message.ok ? "text-astra-primary" : "text-red-600"}`}>{message.text}</p>
          )}
        </div>
      </Card>

      {preview.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-gray-400 uppercase">Anteprima</p>
          <div className={`overflow-hidden rounded-2xl bg-astra-primary py-6 text-white ${visible ? "" : "opacity-50"}`}>
            <BrandScroller items={preview} />
          </div>
        </div>
      )}
    </form>
  );
}
