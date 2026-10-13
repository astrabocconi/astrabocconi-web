import "server-only";
import { AwsClient } from "aws4fetch";
import { publicUrl, type StorageBucket } from "@/lib/r2-public";
import { getOperator } from "@/lib/auth/operator";

const client = new AwsClient({
  accessKeyId: process.env.R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  service: "s3",
  region: "auto",
});
const ENDPOINT = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET}`;

// Replaces the old storage.objects RLS policies: who may write to which prefix.
const WRITE_PERMISSIONS: Record<StorageBucket, string[]> = {
  "dispense-uploads": ["dispense:write"],
  stella_polare: ["stella_polare:write"],
  guides: ["guides:write"],
  images: ["site:write", "representatives:write"],
};

export function isBucket(b: unknown): b is StorageBucket {
  return typeof b === "string" && b in WRITE_PERMISSIONS;
}

export function safePath(path: unknown): path is string {
  return typeof path === "string" && /^[\w\-./]+$/.test(path) && !path.includes("..") && path.length < 200;
}

async function canWrite(bucket: StorageBucket) {
  const op = await getOperator();
  return !!op && WRITE_PERMISSIONS[bucket].some((p) => op.can(p));
}

const objectUrl = (bucket: StorageBucket, path: string) => `${ENDPOINT}/${bucket}/${path}`;

/** Presigned PUT for browser uploads, or null if the operator may not write to `bucket`. */
export async function presignUpload(bucket: StorageBucket, path: string, contentType: string) {
  if (!(await canWrite(bucket))) return null;
  const signed = await client.sign(`${objectUrl(bucket, path)}?X-Amz-Expires=300`, {
    method: "PUT",
    headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=31536000" },
    aws: { signQuery: true },
  });
  return signed.url;
}

/** Server-side upload, for small files that already pass through a server action. */
export async function putObject(bucket: StorageBucket, path: string, file: File) {
  if (!(await canWrite(bucket))) throw new Error("Non hai il permesso di caricare file");
  const res = await client.fetch(objectUrl(bucket, path), {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000",
    },
    body: await file.arrayBuffer(),
  });
  if (!res.ok) throw new Error("Caricamento non riuscito");
  return publicUrl(bucket, path);
}

/** Best effort, like the Supabase remove() it replaces. */
export async function deleteObjects(bucket: StorageBucket, paths: string[]) {
  await Promise.all(
    paths.map((p) => client.fetch(objectUrl(bucket, p), { method: "DELETE" }).catch(() => null)),
  );
}
