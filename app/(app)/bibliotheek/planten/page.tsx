import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createPlant } from "@/lib/actions/bibliotheek";
import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";
import PlantForm from "./PlantForm";

export const dynamic = "force-dynamic";

export default async function PlantenPage() {
  const planten = await prisma.plant.findMany({ orderBy: { naamNL: "asc" } });
  const inheems = planten.filter((p) => p.inheems).length;

  return (
    <>
      <PageHeader
        titel="Plantenbibliotheek"
        sub={`${planten.length} soorten, waarvan ${inheems} inheems. Giftige soorten zijn gemarkeerd (kinderomgeving).`}
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {planten.length === 0 ? (
            <EmptyState titel="Nog geen planten" />
          ) : (
            <Card className="overflow-x-auto p-0">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-sage/60 text-xs uppercase tracking-wide text-ink-soft">
                    <th className="px-4 py-3">Plant</th>
                    <th className="px-4 py-3">Categorie</th>
                    <th className="px-4 py-3">Inheems</th>
                    <th className="px-4 py-3">Waardplant voor</th>
                    <th className="px-4 py-3">Bloeitijd</th>
                  </tr>
                </thead>
                <tbody>
                  {planten.map((p) => (
                    <tr key={p.id} className="border-b border-sage/30 last:border-0 hover:bg-cream/60">
                      <td className="px-4 py-3">
                        <Link
                          href={`/bibliotheek/planten/${p.id}`}
                          className="font-semibold text-moss-deep hover:text-clay-deep"
                        >
                          {p.naamNL}
                        </Link>
                        {p.naamWetenschappelijk && (
                          <p className="text-xs italic text-ink-soft">
                            {p.naamWetenschappelijk}
                          </p>
                        )}
                        {p.giftig && (
                          <Badge tint="clayDeep">Giftig</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">{p.categorie ?? "-"}</td>
                      <td className="px-4 py-3">
                        {p.inheems ? <Badge tint="moss">Inheems</Badge> : <Badge tint="grijs">Uitheems</Badge>}
                      </td>
                      <td className="px-4 py-3">{p.waardplantVoor ?? "-"}</td>
                      <td className="px-4 py-3">{p.bloeitijd ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
        <Card>
          <h2 className="mb-4 text-lg text-moss-deep">Nieuwe plant</h2>
          <PlantForm action={createPlant} />
        </Card>
      </div>
    </>
  );
}
