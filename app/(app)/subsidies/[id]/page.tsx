import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  updateSubsidie,
  markeerGecheckt,
  createAanvraag,
} from "@/lib/actions/subsidies";
import {
  AANVRAAG_STATUS_LABELS,
  fmtDatum,
  checkKleur,
} from "@/lib/labels";
import { PageHeader, Card, Badge, Button, TrafficLight, Veld } from "@/components/ui";
import SubsidieForm from "../SubsidieForm";

export const dynamic = "force-dynamic";

export default async function SubsidieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [subsidie, projecten] = await Promise.all([
    prisma.subsidie.findUnique({
      where: { id },
      include: {
        aanvragen: {
          include: { project: { select: { id: true, naam: true } } },
        },
      },
    }),
    prisma.project.findMany({
      where: { status: "actief" },
      select: { id: true, naam: true },
      orderBy: { naam: "asc" },
    }),
  ]);
  if (!subsidie) notFound();

  return (
    <>
      <PageHeader titel={subsidie.naam} sub={subsidie.verstrekker}>
        <span className="flex items-center gap-2 text-sm text-ink-soft">
          <TrafficLight kleur={checkKleur(subsidie.laatstGecheckt)} />
          Laatst gecheckt: {fmtDatum(subsidie.laatstGecheckt)}
        </span>
        <form action={markeerGecheckt.bind(null, subsidie.id)}>
          <Button variant="ghost">Vandaag gecheckt ✓</Button>
        </form>
      </PageHeader>

      {subsidie.bronlink && (
        <p className="mb-4 text-sm">
          Bron:{" "}
          <a
            href={subsidie.bronlink}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-clay-deep underline"
          >
            {subsidie.bronlink}
          </a>
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg text-moss-deep">Regeling bewerken</h2>
          <SubsidieForm action={updateSubsidie.bind(null, subsidie.id)} subsidie={subsidie} />
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-lg text-moss-deep">
              Aanvragen ({subsidie.aanvragen.length})
            </h2>
            {subsidie.aanvragen.length === 0 ? (
              <p className="text-sm text-ink-soft">
                Nog geen aanvragen voor deze regeling.
              </p>
            ) : (
              <ul className="divide-y divide-sage/40">
                {subsidie.aanvragen.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2 py-2">
                    <Link
                      href={`/projecten/${a.project.id}?tab=subsidies`}
                      className="text-sm font-semibold text-moss-deep hover:text-clay-deep"
                    >
                      {a.project.naam}
                    </Link>
                    <Badge tint="sage">{AANVRAAG_STATUS_LABELS[a.status]}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 text-lg text-moss-deep">Koppel aan project</h2>
            {projecten.length === 0 ? (
              <p className="text-sm text-ink-soft">Geen actieve projecten.</p>
            ) : (
              <form action={createAanvraag} className="space-y-3">
                <input type="hidden" name="subsidieId" value={subsidie.id} />
                <Veld label="Project">
                  <select name="projectId" required defaultValue="" className="input">
                    <option value="" disabled>
                      Kies een project...
                    </option>
                    {projecten.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.naam}
                      </option>
                    ))}
                  </select>
                </Veld>
                <Button>Start aanvraag (status: scan)</Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
