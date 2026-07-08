import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { offerteRegelsSchema } from "@/lib/validators/offerte";
import { PageHeader } from "@/components/ui";
import OfferteEditor from "./OfferteEditor";

export const dynamic = "force-dynamic";

export default async function OffertePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const offerte = await prisma.offerte.findUnique({
    where: { id },
    include: { project: { include: { klant: true } } },
  });
  if (!offerte) notFound();

  const regels = offerteRegelsSchema.safeParse(offerte.regels);

  return (
    <>
      <div className="no-print">
        <PageHeader
          titel={`Offerte ${offerte.offertenummer}`}
          sub={`${offerte.project.naam} · ${offerte.project.klant.organisatie}`}
        >
          <Link
            href={`/projecten/${offerte.projectId}?tab=offerte`}
            className="text-sm font-semibold text-ink-soft hover:text-clay-deep"
          >
            ← Terug naar project
          </Link>
        </PageHeader>
      </div>

      <OfferteEditor
        offerte={{
          id: offerte.id,
          offertenummer: offerte.offertenummer,
          datum: offerte.datum.toISOString(),
          status: offerte.status,
          rolafbakening: offerte.rolafbakening,
          regels: regels.success ? regels.data : [],
        }}
        project={{
          naam: offerte.project.naam,
          locatieadres: offerte.project.locatieadres,
        }}
        klant={{
          organisatie: offerte.project.klant.organisatie,
          contactpersoon: offerte.project.klant.contactpersoon,
          adres: offerte.project.klant.adres,
          plaats: offerte.project.klant.plaats,
        }}
      />
    </>
  );
}
