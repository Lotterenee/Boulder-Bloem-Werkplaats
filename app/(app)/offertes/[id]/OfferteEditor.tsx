"use client";

import { useState, useTransition } from "react";
import { updateOfferte, deleteOfferte } from "@/lib/actions/offertes";
import { berekenTotalen, BTW_PCT, type OfferteRegel } from "@/lib/domain/btw";
import { OFFERTE_STATUS_LABELS } from "@/lib/labels";

function euro(n: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

type Props = {
  offerte: {
    id: string;
    offertenummer: string;
    datum: string;
    status: string;
    rolafbakening: string;
    regels: OfferteRegel[];
  };
  project: { naam: string; locatieadres: string | null };
  klant: {
    organisatie: string;
    contactpersoon: string | null;
    adres: string | null;
    plaats: string | null;
  };
};

export default function OfferteEditor({ offerte, project, klant }: Props) {
  const [regels, setRegels] = useState<OfferteRegel[]>(offerte.regels);
  const [status, setStatus] = useState(offerte.status);
  const [rolafbakening, setRolafbakening] = useState(offerte.rolafbakening);
  const [opgeslagen, setOpgeslagen] = useState(false);
  const [bezig, startTransition] = useTransition();

  const totalen = berekenTotalen(regels);

  function wijzigRegel(index: number, deel: Partial<OfferteRegel>) {
    setOpgeslagen(false);
    setRegels((oud) => oud.map((r, i) => (i === index ? { ...r, ...deel } : r)));
  }

  function verwijderRegel(index: number) {
    setOpgeslagen(false);
    setRegels((oud) => oud.filter((_, i) => i !== index));
  }

  function nieuweRegel() {
    setOpgeslagen(false);
    setRegels((oud) => [
      ...oud,
      { omschrijving: "", aantal: 1, stuksprijs: 0, btwPct: BTW_PCT },
    ]);
  }

  function opslaan() {
    const fd = new FormData();
    fd.set("regels", JSON.stringify(regels.filter((r) => r.omschrijving.trim() !== "")));
    fd.set("status", status);
    fd.set("rolafbakening", rolafbakening);
    startTransition(async () => {
      await updateOfferte(offerte.id, fd);
      setOpgeslagen(true);
    });
  }

  const datum = new Date(offerte.datum).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-4xl">
      {/* Documentweergave (ook de printversie) */}
      <div className="rounded-xl border border-sage/60 bg-paper p-8 shadow-sm print:border-0 print:p-0 print:shadow-none">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="font-heading text-3xl text-moss-deep">Boulder Bloem</p>
            <p className="text-sm text-ink-soft">
              Ecologische natuurspeelplekken
            </p>
          </div>
          <div className="text-right text-sm">
            <p className="font-heading text-xl text-moss-deep">Offerte</p>
            <p className="font-semibold">{offerte.offertenummer}</p>
            <p className="text-ink-soft">{datum}</p>
          </div>
        </div>

        <div className="mb-8 text-sm">
          <p className="font-bold uppercase tracking-wide text-ink-soft">Voor</p>
          <p className="font-semibold">{klant.organisatie}</p>
          {klant.contactpersoon && <p>t.a.v. {klant.contactpersoon}</p>}
          {klant.adres && <p>{klant.adres}</p>}
          {klant.plaats && <p>{klant.plaats}</p>}
          <p className="mt-2 text-ink-soft">
            Project: {project.naam}
            {project.locatieadres && ` · ${project.locatieadres}`}
          </p>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-moss-deep text-xs uppercase tracking-wide text-ink-soft">
              <th className="py-2 pr-2">Omschrijving</th>
              <th className="w-20 py-2 pr-2 text-right">Aantal</th>
              <th className="w-28 py-2 pr-2 text-right">Stuksprijs</th>
              <th className="w-20 py-2 pr-2 text-right">Btw %</th>
              <th className="w-28 py-2 text-right">Bedrag excl.</th>
              <th className="no-print w-8" aria-hidden></th>
            </tr>
          </thead>
          <tbody>
            {regels.map((r, i) => (
              <tr key={i} className="border-b border-sage/40 align-top">
                <td className="py-1.5 pr-2">
                  <input
                    aria-label={`Omschrijving regel ${i + 1}`}
                    value={r.omschrijving}
                    onChange={(e) => wijzigRegel(i, { omschrijving: e.target.value })}
                    className="w-full rounded border border-transparent bg-transparent px-1 py-1 hover:border-sage focus:border-sage print:border-0"
                  />
                </td>
                <td className="py-1.5 pr-2 text-right">
                  <input
                    aria-label={`Aantal regel ${i + 1}`}
                    type="number"
                    min="0"
                    step="1"
                    value={r.aantal}
                    onChange={(e) => wijzigRegel(i, { aantal: Number(e.target.value) })}
                    className="w-full rounded border border-transparent bg-transparent px-1 py-1 text-right hover:border-sage focus:border-sage"
                  />
                </td>
                <td className="py-1.5 pr-2 text-right">
                  <input
                    aria-label={`Stuksprijs regel ${i + 1}`}
                    type="number"
                    step="0.01"
                    value={r.stuksprijs}
                    onChange={(e) => wijzigRegel(i, { stuksprijs: Number(e.target.value) })}
                    className="w-full rounded border border-transparent bg-transparent px-1 py-1 text-right hover:border-sage focus:border-sage"
                  />
                </td>
                <td className="py-1.5 pr-2 text-right">
                  <input
                    aria-label={`Btw-percentage regel ${i + 1}`}
                    type="number"
                    min="0"
                    max="100"
                    value={r.btwPct}
                    onChange={(e) => wijzigRegel(i, { btwPct: Number(e.target.value) })}
                    className="w-full rounded border border-transparent bg-transparent px-1 py-1 text-right hover:border-sage focus:border-sage"
                  />
                </td>
                <td className="py-1.5 text-right font-semibold">
                  {euro(r.aantal * r.stuksprijs)}
                </td>
                <td className="no-print text-right">
                  <button
                    type="button"
                    onClick={() => verwijderRegel(i)}
                    aria-label={`Verwijder regel ${i + 1}`}
                    className="px-1 text-ink-soft hover:text-clay-deep"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="no-print mt-2">
          <button
            type="button"
            onClick={nieuweRegel}
            className="text-sm font-semibold text-clay-deep hover:underline"
          >
            + Regel toevoegen
          </button>
        </div>

        <div className="mt-6 ml-auto w-64 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Totaal excl. btw</span>
            <span className="font-semibold">{euro(totalen.totaalExcl)}</span>
          </div>
          <div className="flex justify-between text-ink-soft">
            <span>Btw</span>
            <span>{euro(totalen.totaalBtw)}</span>
          </div>
          <div className="flex justify-between border-t-2 border-moss-deep pt-1 text-base font-bold text-moss-deep">
            <span>Totaal incl. btw</span>
            <span>{euro(totalen.totaalIncl)}</span>
          </div>
        </div>

        <div className="mt-8 border-t border-sage/40 pt-4 text-xs leading-relaxed text-ink-soft">
          <textarea
            aria-label="Rolafbakening en aansprakelijkheid"
            value={rolafbakening}
            onChange={(e) => {
              setRolafbakening(e.target.value);
              setOpgeslagen(false);
            }}
            rows={10}
            className="no-print w-full rounded border border-transparent bg-transparent p-1 hover:border-sage focus:border-sage"
          />
          <div className="hidden whitespace-pre-wrap print:block">{rolafbakening}</div>
        </div>
      </div>

      {/* Werkbalk */}
      <div className="no-print mt-4 flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold">
          Status{" "}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setOpgeslagen(false);
            }}
            className="input ml-1 inline-block w-auto"
          >
            {Object.entries(OFFERTE_STATUS_LABELS).map(([w, l]) => (
              <option key={w} value={w}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={opslaan}
          disabled={bezig}
          className="rounded-lg bg-clay px-4 py-2 text-sm font-semibold text-white transition hover:bg-clay-deep disabled:opacity-60"
        >
          {bezig ? "Opslaan..." : "Opslaan"}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg border border-sage px-4 py-2 text-sm font-semibold text-moss-deep transition hover:bg-sage-light"
        >
          Print / PDF
        </button>
        {opgeslagen && (
          <span role="status" className="text-sm font-semibold text-moss">
            Opgeslagen ✓
          </span>
        )}
        <button
          type="button"
          onClick={() => {
            if (confirm("Offerte definitief verwijderen?")) {
              startTransition(() => deleteOfferte(offerte.id));
            }
          }}
          className="ml-auto text-sm font-semibold text-ink-soft hover:text-clay-deep"
        >
          Verwijderen
        </button>
      </div>
    </div>
  );
}
