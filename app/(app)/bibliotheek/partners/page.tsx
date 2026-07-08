import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createPartner } from "@/lib/actions/bibliotheek";
import { PARTNER_TYPE_LABELS } from "@/lib/labels";
import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";
import PartnerForm from "./PartnerForm";

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  const partners = await prisma.partner.findMany({
    orderBy: [{ type: "asc" }, { naam: "asc" }],
  });

  return (
    <>
      <PageHeader titel="Partners" sub="CRM voor uitvoerende en keurende partijen" />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {partners.length === 0 ? (
            <EmptyState
              titel="Nog geen partners"
              tekst="Voeg groenaannemers, toestelleveranciers, kwekerijen en keuringsinstanties toe."
            />
          ) : (
            <Card className="overflow-x-auto p-0">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-sage/60 text-xs uppercase tracking-wide text-ink-soft">
                    <th className="px-4 py-3">Partner</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Tarieven</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.map((p) => (
                    <tr key={p.id} className="border-b border-sage/30 last:border-0 hover:bg-cream/60">
                      <td className="px-4 py-3">
                        <Link
                          href={`/bibliotheek/partners/${p.id}`}
                          className="font-semibold text-moss-deep hover:text-clay-deep"
                        >
                          {p.naam}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tint="sand">{PARTNER_TYPE_LABELS[p.type]}</Badge>
                      </td>
                      <td className="px-4 py-3">{p.contact ?? "-"}</td>
                      <td className="px-4 py-3 text-xs text-ink-soft">
                        {p.tarieven ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
        <Card>
          <h2 className="mb-4 text-lg text-moss-deep">Nieuwe partner</h2>
          <PartnerForm action={createPartner} />
        </Card>
      </div>
    </>
  );
}
