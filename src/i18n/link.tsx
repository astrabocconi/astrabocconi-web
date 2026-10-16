"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { withLocale } from "@/i18n/config";
import { useLang } from "@/i18n/locale-context";

type Props = Omit<ComponentProps<typeof NextLink>, "href"> & { href: string };

/** Drop-in for next/link on the public site: keeps the visitor in their language. */
export default function Link({ href, ...rest }: Props) {
  return <NextLink href={withLocale(useLang(), href)} {...rest} />;
}
