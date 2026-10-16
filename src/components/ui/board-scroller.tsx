"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useInView } from "motion/react";
import { User } from "lucide-react";

// Continuous horizontal scroll of board member photos. It is a real scroll
// container, so the visitor can also scroll by hand (wheel, trackpad, touch).
// A rAF loop nudges scrollLeft and wraps at one copy, so the loop is seamless.
// Hovering or touching pauses the drift; leaving resumes it.

export type BoardMember = {
  name?: string;
  /** Until real photos land, entries render as a placeholder avatar. */
  photo?: string;
};

const TRACK_COPIES = 3;
const SECONDS_PER_COPY = 240;

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

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let paused = false;
    let resume: ReturnType<typeof setTimeout>;
    let pos = 0;
    let started = false;
    let last = performance.now();
    let raf = requestAnimationFrame(function tick(now) {
      const dt = (now - last) / 1000;
      last = now;
      const copy = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      const span = copy + gap;
      if (span > 0 && !started) {
        started = true;
        pos = span; // start on the middle copy so both directions have room
        el.scrollLeft = pos;
      }
      if (paused) {
        pos = el.scrollLeft; // pick up wherever the visitor scrolled to
      } else if (span > 0) {
        pos += (span / SECONDS_PER_COPY) * dt;
        el.scrollLeft = pos;
      }
      if (span > 0) {
        // Manual scroll can leave the middle copy; jump back by one copy.
        let x = el.scrollLeft;
        if (x >= span * 2) x -= span;
        else if (x < 1) x += span;
        if (x !== el.scrollLeft) el.scrollLeft = pos = x;
      }
      raf = requestAnimationFrame(tick);
    });
    const pause = () => {
      clearTimeout(resume);
      paused = true;
    };
    const go = () => {
      clearTimeout(resume);
      resume = setTimeout(() => (paused = false), 1500);
    };
    const enter = pause;
    const leave = () => {
      clearTimeout(resume);
      paused = false;
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", go);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resume);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", go);
    };
  }, []);

  return (
    <div ref={ref} className="flex min-w-0 max-w-full flex-row overflow-x-auto py-1 [--gap:1.75rem] [gap:var(--gap)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,_transparent,black_4%,black_96%,transparent)]">
      {Array(TRACK_COPIES)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            aria-hidden={i > 0}
            className="flex shrink-0 flex-row justify-around [gap:var(--gap)]"
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
