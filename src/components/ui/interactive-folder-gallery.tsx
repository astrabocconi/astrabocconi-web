"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";

// Adapted from the supplied interactive-folder-gallery. Three changes:
//
// 1. It imported `framer-motion`; this project ships `motion`, the same library
//    renamed, so it imports `motion/react` rather than a duplicate copy.
// 2. The original was a single dark folder on a black page. Here it is one
//    folder per course on a white page, so the palette is ASTRA's and the
//    component takes a name, a count and a href.
// 3. Opening is a navigation, not an in-place expand, so the drag-to-close
//    interaction is gone. Hovering still lifts the lid and fans the contents.
//
// Photos are blank white cards until the real covers are uploaded.

export interface GalleryPhoto {
  id: string | number;
  image?: string;
}

export interface InteractiveFolderProps {
  photos?: GalleryPhoto[];
  folderName: string;
  caption?: string;
  href: string;
  /** Renders muted and unclickable when the course has nothing in it yet. */
  empty?: boolean;
  className?: string;
}

const PLACEHOLDERS: GalleryPhoto[] = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
];

export function InteractiveFolder({
  photos = PLACEHOLDERS,
  folderName,
  caption,
  href,
  empty = false,
  className,
}: InteractiveFolderProps) {
  const [hover, setHover] = useState(false);
  const open = hover && !empty;

  const body = (
    <div
      className={`relative flex h-[230px] w-full items-end justify-center ${
        empty ? "opacity-45" : ""
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Back wall of the folder */}
      <motion.div
        className="absolute bottom-6 h-36 w-52"
        animate={{ y: open ? -6 : 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
      >
        <div className="absolute top-0 left-0 h-6 w-20 rounded-t-lg border-t border-r border-l border-astra-primary/12 bg-astra-light" />
        <div className="absolute top-5 right-0 bottom-0 left-0 rounded-tr-lg rounded-b-lg border border-astra-primary/12 bg-astra-light" />
      </motion.div>

      {/* Contents */}
      <div className="absolute bottom-8 z-10 flex justify-center">
        {photos.map((photo, i) => {
          const offset = i - Math.floor(photos.length / 2);
          return (
            <motion.div
              key={photo.id}
              className="absolute bottom-0 h-28 w-20 overflow-hidden rounded-lg border border-astra-primary/12 bg-white shadow-[0_10px_24px_rgba(4,16,126,0.12)]"
              animate={{
                y: open ? offset * -4 - 26 : offset * -2,
                x: open ? offset * 26 : offset * 2,
                rotate: open ? offset * 7 : offset * 2,
                scale: 1 - Math.abs(offset) * 0.03,
                zIndex: 10 + i,
              }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            >
              {photo.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </motion.div>
          );
        })}
      </div>

      {/* Front flap, carrying the course name */}
      <motion.div
        className="absolute bottom-0 z-20 h-24 w-56"
        style={{ transformOrigin: "bottom" }}
        animate={{ rotateX: open ? -26 : 0, y: open ? 6 : 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
      >
        <div className="relative flex h-full w-full items-end justify-center overflow-hidden rounded-xl border border-astra-primary/15 bg-linear-to-b from-white to-astra-light pb-4 shadow-[0_18px_36px_rgba(4,16,126,0.12)]">
          <span className="absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent via-white to-transparent" />
          <span className="rounded-lg bg-astra-primary px-4 py-1.5 text-sm font-semibold tracking-wide text-white">
            {folderName}
          </span>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className={className}>
      {empty ? (
        <div aria-disabled="true">{body}</div>
      ) : (
        <Link href={href} className="block">
          {body}
        </Link>
      )}
      <p className="mt-3 text-center text-xs text-gray-500">
        {empty ? "Nessuna dispensa" : caption}
      </p>
    </div>
  );
}

export default InteractiveFolder;
