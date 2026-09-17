"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";

// A fanned stack of handout covers per course. There is no folder body behind
// them any more: the cards themselves are the object, and hovering spreads them.
//
// Covers are pre-rendered JPEGs served straight from Supabase, so this paints
// as fast as any other image grid.

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
  const [hover, setHover] = useState(false);
  const open = hover && !empty;

  // Always draw the same number of slots so every folder is the same size,
  // whether or not it has that many covers yet.
  const slots = Array.from({ length: SLOTS }, (_, i) => covers[i] ?? null);

  const body = (
    <div
      className={`relative flex h-[300px] w-full items-center justify-center ${
        empty ? "opacity-40" : ""
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {slots.map((cover, i) => {
        const offset = i - (SLOTS - 1) / 2;
        return (
          <motion.div
            key={i}
            className="absolute h-[252px] w-[189px] overflow-hidden rounded-2xl border border-astra-primary/12 bg-white shadow-[0_18px_44px_rgba(4,16,126,0.16)]"
            animate={{
              x: open ? offset * 62 : offset * 11,
              y: open ? -Math.abs(offset) * 7 : 0,
              rotate: open ? offset * 7 : offset * 3,
              scale: open ? 1 : 1 - Math.abs(offset) * 0.02,
            }}
            style={{ zIndex: SLOTS - Math.abs(Math.round(offset)) }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
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
          </motion.div>
        );
      })}

      <motion.span
        className="pointer-events-none absolute z-20 rounded-xl bg-astra-primary px-5 py-2 text-base font-semibold tracking-wide text-white shadow-[0_10px_28px_rgba(4,16,126,0.35)]"
        animate={{ y: open ? 130 : 96 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
      >
        {folderName}
      </motion.span>
    </div>
  );

  if (empty) return <div aria-disabled="true">{body}</div>;

  return (
    <Link href={href} className="block">
      {body}
    </Link>
  );
}

export default InteractiveFolder;
