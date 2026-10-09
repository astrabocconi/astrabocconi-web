"use client";

import { useRef, useState } from "react";
import { ImageIcon } from "lucide-react";

const MAX_SIDE = 1600;

// Same job as astra-app's server side sharp pass, done in the browser: the app
// serves stored bytes as they are, so a 4 MB phone photo would be downloaded in
// full by every client. GIFs pass through untouched to keep their animation.
async function shrink(file: File): Promise<Blob> {
  if (file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.82));
  if (!blob) throw new Error("Immagine non leggibile");
  return blob;
}

// Uploads into astra-app's image store and reports back "/api/media/<id>", or
// takes a pasted absolute URL. `appUrl` resolves stored relative paths for the
// preview, since they are served by the app, not by this site.
export function ImageInput({
  value,
  onChange,
  appUrl,
  hint,
}: {
  value: string;
  onChange: (v: string) => void;
  appUrl: string;
  hint?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const preview = value ? (value.startsWith("/") ? appUrl + value : value) : "";

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", await shrink(file), "cover");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Caricamento non riuscito");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Caricamento non riuscito");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex aspect-video w-48 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-gray-300" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
              e.target.value = "";
            }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              {uploading ? "Caricamento…" : value ? "Sostituisci" : "Carica immagine"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Rimuovi
              </button>
            )}
          </div>
          <input
            type="url"
            value={value.startsWith("/") ? "" : value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…oppure incolla l'URL di un'immagine"
            className="w-full max-w-sm rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-astra-accent"
          />
        </div>
      </div>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
