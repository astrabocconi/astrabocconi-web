"use client";

// Adapted from the supplied component in two ways, both deliberate:
//
// 1. It imported `framer-motion`. This project already ships `motion`, which is
//    the same library under its current name, so it imports from `motion/react`
//    rather than installing a second copy.
// 2. It imported `swiper/css`, `swiper/css/effect-creative` and friends, but
//    nothing in the file uses Swiper. Those imports are dropped instead of
//    pulling in a package solely for stylesheets nothing reads.
//
// Every panel is a blank white placeholder; real imagery drops in later.

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export type HoverExpandItem = {
  /** Optional. While scaffolding, panels render as blank white surfaces. */
  src?: string;
  alt: string;
  code?: string;
};

export const HoverExpand_001 = ({
  items,
  className,
  activeWidth = "17rem",
  restWidth = "3.5rem",
  height = "21rem",
}: {
  items: HoverExpandItem[];
  className?: string;
  activeWidth?: string;
  restWidth?: string;
  height?: string;
}) => {
  // Opens on the first panel. The supplied source started on the second.
  const [activeImage, setActiveImage] = useState<number | null>(0);

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        duration: 0.3,
        delay: 0.5,
      }}
      className={cn("relative w-full", className)}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="flex w-full items-center justify-center gap-1.5">
          {items.map((item, index) => (
            <motion.div
              key={index}
              className="relative cursor-pointer overflow-hidden rounded-3xl border border-astra-primary/10 bg-white shadow-[0_18px_40px_rgba(4,16,126,0.08)]"
              initial={{ width: restWidth, height }}
              animate={{
                width: activeImage === index ? activeWidth : restWidth,
                height,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={() => setActiveImage(index)}
              onHoverStart={() => setActiveImage(index)}
            >
              <AnimatePresence>
                {activeImage === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute h-full w-full bg-gradient-to-t from-astra-primary/45 to-transparent"
                  />
                )}
              </AnimatePresence>
              <AnimatePresence>
                {activeImage === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute flex h-full w-full flex-col items-start justify-end p-4"
                  >
                    <p className="text-left text-sm font-semibold text-white">
                      {item.alt}
                    </p>
                    {item.code && (
                      <p className="text-left text-xs text-white/60">
                        {item.code}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {item.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.src}
                  className="size-full object-cover"
                  alt={item.alt}
                />
              ) : (
                <div className="size-full bg-white" />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HoverExpand_001;
