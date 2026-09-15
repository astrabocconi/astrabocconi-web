"use client";

import { useState, useTransition } from "react";
import "@xyflow/react/dist/style.css";
import { GroupedToggleFlow } from "@/components/flow/grouped-toggle-flow";
import {
  PERMISSION_GROUPS,
  effectivePermissions,
  type AdminUser,
} from "@/lib/auth/permissions";
import { AstraLogo } from "@/components/ui/logo";
import { createOperator, setDisabled, signOut, updatePermissions } from "./actions";

export function OperatorsEditor({
  operators,
  currentUserId,
  canManage,
}: {
  operators: AdminUser[];
  currentUserId: string;
  canManage: boolean;
}) {
  const [selectedId, setSelectedId] = useState(
    operators[0]?.user_id ?? null,
  );
  const [draft, setDraft] = useState<string[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selected = operators.find((o) => o.user_id === selectedId) ?? null;
  const isOwner = selected?.role === "owner";
  const value = selected
    ? (draft ?? effectivePermissions(selected))
    : [];
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
    <div className="flex flex-1 flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center gap-2.5">
          <AstraLogo className="h-6 w-6 text-astra-primary" />
          <span className="text-sm font-semibold text-gray-900">
            Backoffice
          </span>
          <span className="rounded-full bg-astra-light px-2 py-0.5 text-xs font-medium text-astra-primary">
            Operatori
          </span>
        </div>
        <form action={signOut}>
          <button className="text-xs font-medium text-gray-500 hover:text-gray-900">
            Esci
          </button>
        </form>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-72">
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Operatori
          </h2>
          <ul className="flex flex-col gap-1">
            {operators.map((o) => (
              <li key={o.user_id}>
                <button
                  onClick={() => select(o.user_id)}
                  className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    o.user_id === selectedId
                      ? "border-astra-accent bg-white"
                      : "border-transparent hover:bg-white"
                  }`}
                >
                  <span className="block truncate text-sm font-medium text-gray-900">
                    {o.full_name || o.email}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5">
                    <span className="text-xs text-gray-500">
                      {o.role === "owner" ? "Proprietario" : "Editor"}
                    </span>
                    {o.disabled && (
                      <span className="rounded bg-red-50 px-1.5 text-xs text-red-600">
                        disattivato
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {canManage && <NewOperator />}
        </aside>

        <section className="min-w-0 flex-1">
          {!selected && (
            <p className="text-sm text-gray-500">Nessun operatore.</p>
          )}

          {selected && (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    {selected.full_name || selected.email}
                  </h2>
                  <p className="text-xs text-gray-500">{selected.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {dirty && (
                    <button
                      onClick={save}
                      disabled={pending}
                      className="rounded-xl bg-astra-primary px-4 py-2 text-sm font-medium text-white hover:bg-astra-dark disabled:opacity-60"
                    >
                      {pending ? "Salvataggio…" : "Salva permessi"}
                    </button>
                  )}
                  {canManage && selected.user_id !== currentUserId && (
                    <button
                      onClick={() =>
                        startTransition(async () => {
                          const res = await setDisabled(
                            selected.user_id,
                            !selected.disabled,
                          );
                          setMessage(res.ok ? null : res.error);
                        })
                      }
                      disabled={pending}
                      className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-60"
                    >
                      {selected.disabled ? "Riattiva" : "Disattiva"}
                    </button>
                  )}
                </div>
              </div>

              {isOwner && (
                <p className="mb-3 rounded-xl bg-astra-light px-3 py-2 text-xs text-astra-primary">
                  I proprietari hanno sempre tutti i permessi. Per limitare
                  questo account, cambia prima il suo ruolo in editor.
                </p>
              )}

              <div className="rounded-2xl border border-gray-200 bg-white p-3">
                <GroupedToggleFlow
                  groups={PERMISSION_GROUPS}
                  value={value}
                  onChange={setDraft}
                  disabled={!canManage || isOwner || pending}
                  selectedColor="#04107e"
                />
              </div>

              {message && (
                <p className="mt-3 text-xs text-gray-600">{message}</p>
              )}
            </>
          )}
        </section>
      </div>
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
        onClick={() => setOpen(true)}
        className="mt-3 w-full rounded-xl border border-dashed border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-600 hover:border-astra-accent hover:text-astra-primary"
      >
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
      className="mt-3 flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3"
    >
      <input
        name="full_name"
        placeholder="Nome"
        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:border-astra-accent"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Email"
        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:border-astra-accent"
      />
      <input
        name="password"
        type="password"
        required
        placeholder="Password provvisoria"
        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:border-astra-accent"
      />
      <div className="flex gap-2">
        <button
          disabled={pending}
          className="flex-1 rounded-lg bg-astra-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-astra-dark disabled:opacity-60"
        >
          {pending ? "Creazione…" : "Crea"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600"
        >
          Annulla
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}
