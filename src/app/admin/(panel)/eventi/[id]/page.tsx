import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/lib/auth/operator";
import { getEvent } from "@/lib/events-admin";
import { ASTRA_APP_URL } from "@/lib/events";
import { isoToRomeLocal } from "@/lib/site-content";
import { PageHeader } from "@/components/admin/ui/page-header";
import { EventForm } from "../event-form";
import type { EventFormInput } from "../actions";

export const metadata = { title: "Evento" };

const EMPTY: EventFormInput = {
  title: "",
  description: "",
  location: "",
  startsAt: "",
  endsAt: "",
  externalTicketUrl: "",
  imageUrl: "",
  published: false,
  links: [],
};

export default async function EventPage({ params }: PageProps<"/admin/eventi/[id]">) {
  const { id } = await params;
  const op = await requirePermission("events:write");

  let value = EMPTY;
  let hasAppDiscount = false;
  if (id !== "nuovo") {
    const e = await getEvent(id);
    if (!e) notFound();
    hasAppDiscount = e.hasAppDiscount;
    value = {
      id: e.id,
      title: e.title,
      description: e.description ?? "",
      location: e.location ?? "",
      startsAt: isoToRomeLocal(e.startsAt),
      endsAt: isoToRomeLocal(e.endsAt),
      externalTicketUrl: e.externalTicketUrl ?? "",
      imageUrl: e.coverImageKey ?? "",
      published: e.published,
      links: e.links,
    };
  }

  return (
    <>
      <Link
        href="/admin/eventi"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-astra-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Tutti gli eventi
      </Link>
      <PageHeader
        title={value.id ? "Modifica evento" : "Nuovo evento"}
        subtitle="Un solo evento per il sito e per l'app: si salva nel database dell'app."
      />
      <EventForm
        initial={value}
        appUrl={ASTRA_APP_URL}
        canDelete={op.can("events:delete")}
        hasAppDiscount={hasAppDiscount}
      />
    </>
  );
}
