"use client";

// A band of media tiles laid on the INSIDE of a cylinder, turning continuously.
// The reference is the Bending Spoons hero: the middle of the band sits far
// from the camera and the tiles toward the left and right edges swing out
// toward the viewer, so the row reads as a curved wall rather than a flat strip.
//
// Every tile is a blank white placeholder; the real media drops in later.

const TILE_COUNT = 12;
const STEP_DEG = 360 / TILE_COUNT;
// Radius follows from the tile pitch: chord = 2 * R * sin(step / 2).
const RADIUS = 1500;

export function HeroCarousel() {
  return (
    <div className="hero-cylinder" aria-hidden="true">
      <div className="hero-cylinder__stage">
        {Array.from({ length: TILE_COUNT }).map((_, index) => (
          <div
            key={index}
            className="hero-cylinder__tile"
            style={
              {
                "--tile-angle": `${STEP_DEG * index}deg`,
                "--tile-radius": `${RADIUS}px`,
              } as React.CSSProperties
            }
          >
            <div className="hero-cylinder__card" />
          </div>
        ))}
      </div>

      <div className="hero-cylinder__edge hero-cylinder__edge--left" />
      <div className="hero-cylinder__edge hero-cylinder__edge--right" />
    </div>
  );
}

export default HeroCarousel;
