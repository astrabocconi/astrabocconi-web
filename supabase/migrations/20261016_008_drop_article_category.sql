-- Stella Polare no longer has categories. The values were cleared through the
-- API on 2026-10-16; this drops the column. Nothing outside this repo reads
-- `articles` (astra-app does not), so the drop is safe.

begin;

alter table public.articles drop column if exists category;

commit;
