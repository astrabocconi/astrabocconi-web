import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { isExternal, type Notice, type NoticeButton, type NoticeTone } from "@/lib/site-content";

const TONE: Record<NoticeTone, { box: string; title: string; body: string; primary: string; secondary: string }> = {
  info: {
    box: "bg-astra-light text-astra-primary",
    title: "text-astra-primary",
    body: "text-astra-primary/75",
    primary: "bg-astra-primary text-white hover:bg-astra-dark",
    secondary: "border border-astra-primary/20 text-astra-primary hover:bg-white/60",
  },
  important: {
    box: "bg-astra-primary text-white",
    title: "text-white",
    body: "text-white/75",
    primary: "bg-white text-astra-primary hover:bg-astra-light",
    secondary: "border border-white/30 text-white hover:bg-white/10",
  },
  urgent: {
    box: "bg-astra-gold text-astra-dark",
    title: "text-astra-dark",
    body: "text-astra-dark/75",
    primary: "bg-astra-dark text-white hover:bg-astra-primary",
    secondary: "border border-astra-dark/25 text-astra-dark hover:bg-white/30",
  },
};

export function NoticeButtonLink({ button, className }: { button: NoticeButton; className: string }) {
  const cls = `inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${className}`;
  if (isExternal(button.url)) {
    return (
      <a href={button.url} target="_blank" rel="noopener noreferrer" className={cls}>
        {button.label}
        <ArrowUpRight className="h-4 w-4" />
      </a>
    );
  }
  return (
    <Link href={button.url} className={cls}>
      {button.label}
    </Link>
  );
}

// Renders nothing at all when there is nothing to say: no wrapper, no spacing.
export function NoticeStrip({ notices }: { notices: Notice[] }) {
  if (notices.length === 0) return null;

  return (
    <section aria-label="Avvisi" className="mx-auto flex w-[min(1280px,calc(100%-48px))] flex-col gap-3 pt-6">
      {notices.map((n) => {
        const t = TONE[n.tone];
        return (
          <div
            key={n.id}
            className={`flex flex-col gap-4 rounded-2xl px-6 py-5 sm:flex-row sm:items-center sm:justify-between ${t.box}`}
          >
            <div className="min-w-0">
              <p className={`text-[1.02rem] font-semibold ${t.title}`}>{n.title}</p>
              {n.body && <p className={`mt-1 text-sm leading-relaxed whitespace-pre-line ${t.body}`}>{n.body}</p>}
            </div>
            {n.buttons.length > 0 && (
              <div className="flex shrink-0 flex-wrap gap-2">
                {n.buttons.map((b, i) => (
                  <NoticeButtonLink key={i} button={b} className={b.style === "primary" ? t.primary : t.secondary} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
