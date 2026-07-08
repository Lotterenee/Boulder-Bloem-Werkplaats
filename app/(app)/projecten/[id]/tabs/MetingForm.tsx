"use client";

import { useState } from "react";
import { createMeting } from "@/lib/actions/metingen";

const SUGGESTIES = [
  "Vogels",
  "Vlinders",
  "Bijen & hommels",
  "Overige insecten",
  "Plantensoorten",
  "Bodemdieren",
];

export default function MetingForm({ projectId }: { projectId: string }) {
  const [rijen, setRijen] = useState([{ soortgroep: "Vogels", aantal: 0 }]);

  function wijzig(i: number, deel: Partial<{ soortgroep: string; aantal: number }>) {
    setRijen((oud) => oud.map((r, idx) => (idx === i ? { ...r, ...deel } : r)));
  }

  return (
    <form
      action={createMeting}
      className="space-y-3"
      onSubmit={() => setTimeout(() => setRijen([{ soortgroep: "Vogels", aantal: 0 }]), 500)}
    >
      <input type="hidden" name="projectId" value={projectId} />
      <input
        type="hidden"
        name="waarnemingen"
        value={JSON.stringify(rijen.filter((r) => r.soortgroep.trim() !== ""))}
      />
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="label">Datum *</span>
          <input name="datum" type="date" required className="input" />
        </label>
        <label className="block">
          <span className="label">Type</span>
          <select name="type" defaultValue="jaartelling" className="input">
            <option value="nulmeting">Nulmeting</option>
            <option value="jaartelling">Jaartelling</option>
          </select>
        </label>
      </div>

      <fieldset>
        <legend className="label">Waarnemingen (soortgroep + aantal)</legend>
        <datalist id="soortgroep-suggesties">
          {SUGGESTIES.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <div className="space-y-2">
          {rijen.map((r, i) => (
            <div key={i} className="flex gap-2">
              <input
                aria-label={`Soortgroep ${i + 1}`}
                value={r.soortgroep}
                list="soortgroep-suggesties"
                onChange={(e) => wijzig(i, { soortgroep: e.target.value })}
                className="input flex-1"
                placeholder="Soortgroep"
              />
              <input
                aria-label={`Aantal ${i + 1}`}
                type="number"
                min="0"
                value={r.aantal}
                onChange={(e) => wijzig(i, { aantal: Number(e.target.value) })}
                className="input w-24"
              />
              <button
                type="button"
                onClick={() => setRijen((oud) => oud.filter((_, idx) => idx !== i))}
                aria-label={`Verwijder rij ${i + 1}`}
                className="px-1 text-ink-soft hover:text-clay-deep"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setRijen((oud) => [...oud, { soortgroep: "", aantal: 0 }])}
          className="mt-2 text-sm font-semibold text-clay-deep hover:underline"
        >
          + Soortgroep toevoegen
        </button>
      </fieldset>

      <label className="block">
        <span className="label">Notities</span>
        <textarea name="notities" rows={2} className="input" />
      </label>

      <button
        type="submit"
        className="rounded-lg bg-clay px-4 py-2 text-sm font-semibold text-white transition hover:bg-clay-deep"
      >
        Meting opslaan
      </button>
    </form>
  );
}
