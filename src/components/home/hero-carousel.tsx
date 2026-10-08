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

// Seven clips in atlas cell order.
const CLIP_COUNT = 7;

// Atlas geometry, fixed by the script.
const CELL_W = 480;
const CELL_H = 680;
const COLS = 4;
const ROWS = 2;

const TILE_COUNT = 12;
const STEP_DEG = 360 / TILE_COUNT;
// Radius follows from the tile pitch: chord = 2 * R * sin(step / 2).
const RADIUS = 1500;
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

    const contexts = canvasRefs.current.map((canvas) => canvas?.getContext("2d"));
    let onScreen = true;
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
        const cell = index % CLIP_COUNT;
        context.drawImage(
          video,
          (cell % COLS) * CELL_W,
          Math.floor(cell / COLS) * CELL_H,
          CELL_W,
          CELL_H,
          0,
          0,
          CELL_W,
          CELL_H,
        );
      });
    };

    const sync = () => {
      const run = onScreen && !document.hidden && document.readyState === "complete";
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
    document.addEventListener("visibilitychange", sync);
    // Decoding starts after load: decoders opened while the page is still
    // loading (the WebGL cloth spins up its GPU context then) are the ones
    // that wedged in testing. The poster covers the wait.
    window.addEventListener("load", sync);
    sync();

    return () => {
      cancel();
      observer.disconnect();
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
        src="/hero/atlas.mp4"
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        tabIndex={-1}
      />

      <div ref={stageRef} className="hero-cylinder__stage">
        {Array.from({ length: TILE_COUNT }).map((_, index) => {
          const cell = index % CLIP_COUNT;
          return (
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

      <div className="hero-cylinder__edge hero-cylinder__edge--left" />
      <div className="hero-cylinder__edge hero-cylinder__edge--right" />
    </div>
  );
}

export default HeroCarousel;
