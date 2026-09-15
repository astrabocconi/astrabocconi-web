# Architecture

## Two databases, on purpose

ASTRA's data is split. This is not an accident to be cleaned up; both stores
are live and owned by different products.

| Store | Holds | Used by |
| --- | --- | --- |
| **Supabase** `jsuzhbspinevkzmhibop` (eu-central-2) | Guides, dispense/handouts, representatives, exchange destinations, study plans, Stella Polare, and the RAG corpus | The old website, this website, and astra-app's RAG |
| **Neon** (Prisma, in `astra-app/packages/db`) | Users, points, partners, rewards, **events**, **news**, tickets | The mobile app and its web admin |

The website reads Supabase for academic content and Neon for events and news,
so that the site and the app never show different things. The Neon access path
is still an open question in `ROADMAP.md`.

## Supabase schema (live, verified 2026-09-15)

Generated types are committed at `src/lib/supabase/types.ts`. Regenerate with:

```
npx supabase gen types typescript --db-url "$NEON_OR_SUPABASE_DIRECT_URL" --schema public
```

22 tables, no views, no functions, no enums. Row counts are from the live
project.

### Content people publish

| Table | Rows | Notes |
| --- | --- | --- |
| `guides` | 49 | `category`, `file_url`, `thumbnail_url`, `order_index`, `is_active` |
| `Stella_Polare` | 2 | Only `Title`, `URL`, `category`, `theme`. The actual articles were never in the database; see below. |
| `astra_polare_media_content` | 3 | Social posts: platform, media link, views, likes |
| `representatives` | 16 | `name`, `section`, `url` |
| `events` | 3 | Largely superseded by Neon's `Event` |
| `event_registrations` | 0 | Holds `user_email`, `user_name`. See security. |

### Documents, spread over six overlapping tables

| Table | Rows | Notes |
| --- | --- | --- |
| `handouts` | 162 | `subject`, `year`, `track`, `semester`, `exam_type`, `file_url` |
| `clmg_handouts` | 36 | Law (CLMG), 5 year programme, different shape |
| `magistrali_handouts` | 5 | Masters |
| `resources` | 4 | A more general, mostly unused catalogue |
| `pdf_files` | 2 | |
| `dispense_uploads` / `extracted_dispense` | 0 / 0 | Dead upload pipeline |

Consolidating these is a Phase 2 task.

### Calculator reference data

| Table | Rows |
| --- | --- |
| `course_subjects` | 375 |
| `course_subjects_UG` | 151 |
| `CLMG_studyplan` | 32 |
| `NC_max` | 12 |
| `UG_exchange_destinations` | 257 |
| `dest_exc_msc` | 202 |
| `CLMG_destinations_exchange` | 59 |

### RAG

`Document`, 27,769 rows. `vector(1536)` embeddings, OpenAI
`text-embedding-3-large`, HNSW index over `halfvec`. Powers Ask ASTRA in the
mobile app.

Two gotchas carried over from astra-app's `lib/rag-db.ts`: the HNSW index needs
`SET LOCAL hnsw.ef_search = 250` inside a transaction or recall degrades badly,
and the transaction pooler forbids prepared statements, so queries must be
plain text.

### Naming

The schema is inconsistent: `Stella_Polare`, `CLMG_studyplan`, `NC_max`,
`Document`, `dest_exc_msc`, `course_subjects_UG`. Quoting matters in Postgres.
We keep the names as they are because the mobile app reads the same tables.

## Security state inherited from the old site

Audited directly against the **live database** on 2026-09-15 by reading
`pg_policies` and `pg_class.relrowsecurity`, not from the old repo's migrations.
That distinction matters: two problems that the old migrations imply do **not**
exist in production, because later migrations removed them.

Not real, despite what the old repo suggests:

- `tmp_guides_upload`, which granted anonymous INSERT on the `guides` bucket,
  **is not present**. `storage.objects` has exactly three policies, all scoped
  to `dispense-uploads` and all requiring an authenticated user.
- `event_registrations` is **not** anon-readable. Its live SELECT policy limits
  rows to the owning user by `user_id` or `auth.email()`.

Real, and addressed by `supabase/migrations/20260915_001_roles_and_rls.sql`:

1. **No role model.** Every write policy was `auth.uid() IS NOT NULL`, so any
   account that could log in could edit or delete every guide, handout and
   representative. This is the concrete reason the backoffice needs real roles.
2. **RAG corpus wide open.** `Document` had RLS switched off entirely, so all
   27,769 embedded chunks were readable with the publishable key.
3. **`Stella_Polare` had no write policies at all**, only SELECT, so the
   backoffice could not have written to it.
4. **No DELETE policies** on `guides`, `handouts`, `events` or `resources`, so
   deletions would have failed silently.

Still open:

5. **Credentials.** The old repo is public and contains the anon key, which is
   fine by design. The database password and secret key, however, sit in
   cleartext in `~/astra-app/apps/web/.env` and should be rotated.
6. **All five storage buckets are public** (`dispense-uploads`, `guides`,
   `images`, `stella_polare`, `gpt knowledge`). For published course material
   that is intended, but `gpt knowledge` deserves a look.
7. **Open signups.** Supabase Auth currently allows anyone to register. Nothing
   grants a bare account any write access now that permissions are explicit,
   but signups should still be closed or domain restricted.

### Four tables are invisible to the type generator

The live database has **26** tables in `public`, not 22. These four are missing
from `src/lib/supabase/types.ts` because their names contain spaces or hyphens:

`course multipliers estimation`, `minimum CFU required`,
`cours-subject_MS_exchange`, `course-multiplier_UG`

All four are calculator reference data with public read policies. Anything
querying them needs raw SQL or a quoted PostgREST call.

## Why the old site is being replaced

Beyond the UI, the structural problem: **eleven Stella Polare articles are
hardcoded as individual `.tsx` files with hardcoded routes** in the old repo.
Publishing an article means a developer, a code change, and a deploy. The
`Stella_Polare` table exists but only stores a title and a link, so the
database and the site disagree about what an article even is.

Fixing that is the whole point of the backoffice.
