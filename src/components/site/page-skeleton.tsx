import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";

// Instant fallback for loading.tsx. Pages are static and normally prefetched,
// so this only shows when a click beats the prefetch (slow network, a link
// that never entered the viewport). It mirrors the page shell so the swap to
// real content does not jump.
export function PageSkeleton({
  active,
  tile = "aspect-square",
  count = 10,
}: {
  active?: string;
  /** Aspect class of one grid tile, matching the real cards. */
  tile?: string;
  count?: number;
}) {
  return (
    <>
      <SiteHeader active={active} />
      <main className="flex-1 bg-white" aria-busy="true" aria-label="Caricamento">
        <header className="bg-linear-to-b from-astra-light to-white px-6 pt-[128px] pb-16">
          <div className="mx-auto w-[min(1400px,calc(100%-48px))]">
            <div className="h-[clamp(3rem,6.4vw,6rem)] w-2/3 max-w-3xl animate-pulse rounded-2xl bg-astra-primary/8" />
            <div className="mt-6 h-5 w-56 animate-pulse rounded-full bg-astra-primary/6" />
          </div>
        </header>
        <div className="mx-auto grid w-[min(1400px,calc(100%-48px))] grid-cols-2 gap-4 pb-28 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className={`${tile} animate-pulse rounded-2xl bg-astra-light`} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
