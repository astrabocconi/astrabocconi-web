"use client";

// A continuously rotating ring of media tiles, in the spirit of the Bending
// Spoons hero but not a copy of it. Every tile is a blank white placeholder:
// the real photography and video get dropped in later without touching layout.

const TILE_COUNT = 14;
const RADIUS = 820;

export function HeroCarousel() {
  return (
    <div className="hero-ring" aria-hidden="true">
      <div className="hero-ring__stage">
        {Array.from({ length: TILE_COUNT }).map((_, index) => (
          <div
            key={index}
            className="hero-ring__tile"
            style={
              {
                "--tile-angle": `${(360 / TILE_COUNT) * index}deg`,
                "--tile-radius": `${RADIUS}px`,
              } as React.CSSProperties
            }
          >
            <div className="hero-ring__card" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default HeroCarousel;
