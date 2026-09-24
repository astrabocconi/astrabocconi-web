import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ASTRA_8BIT_LOGO } from "@/lib/astra-8bit-logo";

// Umami analytics. Written as plain tags in <head> rather than next/script:
// its beforeInteractive strategy emits a preload plus its own client loader,
// not the literal <script defer> these need to be.
const UMAMI_HOST = "https://umami-analytics-five-rosy.vercel.app";
const UMAMI_WEBSITE_ID = "5c78b384-2637-4c6e-bf5c-7702adc44f97";

// An easter egg for anyone reading view-source: an 8-bit rendering of the
// ASTRA star, wrapped in a real HTML comment via dangerouslySetInnerHTML
// (JSX comments compile away and never reach the output).
const ASCII_LOGO = `
                    █
                   ███
                ███████
              █████████████
                ███████
                   ███
                    █

       ███   ████ █████ ████   ███
      █   █ █       █   █   █ █   █
      █████  ███    █   ████  █████
      █   █     █   █   █ █   █   █
      █   █ ████    █   █  █  █   █

████   ███   ████  ████  ███  █   █ █████
█   █ █   █ █     █     █   █ ██  █   █
████  █   █ █     █     █   █ █ █ █   █
█   █ █   █ █     █     █   █ █  ██   █
████   ███   ████  ████  ███  █   █ █████

          per aspera, ad astra
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ASTRA Bocconi",
    template: "%s | ASTRA Bocconi",
  },
  description:
    "ASTRA Bocconi: dispense, guide, calcolatori e risorse per gli studenti dell'Università Bocconi.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          defer
          src={`${UMAMI_HOST}/script.js`}
          data-website-id={UMAMI_WEBSITE_ID}
        />
        <script
          defer
          src={`${UMAMI_HOST}/recorder.js`}
          data-website-id={UMAMI_WEBSITE_ID}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <div aria-hidden="true" dangerouslySetInnerHTML={{ __html: `<!--${ASCII_LOGO}-->` }} />
        {/* The real thing, not just ASCII: same easter egg, an actual 8-bit
            ASTRA wordmark, invisible on the page but sitting in the source
            and inline-previewable from devtools. */}
        {/* next/image would proxy this through the optimiser for no benefit:
            it's already a tiny inline data URI, not a network request. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ASTRA_8BIT_LOGO} alt="" aria-hidden="true" width={512} height={131} className="sr-only" />
        {children}
      </body>
    </html>
  );
}
