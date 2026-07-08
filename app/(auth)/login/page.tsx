"use client";

import { useActionState } from "react";
import { authenticate } from "@/lib/actions/auth";

export default function LoginPage() {
  const [fout, actie, bezig] = useActionState(authenticate, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-5xl" aria-hidden>
            🌿
          </p>
          <h1 className="mt-3 font-heading text-4xl text-moss-deep">De Kas</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Interne werkplaats van Boulder Bloem
          </p>
        </div>
        <form
          action={actie}
          className="rounded-xl border border-sage/60 bg-paper p-6 shadow-sm"
        >
          <label className="block">
            <span className="label">E-mailadres</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="input"
              placeholder="lotte@boulderbloem.nl"
            />
          </label>
          <label className="mt-4 block">
            <span className="label">Wachtwoord</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="input"
            />
          </label>
          {fout && (
            <p role="alert" className="mt-3 text-sm font-semibold text-clay-deep">
              {fout}
            </p>
          )}
          <button
            type="submit"
            disabled={bezig}
            className="mt-5 w-full rounded-lg bg-clay px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-clay-deep disabled:opacity-60"
          >
            {bezig ? "Bezig met inloggen..." : "Inloggen"}
          </button>
        </form>
      </div>
    </main>
  );
}
