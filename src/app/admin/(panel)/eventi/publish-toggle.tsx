"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { togglePublished } from "./actions";

// The list's one-click publish switch, so going live does not need the form.
export function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      title={published ? "Ritira" : "Pubblica"}
      onClick={() =>
        start(async () => {
          const res = await togglePublished(id, !published);
          if (!res.ok) alert(res.error);
          router.refresh();
        })
      }
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
        published
          ? "bg-astra-light text-astra-primary hover:bg-astra-primary hover:text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {pending ? "…" : published ? "Pubblicato" : "Bozza"}
    </button>
  );
}
