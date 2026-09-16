"use client";

import { cn } from "@/lib/utils";

type InfiniteSliderProps = {
  children: React.ReactNode;
  /** Seconds for one full loop. Higher is slower. */
  duration?: number;
  reverse?: boolean;
  gap?: number;
  className?: string;
};

// The track holds two identical groups and travels exactly one group plus one
// gap, so the seam lands back at the start and the loop is invisible.
export function InfiniteSlider({
  children,
  duration = 28,
  reverse = false,
  gap = 16,
  className,
}: InfiniteSliderProps) {
  const group = (
    <div className="flex flex-col" style={{ gap: `${gap}px` }}>
      {children}
    </div>
  );

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className="infinite-slider__track flex flex-col"
        style={
          {
            gap: `${gap}px`,
            animationDuration: `${duration}s`,
            animationDirection: reverse ? "reverse" : "normal",
            "--slider-gap": `${gap}px`,
          } as React.CSSProperties
        }
      >
        {group}
        <div aria-hidden="true" className="contents">
          {group}
        </div>
      </div>
    </div>
  );
}

export default InfiniteSlider;
