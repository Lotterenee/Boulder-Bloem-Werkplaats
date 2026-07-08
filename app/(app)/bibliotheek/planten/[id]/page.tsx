import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updatePlant, deletePlant } from "@/lib/actions/bibliotheek";
import { PageHeader, Card, Button } from "@/components/ui";
import PlantForm from "../PlantForm";

export const dynamic = "force-dynamic";

export default async function PlantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plant = await prisma.plant.findUnique({
    where: { id },
    include: { _count: { select: { ontwerpen: true } } },
  });
  if (!plant) notFound();

  return (
    <>
      <PageHeader titel={plant.naamNL} sub="Plant bewerken" />
      <Card className="max-w-3xl">
        <PlantForm action={updatePlant.bind(null, plant.id)} plant={plant} />
        {plant._count.ontwerpen === 0 && (
          <form action={deletePlant.bind(null, plant.id)} className="mt-6 border-t border-sage/40 pt-4">
            <Button variant="danger">Plant verwijderen</Button>
          </form>
        )}
      </Card>
    </>
  );
}
