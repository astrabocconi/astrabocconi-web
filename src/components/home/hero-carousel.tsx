"use client";

import { useEffect, useRef } from "react";

// A band of media tiles laid on the INSIDE of a cylinder, turning continuously.
// The reference is the Bending Spoons hero: the middle of the band sits far
// from the camera and the tiles toward the left and right edges swing out
// toward the viewer, so the row reads as a curved wall rather than a flat strip.
//
// Every clip lives in one grid video, public/hero/atlas.mp4, built by
// scripts/make-hero-atlas.sh. A single hidden <video> decodes it and each tile
// paints its own cell onto a canvas. One <video> per tile was tried first and
// glitched badly: twelve hardware decoders inside a 3D transformed layer
// wedged and froze on Intel GPUs. One decoder, no play and pause churn.


// Atlas geometry, fixed by the script. Phones and tablets get atlas-sm.mp4,
// the same grid at half resolution: the full 1920x2040 atlas, decoded and
// copied into twelve canvases every frame, crashed mobile browsers outright.
const SMALL_SCREEN = "(max-width: 900px)";
const CELL_W = 480;
const CELL_H = 680;
const COLS = 4;
const ROWS = 3;

const TILE_COUNT = 12;
// Atlas cell shown by each tile, in ring order: one unique clip per tile.
// Crowds (1, 2, 11), basketball (5, 6) and indoor talks (4, 7) are interleaved
// to keep similar clips apart (the ring is circular: the last tile touches the
// first).
const TILE_CELLS = [0, 3, 1, 5, 7, 8, 2, 6, 9, 4, 11, 10];
const STEP_DEG = 360 / TILE_COUNT;
// Must match the hero-cylinder-spin duration in globals.css.
const SPIN_MS = 54_000;
// Tiles within this many degrees of the far wall are painted each frame. A
// little past 90 so a tile is already live as it slides out of the edge fade.
const PAINT_ARC_DEG = 105;

export function HeroCarousel() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!root || !stage || !video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const small = window.matchMedia(SMALL_SCREEN).matches;
    const scale = small ? 0.5 : 1;
    const cellW = CELL_W * scale;
    const cellH = CELL_H * scale;
    video.src = small ? "/hero/atlas-sm.mp4" : "/hero/atlas.mp4";
    canvasRefs.current.forEach((canvas) => {
      if (!canvas) return;
      canvas.width = cellW;
      canvas.height = cellH;
    });

    const contexts = canvasRefs.current.map((canvas) => canvas?.getContext("2d"));
    let onScreen = true;
    let leaving = false;
    let frame = 0;
    let lastPainted = -1;

    // Paint once per decoded frame where the browser can say when one lands;
    // otherwise once per display frame, skipping frames the clock has not
    // moved past.
    const perVideoFrame = "requestVideoFrameCallback" in video;
    const schedule = () =>
      perVideoFrame
        ? video.requestVideoFrameCallback(paint)
        : requestAnimationFrame(paint);
    const cancel = () =>
      perVideoFrame ? video.cancelVideoFrameCallback(frame) : cancelAnimationFrame(frame);

    const paint = () => {
      frame = schedule();
      if (video.readyState < 2 || video.currentTime === lastPainted) return;
      lastPainted = video.currentTime;

      const spin = stage.getAnimations()[0];
      const elapsed = Number(spin?.currentTime ?? 0);
      const stageDeg = -((elapsed % SPIN_MS) / SPIN_MS) * 360;

      contexts.forEach((context, index) => {
        if (!context) return;
        // Signed distance from the far wall, normalised to [-180, 180).
        const deg = ((((STEP_DEG * index + stageDeg) % 360) + 540) % 360) - 180;
        if (Math.abs(deg) > PAINT_ARC_DEG) return;
        const cell = TILE_CELLS[index];
        context.drawImage(
          video,
          (cell % COLS) * cellW,
          Math.floor(cell / COLS) * cellH,
          cellW,
          cellH,
          0,
          0,
          cellW,
          cellH,
        );
      });
    };

    const sync = () => {
      const run = onScreen && !leaving && !document.hidden && document.readyState === "complete";
      cancel();
      if (run) {
        // Rejects if a pause lands first; the next sync retries.
        video.play().catch(() => {});
        frame = schedule();
      } else {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    observer.observe(root);
    // Painting a dozen canvases per video frame competes with React for the
    // main thread, which measurably slowed the transition to the next page
    // (about 200ms of a 420ms click to paint). Stop as soon as an internal
    // link to another page is clicked; the component unmounts right after.
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.target || link.origin !== location.origin) return;
      if (link.pathname === location.pathname) return;
      leaving = true;
      // Freeze the spin too: compositing the turning 3D band is the other
      // half of the per-frame cost.
      stage.style.animationPlayState = "paused";
      sync();
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("visibilitychange", sync);
    // Decoding starts after load: decoders opened while the page is still
    // loading (the WebGL cloth spins up its GPU context then) are the ones
    // that wedged in testing. The poster covers the wait.
    window.addEventListener("load", sync);
    sync();

    return () => {
      cancel();
      observer.disconnect();
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("load", sync);
      video.pause();
    };
  }, []);

  return (
    <div ref={rootRef} className="hero-cylinder" aria-hidden="true">
      <div className="hero-cylinder__hue" />

      <video
        ref={videoRef}
        className="hero-cylinder__source"
        // src is set in the effect: the full atlas or atlas-sm by screen size.
        muted
        loop
        playsInline
        // "none": the 14MB atlas must not compete with the page's own
        // requests. play() after window load is what starts the download;
        // the atlas poster behind each canvas covers the wait.
        preload="none"
        disablePictureInPicture
        tabIndex={-1}
      />

      {/* The 3D scene lives in its own box so phones can build it small and
          scale the projected result back up. See .hero-cylinder__lens. */}
      <div className="hero-cylinder__lens">
      <div ref={stageRef} className="hero-cylinder__stage">
        {Array.from({ length: TILE_COUNT }).map((_, index) => {
          const cell = TILE_CELLS[index];
          return (
            <div
              key={index}
              className="hero-cylinder__tile"
              style={
                {
                  "--tile-angle": `${STEP_DEG * index}deg`,
                } as React.CSSProperties
              }
            >
              <div className="hero-cylinder__card">
                <canvas
                  ref={(node) => {
                    canvasRefs.current[index] = node;
                  }}
                  className="hero-cylinder__video"
                  width={CELL_W}
                  height={CELL_H}
                  // The atlas poster, cropped to this tile's cell, shows until
                  // the first decoded frame is painted over it.
                  style={{
                    backgroundPosition: `${((cell % COLS) / (COLS - 1)) * 100}% ${(Math.floor(cell / COLS) / (ROWS - 1)) * 100}%`,
                  }}
                />
                <div className="hero-cylinder__scrim" />
              </div>
            </div>
          );
        })}
      </div>
      </div>

      <div className="hero-cylinder__edge hero-cylinder__edge--left" />
      <div className="hero-cylinder__edge hero-cylinder__edge--right" />
    </div>
  );
}

export default HeroCarousel;
