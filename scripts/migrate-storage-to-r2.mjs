// One-off: copy every Supabase Storage object to R2, then rewrite the stored
// public URLs in all tables. Dry run by default.
//
//   node scripts/migrate-storage-to-r2.mjs          (report only)
//   node scripts/migrate-storage-to-r2.mjs --apply
//
// Old Supabase files are never deleted, so the mobile app keeps working until
// it is updated. Re-running is safe: existing R2 objects are skipped.

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { AwsClient } from "aws4fetch";

const APPLY = process.argv.includes("--apply");
const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_0-9]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);

const SB = env.NEXT_PUBLIC_SUPABASE_URL;
const OLD = `${SB}/storage/v1/object/public/`;
const NEW = `${env.NEXT_PUBLIC_R2_PUBLIC_URL}/`;
const sb = createClient(SB, env.SUPABASE_SECRET_KEY);
const r2 = new AwsClient({
  accessKeyId: env.R2_ACCESS_KEY_ID,
  secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  service: "s3",
  region: "auto",
});
const R2_BASE = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET}`;

async function* walk(bucket, prefix = "") {
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await sb.storage.from(bucket).list(prefix, { limit: 100, offset });
    if (error) throw error;
    for (const e of data) {
      const path = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.id === null) yield* walk(bucket, path);
      else yield path;
    }
    if (data.length < 100) return;
  }
}

// ---- 1. objects
let copied = 0, skipped = 0, failed = 0;
const { data: buckets, error: bErr } = await sb.storage.listBuckets();
if (bErr) throw bErr;
for (const { name: bucket } of buckets) {
  for await (const path of walk(bucket)) {
    const target = `${R2_BASE}/${bucket}/${path.split("/").map(encodeURIComponent).join("/")}`;
    if ((await r2.fetch(target, { method: "HEAD" })).ok) { skipped++; continue; }
    if (!APPLY) { copied++; continue; }
    const src = await fetch(`${OLD}${bucket}/${path.split("/").map(encodeURIComponent).join("/")}`);
    if (!src.ok) { console.error("download failed", bucket, path, src.status); failed++; continue; }
    const put = await r2.fetch(target, {
      method: "PUT",
      headers: {
        "Content-Type": src.headers.get("content-type") ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000",
      },
      body: await src.arrayBuffer(),
    });
    if (put.ok) copied++; else { console.error("upload failed", bucket, path, put.status); failed++; }
  }
}
console.log(`objects: ${APPLY ? "copied" : "to copy"} ${copied}, already in R2 ${skipped}, failed ${failed}`);

// ---- 2. URLs in rows
const swap = (v) =>
  typeof v === "string" ? v.split(OLD).join(NEW)
  : Array.isArray(v) ? v.map(swap)
  : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, swap(x)]))
  : v;

const spec = await (await fetch(`${SB}/rest/v1/`, { headers: { apikey: env.SUPABASE_SECRET_KEY } })).json();
for (const table of Object.keys(spec.paths).map((p) => p.slice(1)).filter((t) => t && !t.startsWith("rpc/") && t !== "Document")) {
  let changed = 0;
  for (let from = 0; ; from += 500) {
    const { data, error } = await sb.from(table).select("*").range(from, from + 499);
    if (error) { console.error(table, error.message); break; }
    for (const row of data) {
      const next = swap(row);
      const patch = Object.fromEntries(Object.keys(row).filter((k) => JSON.stringify(row[k]) !== JSON.stringify(next[k])).map((k) => [k, next[k]]));
      if (!Object.keys(patch).length) continue;
      changed++;
      if (!APPLY) continue;
      if (row.id === undefined) { console.error(`${table}: no id column, skipped a row`); continue; }
      const { error: uErr } = await sb.from(table).update(patch).eq("id", row.id);
      if (uErr) console.error(table, row.id, uErr.message);
    }
    if (data.length < 500) break;
  }
  if (changed) console.log(`${table}: ${APPLY ? "rewrote" : "would rewrite"} ${changed} rows`);
}
console.log(APPLY ? "done" : "dry run, pass --apply to write");
