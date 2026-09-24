"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

// Shared header and footer for every public page. They used to live inside the
// landing page component, which is why every other route rendered without them.

export const NAV = [
  { label: "Chi siamo", href: "/#chi-siamo" },
  { label: "Dispense", href: "/dispense" },
  { label: "Guide", href: "/guide" },
  { label: "Calcolatori", href: "/#calcolatori" },
  { label: "Stella Polare", href: "/stella-polare" },
  { label: "Partner", href: "/#partner" },
];

const FOOTER_EXTRA = [
  { label: "Rappresentanti", href: "#" },
  { label: "Exchange", href: "#" },
  { label: "Contatti", href: "#" },
];

function NavLink({
  href,
  className,
  onClick,
  children,
}: {
  href: string;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  // Plain anchors only for placeholders; anything routable goes through Link so
  // navigation stays client side.
  if (href === "#") {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

export function SiteHeader({ active }: { active?: string }) {
  const [open, setOpen] = useState(false);

  // Below lg the pill is the whole nav, so a route change or an escape press
  // has to close it; nothing else lives on the page to do that for us.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    // -mb-20 cancels the 80px the sticky bar would otherwise reserve in flow,
    // so the page paints its own background all the way to the top and the
    // floating glass pill sits over it. Pages compensate with pt-[104px].
    <header className="sticky top-0 z-50 -mb-20 pt-3">
      <div className="glass-bar mx-auto flex h-[68px] w-[min(1280px,calc(100%-32px))] items-center justify-between px-4 sm:px-5">
        <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
          <Image
            src="/astra-logo-horizontal.png"
            alt="ASTRA Bocconi"
            width={1400}
            height={377}
            priority
            className="h-8 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.label}
              href={item.href}
              className={`nav-link px-4 py-2 text-[0.8rem] font-semibold ${
                item.href === active
                  ? "nav-link--active"
                  : "text-[#51586b] hover:text-astra-primary"
              }`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <a
          href="#"
          className="hidden h-10 items-center gap-2 rounded-full bg-astra-primary px-5 text-[0.8rem] font-semibold text-white transition-colors hover:bg-astra-dark lg:inline-flex"
        >
          Unisciti
          <ArrowRight className="h-3.5 w-3.5" />
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Chiudi il menu" : "Apri il menu"}
          className="flex h-10 w-10 items-center justify-center rounded-full text-astra-primary lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <>
          <button
            type="button"
            aria-label="Chiudi il menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-[92px] z-40 bg-astra-dark/20 backdrop-blur-[2px] lg:hidden"
          />
          <nav
            id="mobile-nav"
            className="glass-bar absolute inset-x-4 top-[76px] z-50 flex flex-col gap-1 p-3 lg:hidden"
          >
            {NAV.map((item) => (
              <NavLink
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-3 text-[0.95rem] font-semibold ${
                  item.href === active
                    ? "bg-astra-light text-astra-primary"
                    : "text-[#51586b] hover:bg-astra-light hover:text-astra-primary"
                }`}
              >
                {item.label}
              </NavLink>
            ))}
            <a
              href="#"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-astra-primary px-5 text-[0.9rem] font-semibold text-white"
            >
              Unisciti
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </nav>
        </>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-astra-primary/10 bg-white">
      <div className="mx-auto flex w-[min(1280px,calc(100%-48px))] flex-col gap-8 py-14 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Image
            src="/astra-logo-horizontal.png"
            alt="ASTRA Bocconi"
            width={1400}
            height={377}
            className="h-8 w-auto"
          />
          <p className="mt-4 max-w-xs text-sm text-[#6b7280]">
            Associazione studentesca dell&apos;Università Bocconi.
          </p>
        </div>

        <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm text-[#545d70] sm:grid-cols-3">
          {[...NAV, ...FOOTER_EXTRA].map((item) => (
            <NavLink
              key={item.label}
              href={item.href}
              className="hover:text-astra-primary"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-astra-primary/8">
        <div className="mx-auto w-[min(1280px,calc(100%-48px))] py-5 text-xs text-[#8a90a2]">
          © {new Date().getFullYear()} ASTRA Bocconi
        </div>
      </div>
    </footer>
  );
}
