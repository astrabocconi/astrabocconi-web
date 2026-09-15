"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AstraLogo } from "@/components/ui/logo";
import { createClient } from "@/lib/supabase/client";

const CLICKS_TO_REVEAL = 7;

export default function AdminGate() {
  const router = useRouter();
  const [clicks, setClicks] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [needsBootstrap, setNeedsBootstrap] = useState<boolean | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clicks >= CLICKS_TO_REVEAL) setRevealed(true);
  }, [clicks]);

  useEffect(() => {
    if (!revealed) return;
    fetch("/api/admin/bootstrap")
      .then((r) => r.json())
      .then((d) => setNeedsBootstrap(Boolean(d.needsBootstrap)))
      .catch(() => setNeedsBootstrap(false));
  }, [revealed]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    router.replace("/admin/utenti");
    router.refresh();
  }

  async function bootstrap(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/bootstrap", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, secret }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Creazione non riuscita");
      setBusy(false);
      return;
    }
    setNeedsBootstrap(false);
    setSecret("");
    setBusy(false);
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-linear-to-b from-astra-light to-white px-6">
      <AstraLogo className="h-12 w-12 text-astra-primary" />

      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-astra-primary">
        As
        <span
          onClick={() => setClicks((c) => c + 1)}
          className="cursor-default select-none"
          aria-hidden="true"
        >
          t
        </span>
        ra Bocconi
      </h1>
      <p className="mt-2 text-sm text-gray-500">Il nuovo sito è in costruzione.</p>

      {revealed && (
        <div className="mt-10 w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          {needsBootstrap === null && (
            <p className="text-sm text-gray-500">Verifica in corso…</p>
          )}

          {needsBootstrap === true && (
            <form onSubmit={bootstrap} className="flex flex-col gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Primo accesso
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Non esiste ancora nessun operatore. Crea il primo account
                  proprietario.
                </p>
              </div>
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                autoComplete="username"
              />
              <Field
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
              />
              <Field
                label="Codice di attivazione"
                type="password"
                value={secret}
                onChange={setSecret}
                autoComplete="off"
              />
              <Submit busy={busy} label="Crea account proprietario" />
              {error && <Error message={error} />}
            </form>
          )}

          {needsBootstrap === false && (
            <form onSubmit={signIn} className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-gray-900">Accedi</h2>
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                autoComplete="username"
              />
              <Field
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
              />
              <Submit busy={busy} label="Entra" />
              {error && <Error message={error} />}
            </form>
          )}
        </div>
      )}
    </main>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <input
        type={type}
        value={value}
        required
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-astra-accent"
      />
    </label>
  );
}

function Submit({ busy, label }: { busy: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="mt-1 rounded-xl bg-astra-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-astra-dark disabled:opacity-60"
    >
      {busy ? "Attendere…" : label}
    </button>
  );
}

function Error({ message }: { message: string }) {
  return <p className="text-xs text-red-600">{message}</p>;
}
