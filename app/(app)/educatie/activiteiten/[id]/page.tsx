import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateActiviteit, deleteActiviteit } from "@/lib/actions/educatie";
import { PageHeader, Card, Button } from "@/components/ui";
import ActiviteitForm from "../ActiviteitForm";

export const dynamic = "force-dynamic";

export default async function ActiviteitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activiteit = await prisma.educatieActiviteit.findUnique({
    where: { id },
    include: { _count: { select: { pakketten: true } } },
  });
  if (!activiteit) notFound();

  return (
    <>
      <PageHeader titel={activiteit.titel} sub="Activiteit bewerken" />
      <Card className="max-w-3xl">
        <ActiviteitForm action={updateActiviteit.bind(null, activiteit.id)} activiteit={activiteit} />
        {activiteit._count.pakketten === 0 && (
          <form action={deleteActiviteit.bind(null, activiteit.id)} className="mt-6 border-t border-sage/40 pt-4">
            <Button variant="danger">Activiteit verwijderen</Button>
          </form>
        )}
      </Card>
    </>
  );
}
