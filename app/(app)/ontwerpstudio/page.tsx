import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { canvasSchema } from "@/lib/validators/canvas";
import { fmtDatum } from "@/lib/labels";
import { PageHeader, Card, EmptyState, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function OntwerpstudioOverzicht() {
  const ontwerpen = await prisma.ontwerp.findMany({
    include: {
      project: { select: { id: true, naam: true, klant: { select: { organisatie: true } } } },
    },
    orderBy: { laatstBewerkt: "desc" },
  });

  return (
    <>
      <PageHeader
        titel="Ontwerpstudio"
        sub="Alle ontwerpen op schaal, per project en versie"
      />
      {ontwerpen.length === 0 ? (
        <EmptyState
          titel="Nog geen ontwerpen"
          tekst="Maak een ontwerp aan vanuit een project (tab Ontwerp)."
        >
          <LinkButton href="/projecten">Naar projecten</LinkButton>
        </EmptyState>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-sage/60 text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-4 py-3">Ontwerp</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Terrein</th>
                <th className="px-4 py-3 text-right">Elementen</th>
                <th className="px-4 py-3">Laatst bewerkt</th>
              </tr>
            </thead>
            <tbody>
              {ontwerpen.map((o) => {
                const canvas = canvasSchema.safeParse(o.canvas);
                return (
                  <tr key={o.id} className="border-b border-sage/30 last:border-0 hover:bg-cream/60">
                    <td className="px-4 py-3">
                      <Link
                        href={`/ontwerpstudio/${o.id}`}
                        className="font-semibold text-moss-deep hover:text-clay-deep"
                      >
                        {o.naam} v{o.versie}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/projecten/${o.project.id}`} className="hover:text-clay-deep">
                        {o.project.naam}
                      </Link>
                      <p className="text-xs text-ink-soft">{o.project.klant.organisatie}</p>
                    </td>
                    <td className="px-4 py-3">
                      {canvas.success
                        ? `${canvas.data.terrein.breedteM} x ${canvas.data.terrein.diepteM} m`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canvas.success ? canvas.data.elementen.length : "-"}
                    </td>
                    <td className="px-4 py-3">{fmtDatum(o.laatstBewerkt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
