import type { Project } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { updateProject, deleteProject } from "@/lib/actions/projecten";
import { Card, Button } from "@/components/ui";
import ProjectForm from "../../ProjectForm";

export default async function OverzichtTab({ project }: { project: Project }) {
  const klanten = await prisma.klant.findMany({
    select: { id: true, organisatie: true },
    orderBy: { organisatie: "asc" },
  });

  const updateMetId = updateProject.bind(null, project.id);
  const deleteMetId = deleteProject.bind(null, project.id);

  return (
    <Card className="max-w-3xl">
      <ProjectForm action={updateMetId} klanten={klanten} project={project} />
      <form action={deleteMetId} className="mt-6 border-t border-sage/40 pt-4">
        <p className="mb-2 text-xs text-ink-soft">
          Verwijderen wist ook wensen, ontwerpen, aanvragen, offertes en metingen
          van dit project (taken blijven los bestaan).
        </p>
        <Button variant="danger">Project verwijderen</Button>
      </form>
    </Card>
  );
}
