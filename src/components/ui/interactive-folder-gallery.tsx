import Link from "next/link";

// A static fanned stack of handout covers per course. Used to spread wider on
// hover with a spring animation; removed; it was laggy and, with fewer than
// four covers, the spread pushed cards outside the card's own box. Now it
// always renders at rest, in plain CSS, so there is nothing to break.

export interface InteractiveFolderProps {
  covers?: string[];
  folderName: string;
  href: string;
  /** Renders muted and unclickable when the course has nothing in it yet. */
  empty?: boolean;
  /** Load the covers eagerly for the first row. */
  priority?: boolean;
}

const SLOTS = 4;

export function InteractiveFolder({
  covers = [],
  folderName,
  href,
  empty = false,
  priority = false,
}: InteractiveFolderProps) {
  // Always draw the same number of slots so every folder is the same size,
  // whether or not it has that many covers yet.
  const slots = Array.from({ length: SLOTS }, (_, i) => covers[i] ?? null);

  const body = (
    <div className={`relative flex h-[300px] w-full items-center justify-center ${empty ? "opacity-40" : ""}`}>
      {slots.map((cover, i) => {
        const offset = i - (SLOTS - 1) / 2;
        return (
          <div
            key={i}
            className="absolute h-[252px] w-[189px] overflow-hidden rounded-2xl border border-astra-primary/12 bg-white shadow-[0_18px_44px_rgba(4,16,126,0.16)]"
            style={{
              transform: `translateX(${offset * 11}px) rotate(${offset * 3}deg) scale(${1 - Math.abs(offset) * 0.02})`,
              zIndex: SLOTS - Math.abs(Math.round(offset)),
            }}
          >
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt=""
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                width={480}
                height={640}
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <span className="block h-full w-full bg-astra-light" />
            )}
          </div>
        );
      })}

      <span className="pointer-events-none absolute top-[96px] z-20 rounded-xl bg-astra-primary px-5 py-2 text-base font-semibold tracking-wide text-white shadow-[0_10px_28px_rgba(4,16,126,0.35)]">
        {folderName}
      </span>
    </div>
  );

  if (empty) return <div aria-disabled="true">{body}</div>;

  return (
    <Link href={href} className="block transition-transform hover:-translate-y-1">
      {body}
    </Link>
  );
}

export default InteractiveFolder;
