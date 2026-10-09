"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Field, Input, Select } from "@/components/admin/ui/field";
import { IN_APP_ROUTES, IN_APP_ROUTE_LABELS, MAX_LINKS, type EventLink } from "@/lib/event-links";

// Port of astra-app's dashboard links editor: buttons at the bottom of the
// event page in the mobile app, each opening a web page or an app screen.
export function LinksEditor({ value, onChange }: { value: EventLink[]; onChange: (next: EventLink[]) => void }) {
  function update(i: number, patch: Partial<EventLink>) {
    const current = value[i];
    const merged = { ...current, ...patch } as EventLink;
    // The two kinds carry different values, so switching resets it.
    if (patch.kind && patch.kind !== current.kind) {
      merged.value = patch.kind === "internal" ? IN_APP_ROUTES[0] : "";
    }
    onChange(value.map((l, j) => (j === i ? merged : l)));
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-800">Pulsanti nell&apos;app</h3>
        <p className="text-xs text-gray-400">
          In fondo alla pagina dell&apos;evento nell&apos;app, in quest&apos;ordine. Aprono una pagina web o una
          schermata dell&apos;app.
        </p>
      </div>

      {value.map((link, i) => (
        <div key={i} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Pulsante {i + 1}</span>
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="text-xs font-medium text-red-600 hover:text-red-700"
            >
              Rimuovi
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Etichetta" required>
              <Input
                value={link.label}
                maxLength={60}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder="es. Prendi il biglietto"
              />
            </Field>
            <Field label="Porta a">
              <Select value={link.kind} onChange={(e) => update(i, { kind: e.target.value as EventLink["kind"] })}>
                <option value="external">Una pagina web</option>
                <option value="internal">Una schermata dell&apos;app</option>
              </Select>
            </Field>
          </div>
          {link.kind === "external" ? (
            <Field label="Indirizzo" hint="Deve iniziare con https://">
              <Input
                value={link.value}
                onChange={(e) => update(i, { value: e.target.value })}
                placeholder="https://www.eventbrite.it/e/..."
              />
            </Field>
          ) : (
            <Field label="Schermata">
              <Select value={link.value} onChange={(e) => update(i, { value: e.target.value } as Partial<EventLink>)}>
                {IN_APP_ROUTES.map((r) => (
                  <option key={r} value={r}>
                    {IN_APP_ROUTE_LABELS[r]}
                  </option>
                ))}
              </Select>
            </Field>
          )}
        </div>
      ))}

      {value.length < MAX_LINKS && (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => onChange([...value, { kind: "external", label: "", value: "" }])}>
            <Plus className="h-4 w-4" /> Link web
          </Button>
          <Button
            variant="secondary"
            onClick={() => onChange([...value, { kind: "internal", label: "", value: IN_APP_ROUTES[0] }])}
          >
            <Plus className="h-4 w-4" /> Schermata app
          </Button>
        </div>
      )}
    </div>
  );
}
