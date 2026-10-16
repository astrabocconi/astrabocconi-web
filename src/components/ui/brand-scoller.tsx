"use client";

// Filename keeps the spelling from the brief ("scoller") so any further
// snippets that import it line up.
//
// Two changes from the supplied source:
//
// 1. It rendered Spotify, YouTube, Amazon and Google through `react-icons`.
//    The list is a prop now, fed from site_sections "partner_bar", which
//    keeps `react-icons` out of the tree.
// 2. The original wrote `[gap:var(--gap))]` with a stray bracket, which
//    Tailwind drops, so the gap never applied and the loop seam showed.
//
// The marquee keyframes live in globals.css.

export type BrandItem = {
  name: string;
  /** Optional. Without one, the entry renders its name as text. */
  logo?: string;
};

const TRACK_COPIES = 4;

// Logo only, at its own aspect ratio: wide wordmarks get their width, square
// marks stay square. The name is the alt text, and the fallback when there is
// no logo yet.
function Brand({ item }: { item: BrandItem }) {
  return item.logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={item.logo} alt={item.name} className="h-12 w-auto max-w-60 shrink-0 object-contain" />
  ) : (
    <p className="shrink-0 text-lg font-semibold whitespace-nowrap opacity-80">{item.name}</p>
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
    <div className="group flex max-w-full flex-row overflow-hidden py-1 [--duration:40s] [--gap:3.5rem] [gap:var(--gap)] [mask-image:linear-gradient(to_right,_rgba(0,_0,_0,_0),rgba(0,_0,_0,_1)_10%,rgba(0,_0,_0,_1)_90%,rgba(0,_0,_0,_0))]">
      {Array(TRACK_COPIES)
        .fill(0)
        .map((_, i) => (
          <div
            className={`flex shrink-0 flex-row items-center justify-around [gap:var(--gap)] ${
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
