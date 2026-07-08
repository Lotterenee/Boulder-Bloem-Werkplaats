import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updatePartner, deletePartner } from "@/lib/actions/bibliotheek";
import { PageHeader, Card, Button } from "@/components/ui";
import PartnerForm from "../PartnerForm";

export const dynamic = "force-dynamic";

export default async function PartnerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const partner = await prisma.partner.findUnique({ where: { id } });
  if (!partner) notFound();

  return (
    <>
      <PageHeader titel={partner.naam} sub="Partner bewerken" />
      <Card className="max-w-xl">
        <PartnerForm action={updatePartner.bind(null, partner.id)} partner={partner} />
        <form action={deletePartner.bind(null, partner.id)} className="mt-6 border-t border-sage/40 pt-4">
          <Button variant="danger">Partner verwijderen</Button>
        </form>
      </Card>
    </>
  );
}
