import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  FASEN,
  FASE_LABELS,
  AANVRAAG_STATUS_LABELS,
  fmtDatum,
  fmtEuro,
  isVerlopen,
} from "@/lib/labels";
import { PageHeader, Card, StatCard, EmptyState, Badge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const over14Dagen = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const [projecten, openTaken, aanvragen, toegekend] = await Promise.all([
    prisma.project.findMany({
      where: { status: "actief" },
      include: { klant: { select: { organisatie: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.taak.findMany({
      where: { afgerond: false },
      include: { project: { select: { id: true, naam: true } } },
      orderBy: [{ deadline: { sort: "asc", nulls: "last" } }],
      take: 12,
    }),
    prisma.subsidieAanvraag.findMany({
      where: { status: { notIn: ["afgerond", "afgewezen"] } },
      include: {
        subsidie: { select: { naam: true } },
        project: { select: { id: true, naam: true } },
      },
      orderBy: [{ deadline: { sort: "asc", nulls: "last" } }],
    }),
    prisma.subsidieAanvraag.aggregate({
      _sum: { bedragToegekend: true },
      where: { status: { in: ["toegekend", "verantwoording", "afgerond"] } },
    }),
  ]);

  const volgendeActies = projecten
    .filter((p) => p.volgendeActieDatum && p.volgendeActieDatum <= over14Dagen)
    .sort(
      (a, b) =>
        (a.volgendeActieDatum?.getTime() ?? 0) -
        (b.volgendeActieDatum?.getTime() ?? 0)
    );

  const aanvraagDeadlines = aanvragen.filter((a) => a.deadline);

  return (
    <>
      <PageHeader
        titel="Dashboard"
        sub="Overzicht van projecten, deadlines en volgende acties"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Actieve projecten" waarde={projecten.length} />
        <StatCard label="Open taken" waarde={openTaken.length} />
        <StatCard label="Lopende subsidieaanvragen" waarde={aanvragen.length} />
        <StatCard
          label="Toegekende subsidie"
          waarde={fmtEuro(toegekend._sum.bedragToegekend?.toNumber() ?? 0)}
        />
      </div>

      <section aria-labelledby="kanban-titel" className="mb-8">
        <h2 id="kanban-titel" className="mb-3 text-xl text-moss-deep">
          Projecten per fase
        </h2>
        {projecten.length === 0 ? (
          <EmptyState
            titel="Nog geen actieve projecten"
            tekst="Maak een klant aan en start een project; het verschijnt hier in de kweekkas."
          />
        ) : (
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-max gap-3">
              {FASEN.map((fase) => {
                const kolom = projecten.filter((p) => p.fase === fase);
                return (
                  <div
                    key={fase}
                    className="w-56 shrink-0 rounded-xl bg-sage-light/50 p-3"
                  >
                    <p className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-moss-deep">
                      {FASE_LABELS[fase]}
                      <span className="rounded-full bg-paper px-2 py-0.5">
                        {kolom.length}
                      </span>
                    </p>
                    <div className="space-y-2">
                      {kolom.map((p) => (
                        <Link
                          key={p.id}
                          href={`/projecten/${p.id}`}
                          className="block rounded-lg border border-sage/60 bg-paper p-3 shadow-sm transition hover:border-clay"
                        >
                          <p className="text-sm font-bold text-ink">{p.naam}</p>
                          <p className="text-xs text-ink-soft">
                            {p.klant.organisatie}
                          </p>
                          {p.volgendeActie && (
                            <p className="mt-1.5 text-xs text-clay-deep">
                              → {p.volgendeActie}
                            </p>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section aria-labelledby="deadline-titel">
          <h2 id="deadline-titel" className="mb-3 text-xl text-moss-deep">
            Taken & deadlines
          </h2>
          <Card>
            {openTaken.length === 0 ? (
              <p className="text-sm text-ink-soft">Geen open taken.</p>
            ) : (
              <ul className="divide-y divide-sage/40">
                {openTaken.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-2 py-2">
                    <div>
                      <p className="text-sm font-semibold">{t.titel}</p>
                      {t.project && (
                        <Link
                          href={`/projecten/${t.project.id}?tab=taken`}
                          className="text-xs text-ink-soft hover:text-clay-deep"
                        >
                          {t.project.naam}
                        </Link>
                      )}
                    </div>
                    <span
                      className={`whitespace-nowrap text-xs font-bold ${
                        isVerlopen(t.deadline) ? "text-clay-deep" : "text-ink-soft"
                      }`}
                    >
                      {fmtDatum(t.deadline)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        <section aria-labelledby="acties-titel">
          <h2 id="acties-titel" className="mb-3 text-xl text-moss-deep">
            Volgende acties (14 dagen)
          </h2>
          <Card>
            {volgendeActies.length === 0 ? (
              <p className="text-sm text-ink-soft">
                Geen acties gepland binnen 14 dagen.
              </p>
            ) : (
              <ul className="divide-y divide-sage/40">
                {volgendeActies.map((p) => (
                  <li key={p.id} className="py-2">
                    <Link
                      href={`/projecten/${p.id}`}
                      className="text-sm font-semibold hover:text-clay-deep"
                    >
                      {p.naam}
                    </Link>
                    <p className="text-xs text-ink-soft">
                      {p.volgendeActie}{" "}
                      <span
                        className={
                          isVerlopen(p.volgendeActieDatum) ? "font-bold text-clay-deep" : ""
                        }
                      >
                        ({fmtDatum(p.volgendeActieDatum)})
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        <section aria-labelledby="subsidie-titel">
          <h2 id="subsidie-titel" className="mb-3 text-xl text-moss-deep">
            Subsidie-deadlines
          </h2>
          <Card>
            {aanvraagDeadlines.length === 0 ? (
              <p className="text-sm text-ink-soft">
                Geen aanvragen met een deadline.
              </p>
            ) : (
              <ul className="divide-y divide-sage/40">
                {aanvraagDeadlines.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2 py-2">
                    <div>
                      <p className="text-sm font-semibold">{a.subsidie.naam}</p>
                      <p className="text-xs text-ink-soft">
                        <Link
                          href={`/projecten/${a.project.id}?tab=subsidies`}
                          className="hover:text-clay-deep"
                        >
                          {a.project.naam}
                        </Link>{" "}
                        <Badge tint="sage">{AANVRAAG_STATUS_LABELS[a.status]}</Badge>
                      </p>
                    </div>
                    <span
                      className={`whitespace-nowrap text-xs font-bold ${
                        isVerlopen(a.deadline) ? "text-clay-deep" : "text-ink-soft"
                      }`}
                    >
                      {fmtDatum(a.deadline)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>
      </div>
    </>
  );
}
