import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createActiviteit } from "@/lib/actions/educatie";
import { fmtEuro } from "@/lib/labels";
import { PageHeader, Card, EmptyState } from "@/components/ui";
import ActiviteitForm from "./ActiviteitForm";

export const dynamic = "force-dynamic";

export default async function ActiviteitenPage() {
  const activiteiten = await prisma.educatieActiviteit.findMany({
    include: { _count: { select: { pakketten: true } } },
    orderBy: { titel: "asc" },
  });

  return (
    <>
      <PageHeader
        titel="Educatie-activiteiten"
        sub={`${activiteiten.length} activiteiten in de bibliotheek`}
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {activiteiten.length === 0 ? (
            <EmptyState titel="Nog geen activiteiten" />
          ) : (
            <Card className="overflow-x-auto p-0">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-sage/60 text-xs uppercase tracking-wide text-ink-soft">
                    <th className="px-4 py-3">Activiteit</th>
                    <th className="px-4 py-3">Leeftijd</th>
                    <th className="px-4 py-3">Seizoen</th>
                    <th className="px-4 py-3">Duur</th>
                    <th className="px-4 py-3 text-right">Prijs</th>
                    <th className="px-4 py-3 text-right">In pakketten</th>
                  </tr>
                </thead>
                <tbody>
                  {activiteiten.map((a) => (
                    <tr key={a.id} className="border-b border-sage/30 last:border-0 hover:bg-cream/60">
                      <td className="px-4 py-3">
                        <Link
                          href={`/educatie/activiteiten/${a.id}`}
                          className="font-semibold text-moss-deep hover:text-clay-deep"
                        >
                          {a.titel}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {a.leeftijdVan != null && a.leeftijdTot != null
                          ? `${a.leeftijdVan} tot ${a.leeftijdTot} jr`
                          : "-"}
                      </td>
                      <td className="px-4 py-3">{a.seizoen ?? "-"}</td>
                      <td className="px-4 py-3">
                        {a.duurMinuten ? `${a.duurMinuten} min` : "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {fmtEuro(a.prijs?.toString())}
                      </td>
                      <td className="px-4 py-3 text-right">{a._count.pakketten}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
        <Card>
          <h2 className="mb-4 text-lg text-moss-deep">Nieuwe activiteit</h2>
          <ActiviteitForm action={createActiviteit} />
        </Card>
      </div>
    </>
  );
}
