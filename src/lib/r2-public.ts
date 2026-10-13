// Client-safe half of the R2 storage layer. One R2 bucket holds everything; the
// old Supabase bucket names are kept as the first path segment.
export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;

export type StorageBucket = "images" | "guides" | "stella_polare" | "dispense-uploads";

export function publicUrl(bucket: StorageBucket, path: string) {
  return `${R2_PUBLIC_URL}/${bucket}/${path}`;
}

/** Browser upload: asks /api/upload for a presigned PUT URL, then sends the file straight to R2. */
export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: Blob,
  contentType: string,
): Promise<string> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bucket, path, contentType }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? "Caricamento non autorizzato");
  const put = await fetch(body.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=31536000" },
    body: file,
  });
  if (!put.ok) throw new Error("Caricamento non riuscito");
  return publicUrl(bucket, path);
}
