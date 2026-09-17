"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

// One word at a time, each rising into place as the previous one leaves
// upward. The wrapper is a fixed-height slot with overflow clipped, so the
// words roll through it rather than spilling out of the headline's line box.
export function RotatingWords({
  words,
  intervalMs = 2200,
  className = "",
}: {
  words: string[];
  intervalMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      intervalMs,
    );
    return () => window.clearInterval(id);
  }, [words.length, intervalMs]);

  // The widest word reserves the width, so the line never reflows mid-rotation.
  const widest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <span
      // No explicit height: the sizer below sets it to exactly one line box, so
      // aligning the bottom edge lines the word up with the headline's baseline.
      // A fixed em height drifts as soon as the headline's line-height changes.
      className={`relative inline-block overflow-hidden align-bottom ${className}`}
    >
      {/* Sizer: sets the width, never seen, never read out. */}
      <span aria-hidden="true" className="invisible block">
        {widest}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={words[index]}
          initial={{ y: "110%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-110%" }}
          transition={{ type: "spring", stiffness: 330, damping: 34 }}
          className="absolute inset-x-0 top-0 text-astra-accent"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default RotatingWords;
