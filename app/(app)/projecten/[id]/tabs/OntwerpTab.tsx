import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createOntwerp } from "@/lib/actions/ontwerpen";
import { canvasSchema } from "@/lib/validators/canvas";
import { fmtDatum } from "@/lib/labels";
import { Card, Button, Veld } from "@/components/ui";

export default async function OntwerpTab({ projectId }: { projectId: string }) {
  const ontwerpen = await prisma.ontwerp.findMany({
    where: { projectId },
    orderBy: [{ naam: "asc" }, { versie: "desc" }],
  });

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <h2 className="mb-4 text-lg text-moss-deep">Ontwerpen ({ontwerpen.length})</h2>
        {ontwerpen.length === 0 ? (
          <p className="text-sm text-ink-soft">
            Nog geen ontwerp. Maak er hiernaast een aan; je komt dan direct in de
            ontwerpstudio.
          </p>
        ) : (
          <ul className="divide-y divide-sage/40">
            {ontwerpen.map((o) => {
              const canvas = canvasSchema.safeParse(o.canvas);
              const aantal = canvas.success ? canvas.data.elementen.length : 0;
              const terrein = canvas.success
                ? `${canvas.data.terrein.breedteM} x ${canvas.data.terrein.diepteM} m`
                : "?";
              return (
                <li key={o.id} className="flex items-center justify-between gap-2 py-3">
                  <div>
                    <Link
                      href={`/ontwerpstudio/${o.id}`}
                      className="font-semibold text-moss-deep hover:text-clay-deep"
                    >
                      {o.naam} <span className="text-ink-soft">v{o.versie}</span>
                    </Link>
                    <p className="text-xs text-ink-soft">
                      {terrein} · {aantal} elementen · bewerkt {fmtDatum(o.laatstBewerkt)}
                    </p>
                  </div>
                  <Link
                    href={`/ontwerpstudio/${o.id}`}
                    className="rounded-lg border border-sage px-3 py-1.5 text-xs font-semibold text-moss-deep transition hover:bg-sage-light"
                  >
                    Open in studio →
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 text-lg text-moss-deep">Nieuw ontwerp</h2>
        <form action={createOntwerp} className="space-y-3">
          <input type="hidden" name="projectId" value={projectId} />
          <Veld label="Naam *">
            <input name="naam" required defaultValue="Schetsontwerp" className="input" />
          </Veld>
          <div className="grid grid-cols-2 gap-3">
            <Veld label="Terrein breedte (m)">
              <input name="breedteM" type="number" min="2" max="500" defaultValue="20" className="input" />
            </Veld>
            <Veld label="Terrein diepte (m)">
              <input name="diepteM" type="number" min="2" max="500" defaultValue="15" className="input" />
            </Veld>
          </div>
          <Button>Open in studio</Button>
        </form>
      </Card>
    </div>
  );
}
