import { prisma } from "@/lib/prisma";
import { createProject } from "@/lib/actions/projecten";
import { PageHeader, Card, EmptyState, LinkButton } from "@/components/ui";
import ProjectForm from "../ProjectForm";

export const dynamic = "force-dynamic";

export default async function NieuwProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ klant?: string }>;
}) {
  const { klant } = await searchParams;
  const klanten = await prisma.klant.findMany({
    select: { id: true, organisatie: true },
    orderBy: { organisatie: "asc" },
  });

  return (
    <>
      <PageHeader titel="Nieuw project" />
      {klanten.length === 0 ? (
        <EmptyState
          titel="Eerst een klant aanmaken"
          tekst="Een project hangt altijd aan een klant. Maak eerst een klant aan."
        >
          <LinkButton href="/klanten/nieuw">+ Nieuwe klant</LinkButton>
        </EmptyState>
      ) : (
        <Card className="max-w-3xl">
          <ProjectForm action={createProject} klanten={klanten} klantIdVooraf={klant} />
        </Card>
      )}
    </>
  );
}
