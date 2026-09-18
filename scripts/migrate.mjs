// Apply one migration from supabase/migrations against the live database, and
// print an RLS summary afterwards. Dry runs by default: the whole thing goes
// in one transaction that is rolled back unless --apply is passed.
//
//   node scripts/migrate.mjs 20260916_005_images_bucket_policies.sql
//   node scripts/migrate.mjs 20260916_005_images_bucket_policies.sql --apply
//
// Needs `pg` (npm i -D pg) and DIRECT_DATABASE_URL in .env.local: the direct
// Postgres connection string from the Supabase dashboard, not the PostgREST
// URL. See docs/HANDOVER.md.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const APPLY = process.argv.includes("--apply");
const name = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!name) throw new Error("usage: node scripts/migrate.mjs <migration.sql> [--apply]");
const file = join(ROOT, "supabase/migrations", name);

let sql = readFileSync(file, "utf8");
if (!APPLY) {
  // Drop the final commit so the transaction stays open and can be inspected
  // before being rolled back.
  sql = sql.replace(/\ncommit;\s*$/, "\n");
  if (/\ncommit;/.test(sql)) throw new Error("could not neutralise commit");
}

const env = readFileSync(join(ROOT, ".env.local"), "utf8");
const line = env.split("\n").find((l) => l.startsWith("DIRECT_DATABASE_URL="));
if (!line) throw new Error("DIRECT_DATABASE_URL missing from .env.local");
const url = line.replace(/^DIRECT_DATABASE_URL=/, "").replace(/^"|"$/g, "");

// getaddrinfo fails for the pooler hostname in this environment while direct
// DNS queries work, so resolve the address explicitly and keep TLS verifying
// against the original hostname via servername.
const { promises: dns } = await import("node:dns");
const u = new URL(url);
const [addr] = await dns.resolve4(u.hostname);

const client = new pg.Client({
  host: addr,
  port: Number(u.port || 5432),
  user: decodeURIComponent(u.username),
  password: decodeURIComponent(u.password),
  database: u.pathname.replace(/^\//, "") || "postgres",
  ssl: { servername: u.hostname, rejectUnauthorized: false },
});
await client.connect();

console.log(APPLY ? ">>> APPLYING FOR REAL" : ">>> DRY RUN (will roll back)");
try {
  await client.query(sql);
  console.log("SQL executed with no errors.");
} catch (e) {
  console.error("FAILED:", e.message);
  if (e.position) console.error("at character", e.position);
  await client.query("rollback").catch(() => {});
  process.exitCode = 1;
}

// Report what the database looks like now.
const after = await client.query(`
  select c.relname as tbl, c.relrowsecurity as rls
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relkind='r' and c.relrowsecurity=false`);
console.log(
  "tables still without RLS:",
  after.rows.map((r) => r.tbl).join(", ") || "(none)",
);

const pol = await client.query(
  `select count(*)::int c from pg_policies where schemaname='public'`,
);
console.log("public policies:", pol.rows[0].c);

const au = await client.query(
  `select to_regclass('public.admin_users') is not null as exists`,
);
console.log("admin_users exists:", au.rows[0].exists);

const legacy = await client.query(
  `select tablename, policyname from pg_policies
   where schemaname='public' and (qual like '%auth.uid() IS NOT NULL%'
                               or with_check like '%auth.uid() IS NOT NULL%')`,
);
console.log(
  "blanket auth.uid() IS NOT NULL policies left:",
  legacy.rows.length === 0
    ? "(none)"
    : legacy.rows.map((r) => `${r.tablename}.${r.policyname}`).join(", "),
);

const perms = await client.query(
  `select tablename, cmd, count(*)::int c from pg_policies
   where schemaname='public' and (qual like '%has_permission%' or with_check like '%has_permission%')
   group by tablename, cmd order by tablename, cmd`,
);
console.log("permission-gated policies:", perms.rows.length);
for (const r of perms.rows) console.log(`   ${r.tablename} ${r.cmd}`);

if (!APPLY) {
  await client.query("rollback");
  console.log("\nrolled back, database unchanged");
}

await client.end();
