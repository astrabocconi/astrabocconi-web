"use client";

import { useState, useTransition } from "react";
import "@xyflow/react/dist/style.css";
import { Plus } from "lucide-react";
import { GroupedToggleFlow } from "@/components/flow/grouped-toggle-flow";
import {
  PERMISSION_GROUPS,
  effectivePermissions,
  type AdminUser,
} from "@/lib/auth/permissions";
import { createOperator, setDisabled, updatePermissions } from "./actions";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { Card } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/field";

export function OperatorsEditor({
  operators,
  currentUserId,
  canManage,
}: {
  operators: AdminUser[];
  currentUserId: string;
  canManage: boolean;
}) {
  const [selectedId, setSelectedId] = useState(operators[0]?.user_id ?? null);
  const [draft, setDraft] = useState<string[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selected = operators.find((o) => o.user_id === selectedId) ?? null;
  const isOwner = selected?.role === "owner";
  const value = selected ? (draft ?? effectivePermissions(selected)) : [];
  const dirty = draft !== null;

  function select(id: string) {
    setSelectedId(id);
    setDraft(null);
    setMessage(null);
  }

  function save() {
    if (!selected || !draft) return;
    startTransition(async () => {
      const res = await updatePermissions(selected.user_id, draft);
      setMessage(res.ok ? "Permessi aggiornati" : res.error);
      if (res.ok) setDraft(null);
    });
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="w-full shrink-0 lg:w-72">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Account</h2>
          <span className="text-xs text-gray-400">{operators.length}</span>
        </div>
        <ul className="flex flex-col gap-2">
          {operators.map((o) => (
            <li key={o.user_id}>
              <button
                type="button"
                onClick={() => select(o.user_id)}
                className={`flex w-full items-center gap-3 rounded-2xl border bg-white px-3 py-2.5 text-left shadow-sm transition-all ${
                  o.user_id === selectedId ? "border-astra-accent" : "border-gray-100 hover:border-astra-light"
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-astra-light text-sm font-semibold text-astra-primary">
                  {(o.full_name || o.email).charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-gray-900">{o.full_name || o.email}</span>
                  <span className="mt-0.5 block text-xs text-gray-500">
                    {o.role === "owner" ? "Proprietario" : "Editor"}
                    {o.disabled && <span className="text-red-600"> · disattivato</span>}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        {canManage && <NewOperator />}
      </aside>

      <section className="min-w-0 flex-1">
        {!selected && <p className="text-sm text-gray-500">Nessun operatore.</p>}

        {selected && (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">{selected.full_name || selected.email}</h2>
                  <Badge tone={isOwner ? "brand" : "neutral"}>{isOwner ? "Proprietario" : "Editor"}</Badge>
                </div>
                <p className="text-sm text-gray-500">{selected.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {dirty && (
                  <Button onClick={save} disabled={pending}>
                    {pending ? "Salvataggio…" : "Salva permessi"}
                  </Button>
                )}
                {canManage && selected.user_id !== currentUserId && (
                  <Button
                    variant={selected.disabled ? "secondary" : "danger"}
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const res = await setDisabled(selected.user_id, !selected.disabled);
                        setMessage(res.ok ? null : res.error);
                      })
                    }
                  >
                    {selected.disabled ? "Riattiva" : "Disattiva"}
                  </Button>
                )}
              </div>
            </div>

            {isOwner && (
              <p className="mb-3 rounded-xl bg-astra-light px-4 py-2.5 text-sm text-astra-primary">
                I proprietari hanno sempre tutti i permessi. Per limitare questo account, cambia prima il suo
                ruolo in editor.
              </p>
            )}

            <Card className="p-3!">
              <GroupedToggleFlow
                groups={PERMISSION_GROUPS}
                value={value}
                onChange={setDraft}
                disabled={!canManage || isOwner || pending}
                selectedColor="#04107e"
              />
            </Card>

            {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}
          </>
        )}
      </section>
    </div>
  );
}

function NewOperator() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-600 hover:border-astra-accent hover:text-astra-primary"
      >
        <Plus className="h-4 w-4" />
        Nuovo operatore
      </button>
    );
  }

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          const res = await createOperator(formData);
          if (res.ok) {
            setOpen(false);
            setError(null);
          } else {
            setError(res.error);
          }
        })
      }
      className="mt-3 flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
    >
      <Input name="full_name" placeholder="Nome" />
      <Input name="email" type="email" required placeholder="Email" />
      <Input name="password" type="password" required placeholder="Password provvisoria" />
      <div className="mt-1 flex gap-2">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending ? "Creazione…" : "Crea"}
        </Button>
        <Button variant="secondary" onClick={() => setOpen(false)}>
          Annulla
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
