import Image from "next/image";
import { cn } from "@/lib/utils";

// Spline scene used as a placeholder stage for the game that will live here.
// The scene itself is hosted, so it is dropped in as an iframe; everything
// around it is ours and follows the brand palette.

export const RobotFlyby = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "relative flex h-screen w-full items-center justify-center overflow-hidden bg-astra-dark",
        className,
      )}
    >
      {/* Same masked radial glow as the hero, so the stage reads as ours. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-[80vh] w-[130vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[60px]"
        style={{
          background:
            "radial-gradient(closest-side, rgb(59 74 208 / 55%) 0%, rgb(4 16 126 / 30%) 50%, rgb(2 10 82 / 0%) 100%)",
        }}
      />

      <header className="absolute top-6 left-1/2 z-20 flex w-[min(1280px,calc(100%-48px))] -translate-x-1/2 items-center justify-between">
        <Image
          src="/astra-logo-horizontal-white.png"
          alt="ASTRA Bocconi"
          width={1400}
          height={377}
          priority
          className="h-8 w-auto"
        />
        <span className="rounded-full border border-astra-gold/40 bg-astra-gold/10 px-4 py-1.5 text-[0.7rem] font-semibold tracking-[0.18em] text-astra-gold uppercase">
          Work in progress
        </span>
      </header>

      <div className="relative z-10 h-[min(78vh,760px)] w-[min(1280px,calc(100%-48px))] overflow-hidden rounded-3xl border border-white/12 shadow-[0_40px_120px_-20px_rgb(2_10_82/80%)]">
        <iframe
          src="https://my.spline.design/untitled-rv0hx3zVdoM6t2ydngxuS7zi/"
          title="ASTRA"
          className="h-full w-full border-0"
          allowFullScreen
        />
      </div>

      <p className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-center text-sm text-white/55">
        Qui ci sarà un gioco. Per ora c&apos;è questo.
      </p>
    </div>
  );
};

export default RobotFlyby;
