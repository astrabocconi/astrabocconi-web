"use client";

import Image from "next/image";
import { useRef } from "react";
import { useInView } from "motion/react";
import { User } from "lucide-react";

// Continuous horizontal scroll of board member photos, replacing the old
// hover-expand panel. Same marquee keyframes as BrandScroller (pure CSS, no
// animation library) and the same edge fade via mask-image.

export type BoardMember = {
  name?: string;
  /** Until real photos land, entries render as a placeholder avatar. */
  photo?: string;
};

const TRACK_COPIES = 3;

// The cards are official ASTRA graphics (name, role and department already
// burned into the image) so they render as-is, full rectangle, no circular
// crop and no separate caption.
function Portrait({ member, nearby }: { member: BoardMember; nearby: boolean }) {
  return (
    <div className="w-64 shrink-0 sm:w-80">
      {member.photo ? (
        <Image
          src={member.photo}
          alt={member.name ?? ""}
          loading={nearby ? "eager" : "lazy"}
          decoding="async"
          width={640}
          height={800}
          sizes="(max-width: 639px) 256px, 320px"
          className="aspect-4/5 w-full rounded-2xl object-cover"
        />
      ) : (
        <div className="flex aspect-4/5 w-full items-center justify-center rounded-2xl bg-astra-light">
          <User className="h-14 w-14 text-astra-primary/40" />
        </div>
      )}
    </div>
  );
}

export function BoardScroller({ members }: { members: BoardMember[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const nearby = useInView(ref, { once: true, margin: "800px" });
  return (
    <div ref={ref} className="group flex min-w-0 max-w-full flex-row overflow-hidden py-1 [--duration:240s] [--gap:1.75rem] [gap:var(--gap)] [mask-image:linear-gradient(to_right,_transparent,black_4%,black_96%,transparent)]">
      {Array(TRACK_COPIES)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            aria-hidden={i > 0}
            className="animate-marquee flex shrink-0 flex-row justify-around [gap:var(--gap)] group-hover:[animation-play-state:paused]"
          >
            {members.map((member, j) => (
              <Portrait key={j} member={member} nearby={nearby} />
            ))}
          </div>
        ))}
    </div>
  );
}

export default BoardScroller;
