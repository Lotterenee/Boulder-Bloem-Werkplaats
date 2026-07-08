"use client";

import { useActionState } from "react";
import { wijzigWachtwoord } from "@/lib/actions/auth";

export default function WachtwoordForm() {
  const [state, actie, bezig] = useActionState(wijzigWachtwoord, undefined);

  return (
    <form action={actie} className="space-y-3">
      <label className="block">
        <span className="label">Huidig wachtwoord</span>
        <input name="huidig" type="password" required className="input" autoComplete="current-password" />
      </label>
      <label className="block">
        <span className="label">Nieuw wachtwoord (min. 10 tekens)</span>
        <input name="nieuw" type="password" required minLength={10} className="input" autoComplete="new-password" />
      </label>
      <label className="block">
        <span className="label">Herhaal nieuw wachtwoord</span>
        <input name="herhaal" type="password" required className="input" autoComplete="new-password" />
      </label>
      {state?.fout && (
        <p role="alert" className="text-sm font-semibold text-clay-deep">
          {state.fout}
        </p>
      )}
      {state?.ok && (
        <p role="status" className="text-sm font-semibold text-moss">
          Wachtwoord gewijzigd.
        </p>
      )}
      <button
        type="submit"
        disabled={bezig}
        className="rounded-lg bg-clay px-4 py-2 text-sm font-semibold text-white transition hover:bg-clay-deep disabled:opacity-60"
      >
        {bezig ? "Bezig..." : "Wijzig wachtwoord"}
      </button>
    </form>
  );
}
