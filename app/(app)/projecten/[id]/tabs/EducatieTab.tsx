import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createPakket, koppelPakketAanProject } from "@/lib/actions/educatie";
import { PAKKET_STATUS_LABELS, fmtEuro } from "@/lib/labels";
import { Card, Button, Badge, Veld, type BadgeTint } from "@/components/ui";

const statusTint: Record<string, BadgeTint> = {
  concept: "grijs",
  aangeboden: "clay",
  verkocht: "moss",
};

export default async function EducatieTab({ projectId }: { projectId: string }) {
  const [pakketten, lossePakketten] = await Promise.all([
    prisma.educatiePakket.findMany({
      where: { projectId },
      include: { _count: { select: { activiteiten: true } } },
      orderBy: { naam: "asc" },
    }),
    prisma.educatiePakket.findMany({
      where: { projectId: null },
      orderBy: { naam: "asc" },
    }),
  ]);

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <h2 className="mb-4 text-lg text-moss-deep">
          Educatiepakketten bij dit project
        </h2>
        {pakketten.length === 0 ? (
          <p className="text-sm text-ink-soft">
            Nog geen pakket gekoppeld. Maak hiernaast een nieuw pakket of koppel
            een bestaand pakket.
          </p>
        ) : (
          <ul className="divide-y divide-sage/40">
            {pakketten.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 py-3">
                <div>
                  <Link
                    href={`/educatie/pakketten/${p.id}`}
                    className="font-semibold text-moss-deep hover:text-clay-deep"
                  >
                    {p.naam}
                  </Link>
                  <p className="text-xs text-ink-soft">
                    {p._count.activiteiten} activiteiten ·{" "}
                    {fmtEuro(p.totaalprijs?.toString())}
                  </p>
                </div>
                <Badge tint={statusTint[p.status]}>
                  {PAKKET_STATUS_LABELS[p.status]}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="space-y-6">
        <Card>
          <h2 className="mb-4 text-lg text-moss-deep">Nieuw pakket voor dit project</h2>
          <form action={createPakket} className="space-y-3">
            <input type="hidden" name="projectId" value={projectId} />
            <Veld label="Naam *">
              <input name="naam" required className="input" />
            </Veld>
            <Button>Pakket aanmaken</Button>
          </form>
        </Card>

        {lossePakketten.length > 0 && (
          <Card>
            <h2 className="mb-4 text-lg text-moss-deep">Bestaand pakket koppelen</h2>
            <ul className="divide-y divide-sage/40">
              {lossePakketten.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 py-2">
                  <span className="text-sm font-semibold">{p.naam}</span>
                  <form action={koppelPakketAanProject.bind(null, p.id, projectId)}>
                    <Button variant="klein">Koppel</Button>
                  </form>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
