"use client";

// Filename keeps the spelling from the brief ("scoller") so any further
// snippets that import it line up.
//
// Two changes from the supplied source:
//
// 1. It rendered Spotify, YouTube, Amazon and Google through `react-icons`.
//    Those are placeholders for ASTRA's own partners, whose logos are coming,
//    so the list is a prop and each entry falls back to a blank plate. That
//    keeps `react-icons` out of the tree for icons about to be thrown away.
// 2. The original wrote `[gap:var(--gap))]` with a stray bracket, which
//    Tailwind drops, so the gap never applied and the loop seam showed.
//
// The marquee keyframes live in globals.css.

export type BrandItem = {
  name: string;
  /** Optional. Until the real logos land, entries render as a blank plate. */
  logo?: string;
};

const TRACK_COPIES = 4;

function Brand({ item }: { item: BrandItem }) {
  return (
    <div className="flex w-36 shrink-0 items-center gap-3">
      {item.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.logo}
          alt={item.name}
          className="h-7 w-7 shrink-0 rounded-md object-contain"
        />
      ) : (
        <span className="h-7 w-7 shrink-0 rounded-md bg-white/85" />
      )}
      <p className="truncate text-lg font-semibold opacity-80">{item.name}</p>
    </div>
  );
}

function Track({
  items,
  reverse,
}: {
  items: BrandItem[];
  reverse?: boolean;
}) {
  return (
    <div className="group flex max-w-full flex-row overflow-hidden py-1 [--duration:40s] [--gap:2.5rem] [gap:var(--gap)] [mask-image:linear-gradient(to_right,_rgba(0,_0,_0,_0),rgba(0,_0,_0,_1)_10%,rgba(0,_0,_0,_1)_90%,rgba(0,_0,_0,_0))]">
      {Array(TRACK_COPIES)
        .fill(0)
        .map((_, i) => (
          <div
            className={`flex shrink-0 flex-row justify-around [gap:var(--gap)] ${
              reverse ? "animate-marquee-reverse" : "animate-marquee"
            }`}
            key={i}
            aria-hidden={i > 0}
          >
            {items.map((item) => (
              <Brand key={item.name} item={item} />
            ))}
          </div>
        ))}
    </div>
  );
}

export const BrandScroller = ({ items }: { items: BrandItem[] }) => (
  <Track items={items} />
);

export const BrandScrollerReverse = ({ items }: { items: BrandItem[] }) => (
  <Track items={items} reverse />
);
