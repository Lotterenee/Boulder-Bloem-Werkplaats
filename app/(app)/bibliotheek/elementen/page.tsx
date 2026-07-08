import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createElement } from "@/lib/actions/bibliotheek";
import {
  ELEMENT_CATEGORIE_LABELS,
  fmtEuro,
} from "@/lib/labels";
import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";
import ElementForm from "./ElementForm";

export const dynamic = "force-dynamic";

export default async function ElementenPage() {
  const elementen = await prisma.element.findMany({
    orderBy: [{ categorie: "asc" }, { naam: "asc" }],
  });

  return (
    <>
      <PageHeader
        titel="Elementenbibliotheek"
        sub="Speelaanleidingen vallen buiten WAS 2023; speeltoestellen zijn keuringsplichtig via een AKI."
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {elementen.length === 0 ? (
            <EmptyState titel="Nog geen elementen" />
          ) : (
            <Card className="overflow-x-auto p-0">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-sage/60 text-xs uppercase tracking-wide text-ink-soft">
                    <th className="px-4 py-3">Element</th>
                    <th className="px-4 py-3">Categorie</th>
                    <th className="px-4 py-3">WAS-soort</th>
                    <th className="px-4 py-3">Afmeting</th>
                    <th className="px-4 py-3">Valruimte</th>
                    <th className="px-4 py-3 text-right">Indicatieprijs</th>
                  </tr>
                </thead>
                <tbody>
                  {elementen.map((e) => (
                    <tr key={e.id} className="border-b border-sage/30 last:border-0 hover:bg-cream/60">
                      <td className="px-4 py-3">
                        <Link
                          href={`/bibliotheek/elementen/${e.id}`}
                          className="font-semibold text-moss-deep hover:text-clay-deep"
                        >
                          {e.naam}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tint="sage">{ELEMENT_CATEGORIE_LABELS[e.categorie]}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {e.soort === "speeltoestel" ? (
                          <Badge tint="clayDeep">Toestel (keuring)</Badge>
                        ) : (
                          <Badge tint="water">Speelaanleiding</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {e.standaardBreedteM && e.standaardDiepteM
                          ? `${e.standaardBreedteM} x ${e.standaardDiepteM} m`
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {e.valruimteM && Number(e.valruimteM) > 0
                          ? `${e.valruimteM} m`
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {fmtEuro(e.indicatieprijs?.toString())}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
        <Card>
          <h2 className="mb-4 text-lg text-moss-deep">Nieuw element</h2>
          <ElementForm action={createElement} />
        </Card>
      </div>
    </>
  );
}
