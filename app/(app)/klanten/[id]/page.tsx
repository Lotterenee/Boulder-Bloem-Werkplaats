import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateKlant, deleteKlant } from "@/lib/actions/klanten";
import { FASE_LABELS, PROJECT_STATUS_LABELS, fmtDatum } from "@/lib/labels";
import { PageHeader, Card, LinkButton, Button, Badge } from "@/components/ui";
import KlantForm from "../KlantForm";

export const dynamic = "force-dynamic";

export default async function KlantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const klant = await prisma.klant.findUnique({
    where: { id },
    include: { projecten: { orderBy: { updatedAt: "desc" } } },
  });
  if (!klant) notFound();

  const updateMetId = updateKlant.bind(null, klant.id);
  const deleteMetId = deleteKlant.bind(null, klant.id);

  return (
    <>
      <PageHeader titel={klant.organisatie} sub={`Klant sinds ${fmtDatum(klant.createdAt)}`}>
        <LinkButton href={`/projecten/nieuw?klant=${klant.id}`}>
          + Nieuw project
        </LinkButton>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg text-moss-deep">Gegevens</h2>
          <KlantForm action={updateMetId} klant={klant} />
          {klant.projecten.length === 0 && (
            <form action={deleteMetId} className="mt-6 border-t border-sage/40 pt-4">
              <Button variant="danger">Klant verwijderen</Button>
            </form>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-lg text-moss-deep">
            Projecten ({klant.projecten.length})
          </h2>
          {klant.projecten.length === 0 ? (
            <p className="text-sm text-ink-soft">Nog geen projecten voor deze klant.</p>
          ) : (
            <ul className="divide-y divide-sage/40">
              {klant.projecten.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 py-3">
                  <div>
                    <Link
                      href={`/projecten/${p.id}`}
                      className="font-semibold text-moss-deep hover:text-clay-deep"
                    >
                      {p.naam}
                    </Link>
                    <p className="text-xs text-ink-soft">{FASE_LABELS[p.fase]}</p>
                  </div>
                  <Badge tint={p.status === "actief" ? "moss" : "grijs"}>
                    {PROJECT_STATUS_LABELS[p.status]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
