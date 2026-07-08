import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LesSchema } from "@/lib/validators/les";
import { fmtEuro } from "@/lib/labels";
import { PageHeader, Card, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function LesbibliotheekPage() {
  const activiteiten = await prisma.educatieActiviteit.findMany({
    include: { _count: { select: { printbladen: true } } },
  });

  const lessen = activiteiten
    .map((a) => {
      const les = LesSchema.safeParse(a.les);
      return les.success ? { activiteit: a, les: les.data } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => (a.les.nummer ?? 99) - (b.les.nummer ?? 99));

  return (
    <>
      <PageHeader
        titel="Lesbibliotheek"
        sub="Het werkboek: volledig uitgewerkte lessen met draaiboek, voorbeeldzinnen, differentiatie, veiligheid, plan B en printbladen. Met 'Print deze les' maak je een losse les-PDF voor op het plein."
      />

      {lessen.length === 0 ? (
        <EmptyState
          titel="Nog geen uitgewerkte lessen"
          tekst="Lessen verschijnen hier zodra een activiteit een volledige lesuitwerking heeft."
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-sage/60 text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-4 py-3 text-right">Nr</th>
                <th className="px-4 py-3">Les</th>
                <th className="px-4 py-3">Leeftijd</th>
                <th className="px-4 py-3">Seizoen</th>
                <th className="px-4 py-3">Duur</th>
                <th className="px-4 py-3 text-right">Prijs</th>
                <th className="px-4 py-3 text-right">Printbladen</th>
              </tr>
            </thead>
            <tbody>
              {lessen.map(({ activiteit: a, les }) => (
                <tr key={a.id} className="border-b border-sage/30 last:border-0 hover:bg-cream/60">
                  <td className="px-4 py-3 text-right">
                    <span className="inline-grid h-7 w-8 place-items-center rounded bg-moss font-heading font-semibold text-white">
                      {les.nummer ?? "·"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/educatie/activiteiten/${a.id}`}
                      className="font-semibold text-moss-deep hover:text-clay-deep"
                    >
                      {a.titel}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {a.leeftijdVan != null && a.leeftijdTot != null
                      ? `${a.leeftijdVan} tot ${a.leeftijdTot} jr`
                      : "-"}
                  </td>
                  <td className="px-4 py-3">{a.seizoen ?? "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {a.duurMinuten ? `${a.duurMinuten} min` : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {fmtEuro(a.prijs?.toString())}
                  </td>
                  <td className="px-4 py-3 text-right">{a._count.printbladen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
