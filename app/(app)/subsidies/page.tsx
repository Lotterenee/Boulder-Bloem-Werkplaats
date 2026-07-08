import Link from "next/link";
import type { SubsidieNiveau, RegelingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  SUBSIDIE_NIVEAU_LABELS,
  REGELING_STATUS_LABELS,
  fmtEuro,
  fmtDatum,
  checkKleur,
} from "@/lib/labels";
import {
  PageHeader,
  LinkButton,
  Card,
  Badge,
  TrafficLight,
  EmptyState,
  type BadgeTint,
} from "@/components/ui";

export const dynamic = "force-dynamic";

const statusTint: Record<RegelingStatus, BadgeTint> = {
  open: "moss",
  gesloten: "grijs",
  onzeker: "clay",
};

export default async function SubsidiesPage({
  searchParams,
}: {
  searchParams: Promise<{ niveau?: string; status?: string; zoek?: string }>;
}) {
  const { niveau, status, zoek } = await searchParams;
  const niveauFilter =
    niveau && niveau in SUBSIDIE_NIVEAU_LABELS ? (niveau as SubsidieNiveau) : undefined;
  const statusFilter =
    status && status in REGELING_STATUS_LABELS ? (status as RegelingStatus) : undefined;

  const subsidies = await prisma.subsidie.findMany({
    where: {
      ...(niveauFilter ? { niveau: niveauFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(zoek
        ? {
            OR: [
              { naam: { contains: zoek, mode: "insensitive" } },
              { verstrekker: { contains: zoek, mode: "insensitive" } },
              { regio: { contains: zoek, mode: "insensitive" } },
              { doelgroep: { contains: zoek, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ status: "asc" }, { naam: "asc" }],
  });

  return (
    <>
      <PageHeader
        titel="Subsidieradar"
        sub="Regelingen voor natuurspeelplekken en groene schoolpleinen. Bedragen en deadlines wijzigen jaarlijks: vertrouw op de kleurcode en check de bron."
      >
        <LinkButton href="/subsidies/nieuw">+ Nieuwe regeling</LinkButton>
      </PageHeader>

      <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="label">Zoeken</span>
          <input
            name="zoek"
            defaultValue={zoek ?? ""}
            placeholder="Naam, verstrekker, regio..."
            className="input w-56"
          />
        </label>
        <label className="block">
          <span className="label">Niveau</span>
          <select name="niveau" defaultValue={niveau ?? ""} className="input w-40">
            <option value="">Alle niveaus</option>
            {Object.entries(SUBSIDIE_NIVEAU_LABELS).map(([w, l]) => (
              <option key={w} value={w}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Status</span>
          <select name="status" defaultValue={status ?? ""} className="input w-36">
            <option value="">Alle</option>
            {Object.entries(REGELING_STATUS_LABELS).map(([w, l]) => (
              <option key={w} value={w}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-lg border border-sage px-4 py-2 text-sm font-semibold text-moss-deep hover:bg-sage-light"
        >
          Filter
        </button>
      </form>

      {subsidies.length === 0 ? (
        <EmptyState titel="Geen regelingen gevonden" tekst="Pas de filters aan of voeg een regeling toe." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-sage/60 text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-4 py-3" title="Kleurcode laatst gecheckt">
                  Check
                </th>
                <th className="px-4 py-3">Regeling</th>
                <th className="px-4 py-3">Niveau</th>
                <th className="px-4 py-3">Regio</th>
                <th className="px-4 py-3 text-right">Max bedrag</th>
                <th className="px-4 py-3">Deadline</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {subsidies.map((s) => (
                <tr key={s.id} className="border-b border-sage/30 last:border-0 hover:bg-cream/60">
                  <td className="px-4 py-3">
                    <TrafficLight
                      kleur={checkKleur(s.laatstGecheckt)}
                      titel={`Laatst gecheckt: ${fmtDatum(s.laatstGecheckt)}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/subsidies/${s.id}`}
                      className="font-semibold text-moss-deep hover:text-clay-deep"
                    >
                      {s.naam}
                    </Link>
                    <p className="text-xs text-ink-soft">{s.verstrekker}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tint="water">{SUBSIDIE_NIVEAU_LABELS[s.niveau]}</Badge>
                  </td>
                  <td className="px-4 py-3">{s.regio ?? "Landelijk"}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {fmtEuro(s.maxBedrag?.toString())}
                  </td>
                  <td className="px-4 py-3">
                    {s.doorlopend ? "Doorlopend" : fmtDatum(s.deadline)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tint={statusTint[s.status]}>
                      {REGELING_STATUS_LABELS[s.status]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
