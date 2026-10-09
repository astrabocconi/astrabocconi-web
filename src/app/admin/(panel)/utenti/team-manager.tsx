"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { Field, Input } from "@/components/admin/ui/field";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { PermissionFlow } from "@/components/admin/permission-flow";
import { ALL_PERMISSIONS, PERMISSION_GROUPS, type AdminRole } from "@/lib/auth/permissions";
import { createOperator, deleteOperator, setDisabled, updateOperator } from "./actions";

export type OperatorRow = {
  userId: string;
  email: string;
  fullName: string | null;
  role: AdminRole;
  permissions: string[];
  disabled: boolean;
  createdAt: string;
  lastSignInAt: string | null;
};

type Viewer = { userId: string; role: AdminRole; canManage: boolean };

const dateFmt = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short", year: "numeric" });

// Port of astra-app's team page: a role switch instead of the app's two
// presets, because here "everything" is a real role (owner) rather than a full
// tick list, and the flow underneath for an editor's individual permissions.
function Access({
  role,
  permissions,
  onRole,
  onPermissions,
  canOwner,
  lockRole,
  disabled,
}: {
  role: AdminRole;
  permissions: string[];
  onRole: (r: AdminRole) => void;
  onPermissions: (p: string[]) => void;
  canOwner: boolean;
  lockRole: boolean;
  disabled?: boolean;
}) {
  const owner = role === "owner";
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={owner ? "primary" : "secondary"}
          disabled={disabled || lockRole || !canOwner}
          onClick={() => onRole("owner")}
          title={canOwner ? undefined : "Solo un proprietario può nominare un proprietario"}
        >
          Proprietario · tutto
        </Button>
        <Button variant={!owner ? "primary" : "secondary"} disabled={disabled || lockRole} onClick={() => onRole("editor")}>
          Editor · scegli i permessi
        </Button>
        {!owner && (
          <>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onPermissions(ALL_PERMISSIONS)}
              className="px-2 text-xs font-medium text-astra-primary hover:text-astra-accent disabled:opacity-50"
            >
              Seleziona tutti
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onPermissions([])}
              className="px-2 text-xs font-medium text-gray-500 hover:text-gray-800 disabled:opacity-50"
            >
              Nessuno
            </button>
          </>
        )}
        <span className="ml-auto text-xs text-gray-400">
          {owner ? "Tutti i permessi, anche quelli futuri" : `${permissions.length} di ${ALL_PERMISSIONS.length} permessi`}
        </span>
      </div>
      {owner ? (
        <p className="rounded-xl bg-astra-light px-4 py-3 text-sm text-astra-primary">
          Un proprietario può fare tutto: ogni sezione, ogni eliminazione, gli operatori e gli altri proprietari.
        </p>
      ) : (
        <PermissionFlow value={permissions} onChange={onPermissions} disabled={disabled} />
      )}
    </div>
  );
}

function CreateForm({ viewer, onDone }: { viewer: Viewer; onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("editor");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await createOperator({ email, fullName, password, role, permissions });
      if (!res.ok) return setError(res.error);
      onDone();
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Email" required hint="È quello che scrive per entrare.">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" required />
        </Field>
        <Field label="Nome" hint="Compare nel registro attività.">
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Giulia Rossi" autoComplete="off" />
        </Field>
        <Field label="Password" required hint="Almeno 12 caratteri. Mandagliela tu.">
          <Input value={password} onChange={(e) => setPassword(e.target.value)} type="text" autoComplete="new-password" required />
        </Field>
      </div>

      <Access
        role={role}
        permissions={permissions}
        onRole={setRole}
        onPermissions={setPermissions}
        canOwner={viewer.role === "owner"}
        lockRole={false}
        disabled={pending}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Creazione…" : "Crea account"}
        </Button>
        <Button variant="secondary" onClick={onDone} disabled={pending}>
          Annulla
        </Button>
      </div>
    </form>
  );
}

function AccountCard({ account, viewer, onChanged }: { account: OperatorRow; viewer: Viewer; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(account.email);
  const [fullName, setFullName] = useState(account.fullName ?? "");
  const [role, setRole] = useState(account.role);
  const [permissions, setPermissions] = useState(account.permissions);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const self = account.userId === viewer.userId;
  const isOwner = account.role === "owner";
  // Owners are managed only by owners; that rule is enforced again server side.
  const editable = viewer.canManage && (!isOwner || viewer.role === "owner");

  const dirty =
    email !== account.email ||
    fullName !== (account.fullName ?? "") ||
    role !== account.role ||
    password.length > 0 ||
    (role === "editor" && [...permissions].sort().join() !== [...account.permissions].sort().join());

  function run(fn: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setError(null);
    start(async () => {
      const res = await fn();
      if (!res.ok) return setError(res.error);
      setPassword("");
      onChanged();
    });
  }

  const granted = isOwner ? PERMISSION_GROUPS : PERMISSION_GROUPS.filter((g) => g.items.some((i) => account.permissions.includes(i.key)));
  const name = account.fullName || account.email;

  return (
    <div className={`rounded-2xl border bg-white shadow-sm ${open ? "border-astra-light" : "border-gray-100"}`}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center gap-3 px-5 py-4 text-left">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold uppercase ${
            account.disabled ? "bg-gray-100 text-gray-400" : "bg-astra-light text-astra-primary"
          }`}
        >
          {name.charAt(0)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className={`font-medium ${account.disabled ? "text-gray-400 line-through" : "text-gray-900"}`}>{name}</span>
            {isOwner ? (
              <Badge tone="brand">Proprietario</Badge>
            ) : account.permissions.length === ALL_PERMISSIONS.length ? (
              <Badge tone="brand">Tutti i permessi</Badge>
            ) : account.permissions.length === 0 ? (
              <Badge tone="neutral">Nessun accesso</Badge>
            ) : (
              <Badge tone="neutral">{account.permissions.length} permessi</Badge>
            )}
            {account.disabled && <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">Disattivato</span>}
            {self && <Badge tone="neutral">Tu</Badge>}
          </span>
          <span className="block truncate text-sm text-gray-500">
            {account.fullName ? `${account.email} · ` : ""}
            {granted.length > 0 ? granted.map((g) => g.label).join(", ") : "niente assegnato"}
          </span>
        </span>
        <span className="hidden shrink-0 text-xs text-gray-400 sm:block">
          {account.lastSignInAt ? `ultimo accesso ${dateFmt.format(new Date(account.lastSignInAt))}` : "mai entrato"}
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-5 border-t border-gray-100 px-5 py-5">
          {!editable && (
            <p className="rounded-xl bg-gray-50 px-4 py-2.5 text-sm text-gray-500">
              {viewer.canManage ? "Solo un proprietario può modificare un proprietario." : "Non hai il permesso di gestire gli operatori."}
            </p>
          )}

          <Access
            role={role}
            permissions={role === "owner" ? ALL_PERMISSIONS : permissions}
            onRole={(r) => {
              setRole(r);
              if (r === "editor" && isOwner) setPermissions(ALL_PERMISSIONS);
            }}
            onPermissions={setPermissions}
            canOwner={viewer.role === "owner"}
            lockRole={self}
            disabled={!editable || pending}
          />

          {editable && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Nome">
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="off" />
              </Field>
              <Field label="Email" hint="Cambiarla cambia anche l'accesso.">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
              </Field>
              <Field label="Nuova password" hint="Vuoto per lasciare quella attuale.">
                <Input value={password} onChange={(e) => setPassword(e.target.value)} type="text" autoComplete="new-password" />
              </Field>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          {editable && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                disabled={pending || !dirty}
                onClick={() => run(() => updateOperator(account.userId, { email, fullName, role, permissions, password }))}
              >
                {pending ? "Salvataggio…" : "Salva modifiche"}
              </Button>
              {dirty && (
                <Button
                  variant="secondary"
                  disabled={pending}
                  onClick={() => {
                    setEmail(account.email);
                    setFullName(account.fullName ?? "");
                    setRole(account.role);
                    setPermissions(account.permissions);
                    setPassword("");
                  }}
                >
                  Annulla
                </Button>
              )}
              {!self && (
                <div className="ml-auto flex gap-2">
                  <Button variant="secondary" disabled={pending} onClick={() => run(() => setDisabled(account.userId, !account.disabled))}>
                    {account.disabled ? "Riattiva" : "Disattiva"}
                  </Button>
                  <Button
                    variant="danger"
                    disabled={pending}
                    onClick={() => {
                      if (
                        confirm(
                          `Eliminare ${name}? L'account viene cancellato e non potrà più entrare. Quello che ha pubblicato resta, e resta nel registro attività.`,
                        )
                      )
                        run(() => deleteOperator(account.userId));
                    }}
                  >
                    Elimina
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TeamManager({ accounts, viewer }: { accounts: OperatorRow[]; viewer: Viewer }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const refresh = useCallback(() => {
    setCreating(false);
    router.refresh();
  }, [router]);

  return (
    <div className="flex flex-col gap-4">
      {viewer.canManage &&
        (creating ? (
          <CreateForm viewer={viewer} onDone={refresh} />
        ) : (
          <div>
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" /> Nuovo operatore
            </Button>
          </div>
        ))}

      {accounts.length === 0 && !creating ? (
        <EmptyState
          icon={<ShieldCheck className="h-7 w-7" />}
          title="Nessun operatore"
          description="Crea un account per ogni persona che lavora sul sito, con solo i permessi che le servono."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {accounts.map((a) => (
            // Keyed on what was saved so the card resets after a refresh.
            <AccountCard
              key={`${a.userId}:${a.role}:${a.disabled}:${a.email}:${a.fullName}:${a.permissions.join(",")}`}
              account={a}
              viewer={viewer}
              onChanged={refresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
