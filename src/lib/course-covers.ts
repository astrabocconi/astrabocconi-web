import { R2_PUBLIC_URL } from "@/lib/r2-public";
// A bespoke illustrated cover per course, carried over from the old site
// (the one thing there worth keeping, see DECISIONS). Seeded once into the
// `images` bucket at `course-covers/<code>.jpg`; not every course has one.

const HAS_COVER = new Set([
  "CLEAM",
  "BIEM",
  "BIEF",
  "CLEACC",
  "BEMACC",
  "BEMACS",
  "BAI",
  "BIG",
  "CLMG",
  "BGL",
  "BESS",
]);

const BASE = `${R2_PUBLIC_URL}/images/course-covers`;

export function courseCoverUrl(code: string): string | undefined {
  return HAS_COVER.has(code) ? `${BASE}/${code.toLowerCase()}.jpg` : undefined;
}
