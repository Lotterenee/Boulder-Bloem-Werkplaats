import Link from "next/link";
import type { ProjectStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  FASE_LABELS,
  PROJECT_STATUS_LABELS,
  fmtDatum,
  isVerlopen,
} from "@/lib/labels";
import { PageHeader, LinkButton, EmptyState, Badge, Card } from "@/components/ui";

export const dynamic = "force-dynamic";

const statusTint = {
  actief: "moss",
  gepauzeerd: "sand",
  afgerond: "sage",
  verloren: "grijs",
} as const;

export default async function ProjectenPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter =
    status && status in PROJECT_STATUS_LABELS ? (status as ProjectStatus) : undefined;

  const projecten = await prisma.project.findMany({
    where: filter ? { status: filter } : undefined,
    include: { klant: { select: { organisatie: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <PageHeader titel="Projecten" sub={`${projecten.length} projecten`}>
        <LinkButton href="/projecten/nieuw">+ Nieuw project</LinkButton>
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Link
          href="/projecten"
          className={`rounded-full px-3 py-1 font-semibold ${
            !filter ? "bg-moss text-white" : "bg-paper text-ink-soft hover:bg-sage-light"
          }`}
        >
          Alle
        </Link>
        {Object.entries(PROJECT_STATUS_LABELS).map(([waarde, label]) => (
          <Link
            key={waarde}
            href={`/projecten?status=${waarde}`}
            className={`rounded-full px-3 py-1 font-semibold ${
              filter === waarde
                ? "bg-moss text-white"
                : "bg-paper text-ink-soft hover:bg-sage-light"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {projecten.length === 0 ? (
        <EmptyState
          titel="Geen projecten gevonden"
          tekst="Start een nieuw project vanuit een klant of via de knop hierboven."
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-sage/60 text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Klant</th>
                <th className="px-4 py-3">Fase</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Volgende actie</th>
              </tr>
            </thead>
            <tbody>
              {projecten.map((p) => (
                <tr key={p.id} className="border-b border-sage/30 last:border-0 hover:bg-cream/60">
                  <td className="px-4 py-3">
                    <Link
                      href={`/projecten/${p.id}`}
                      className="font-semibold text-moss-deep hover:text-clay-deep"
                    >
                      {p.naam}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{p.klant.organisatie}</td>
                  <td className="px-4 py-3">{FASE_LABELS[p.fase]}</td>
                  <td className="px-4 py-3">
                    <Badge tint={statusTint[p.status]}>
                      {PROJECT_STATUS_LABELS[p.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {p.volgendeActie ? (
                      <span
                        className={
                          isVerlopen(p.volgendeActieDatum)
                            ? "font-semibold text-clay-deep"
                            : ""
                        }
                      >
                        {p.volgendeActie}
                        {p.volgendeActieDatum && ` (${fmtDatum(p.volgendeActieDatum)})`}
                      </span>
                    ) : (
                      "-"
                    )}
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
