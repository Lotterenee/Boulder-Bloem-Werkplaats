import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateElement, deleteElement } from "@/lib/actions/bibliotheek";
import { PageHeader, Card, Button } from "@/components/ui";
import ElementForm from "../ElementForm";

export const dynamic = "force-dynamic";

export default async function ElementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const element = await prisma.element.findUnique({ where: { id } });
  if (!element) notFound();

  return (
    <>
      <PageHeader titel={element.naam} sub="Element bewerken" />
      <Card className="max-w-3xl">
        <ElementForm action={updateElement.bind(null, element.id)} element={element} />
        <form action={deleteElement.bind(null, element.id)} className="mt-6 border-t border-sage/40 pt-4">
          <p className="mb-2 text-xs text-ink-soft">
            Let op: ontwerpen die dit element gebruiken tonen het daarna als
            onbekend element.
          </p>
          <Button variant="danger">Element verwijderen</Button>
        </form>
      </Card>
    </>
  );
}
