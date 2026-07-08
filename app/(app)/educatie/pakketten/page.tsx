import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createPakket } from "@/lib/actions/educatie";
import { PAKKET_STATUS_LABELS, fmtEuro } from "@/lib/labels";
import { PageHeader, Card, EmptyState, Badge, Veld, Button, type BadgeTint } from "@/components/ui";

export const dynamic = "force-dynamic";

const statusTint: Record<string, BadgeTint> = {
  concept: "grijs",
  aangeboden: "clay",
  verkocht: "moss",
};

export default async function PakkettenPage() {
  const pakketten = await prisma.educatiePakket.findMany({
    include: {
      project: { select: { id: true, naam: true } },
      _count: { select: { activiteiten: true } },
    },
    orderBy: { naam: "asc" },
  });

  return (
    <>
      <PageHeader titel="Educatiepakketten" sub={`${pakketten.length} pakketten`} />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {pakketten.length === 0 ? (
            <EmptyState titel="Nog geen pakketten" />
          ) : (
            <Card className="overflow-x-auto p-0">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-sage/60 text-xs uppercase tracking-wide text-ink-soft">
                    <th className="px-4 py-3">Pakket</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3 text-right">Activiteiten</th>
                    <th className="px-4 py-3 text-right">Totaalprijs</th>
                  </tr>
                </thead>
                <tbody>
                  {pakketten.map((p) => (
                    <tr key={p.id} className="border-b border-sage/30 last:border-0 hover:bg-cream/60">
                      <td className="px-4 py-3">
                        <Link
                          href={`/educatie/pakketten/${p.id}`}
                          className="font-semibold text-moss-deep hover:text-clay-deep"
                        >
                          {p.naam}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tint={statusTint[p.status]}>
                          {PAKKET_STATUS_LABELS[p.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {p.project ? (
                          <Link
                            href={`/projecten/${p.project.id}?tab=educatie`}
                            className="hover:text-clay-deep"
                          >
                            {p.project.naam}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">{p._count.activiteiten}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {fmtEuro(p.totaalprijs?.toString())}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
        <Card>
          <h2 className="mb-4 text-lg text-moss-deep">Nieuw pakket</h2>
          <form action={createPakket} className="space-y-3">
            <Veld label="Naam *">
              <input name="naam" required className="input" />
            </Veld>
            <Button>Pakket aanmaken</Button>
          </form>
        </Card>
      </div>
    </>
  );
}
