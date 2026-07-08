import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { KLANT_TYPE_LABELS } from "@/lib/labels";
import { PageHeader, LinkButton, EmptyState, Badge, Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function KlantenPage() {
  const klanten = await prisma.klant.findMany({
    include: { _count: { select: { projecten: true } } },
    orderBy: { organisatie: "asc" },
  });

  return (
    <>
      <PageHeader titel="Klanten" sub={`${klanten.length} organisaties`}>
        <LinkButton href="/klanten/nieuw">+ Nieuwe klant</LinkButton>
      </PageHeader>

      {klanten.length === 0 ? (
        <EmptyState
          titel="Nog geen klanten"
          tekst="Voeg je eerste klant toe: een school, BSO, gemeente of particulier."
        >
          <LinkButton href="/klanten/nieuw">+ Nieuwe klant</LinkButton>
        </EmptyState>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-sage/60 text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-4 py-3">Organisatie</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Contactpersoon</th>
                <th className="px-4 py-3">Gemeente</th>
                <th className="px-4 py-3 text-right">Projecten</th>
              </tr>
            </thead>
            <tbody>
              {klanten.map((k) => (
                <tr key={k.id} className="border-b border-sage/30 last:border-0 hover:bg-cream/60">
                  <td className="px-4 py-3">
                    <Link
                      href={`/klanten/${k.id}`}
                      className="font-semibold text-moss-deep hover:text-clay-deep"
                    >
                      {k.organisatie}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tint="sage">{KLANT_TYPE_LABELS[k.type]}</Badge>
                  </td>
                  <td className="px-4 py-3">{k.contactpersoon ?? "-"}</td>
                  <td className="px-4 py-3">{k.gemeente}</td>
                  <td className="px-4 py-3 text-right">{k._count.projecten}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
