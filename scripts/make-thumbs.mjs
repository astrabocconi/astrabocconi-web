// Pre-render the first page of every handout PDF into a small JPEG and upload
// it to Supabase Storage. Done once, ahead of time, so the site serves plain
// images instead of rasterising PDFs in the browser.

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const run = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Needs poppler on PATH for pdftoppm: `brew install poppler`.
const env = readFileSync(join(ROOT, ".env.local"), "utf8");
const val = (k) =>
  env.split("\n").find((l) => l.startsWith(`${k}=`))?.slice(k.length + 1).replace(/^"|"$/g, "");

const SUPABASE_URL = val("NEXT_PUBLIC_SUPABASE_URL");
const supabase = createClient(SUPABASE_URL, val("SUPABASE_SECRET_KEY"), {
  auth: { persistSession: false },
});

const BUCKET = "dispense-uploads";
const TMP = "/tmp/astra-thumbs";
const APPLY = process.argv.includes("--apply");
const CONCURRENCY = 5;

mkdirSync(TMP, { recursive: true });

async function listSources() {
  const out = [];
  const [h, c, m] = await Promise.all([
    supabase.from("handouts").select("id, file_url"),
    supabase.from("clmg_handouts").select("id, url"),
    supabase.from("magistrali_handouts").select("id, url"),
  ]);
  for (const r of h.data ?? []) out.push({ kind: "handouts", id: String(r.id), url: r.file_url });
  for (const r of c.data ?? []) out.push({ kind: "clmg", id: String(r.id), url: r.url });
  for (const r of m.data ?? []) out.push({ kind: "magistrali", id: String(r.id), url: r.url });
  return out.filter((r) => r.url && String(r.url).startsWith("http"));
}

async function buildOne(item, index, total) {
  const key = `${item.kind}-${item.id}`.replace(/[^a-zA-Z0-9-]/g, "_");
  const pdf = `${TMP}/${key}.pdf`;
  const stem = `${TMP}/${key}`;
  const jpg = `${stem}.jpg`;
  const target = `thumbs/${item.kind}/${item.id}.jpg`;

  try {
    const res = await fetch(item.url);
    if (!res.ok) return { ...item, ok: false, why: `fetch ${res.status}` };
    writeFileSync(pdf, Buffer.from(await res.arrayBuffer()));

    // First page only, scaled to 480px wide, which is 2x the card size.
    await run("pdftoppm", ["-jpeg", "-r", "80", "-f", "1", "-l", "1",
                           "-scale-to-x", "480", "-scale-to-y", "-1",
                           "-singlefile", pdf, stem]);
    if (!existsSync(jpg)) return { ...item, ok: false, why: "no page rendered" };

    // Trim quality to keep the grid light.
    await run("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "65", jpg, "--out", jpg]);
    const bytes = readFileSync(jpg);

    if (APPLY) {
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(target, bytes, { contentType: "image/jpeg", upsert: true });
      if (error) return { ...item, ok: false, why: error.message };
    }
    return { ...item, ok: true, size: bytes.length, target };
  } catch (e) {
    return { ...item, ok: false, why: String(e.message ?? e).slice(0, 90) };
  } finally {
    for (const f of [pdf, jpg]) if (existsSync(f)) rmSync(f, { force: true });
  }
}

const items = await listSources();
console.log(`${items.length} PDFs to render${APPLY ? "" : " (dry run)"}`);

const results = [];
let cursor = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      const r = await buildOne(items[i], i, items.length);
      results.push(r);
      if (results.length % 25 === 0) console.log(`  ${results.length}/${items.length}`);
    }
  }),
);

const ok = results.filter((r) => r.ok);
const bad = results.filter((r) => !r.ok);
const avg = ok.length ? Math.round(ok.reduce((a, b) => a + b.size, 0) / ok.length / 1024) : 0;
console.log(`\nrendered ${ok.length}/${results.length}, avg ${avg} KB`);
if (bad.length) {
  console.log(`failed ${bad.length}:`);
  for (const b of bad.slice(0, 12)) console.log(`  ${b.kind}/${b.id}: ${b.why}`);
}
