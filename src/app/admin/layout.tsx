import type { Metadata } from "next";
import { Shell } from "@/app/shell";

export const metadata: Metadata = {
  title: { default: "ASTRA Bocconi", template: "%s | ASTRA Bocconi" },
  robots: { index: false },
};

// The backoffice stays Italian: its operators are the committee.
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <Shell lang="it">{children}</Shell>;
}
