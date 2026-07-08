import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canvasSchema, LEEG_CANVAS } from "@/lib/validators/canvas";
import {
  deleteOntwerp,
  setOntwerpPlant,
  removeOntwerpPlant,
} from "@/lib/actions/ontwerpen";
import { PageHeader, Card, Button, Veld, Badge } from "@/components/ui";
import StudioLoader from "@/components/studio/StudioLoader";

export const dynamic = "force-dynamic";

export default async function OntwerpstudioPage({
  params,
}: {
  params: Promise<{ ontwerpId: string }>;
}) {
  const { ontwerpId } = await params;
  const [ontwerp, elementen, allePlanten] = await Promise.all([
    prisma.ontwerp.findUnique({
      where: { id: ontwerpId },
      include: {
        project: { select: { id: true, naam: true } },
        planten: { include: { plant: true }, orderBy: { plant: { naamNL: "asc" } } },
      },
    }),
    prisma.element.findMany({ orderBy: [{ categorie: "asc" }, { naam: "asc" }] }),
    prisma.plant.findMany({ orderBy: { naamNL: "asc" } }),
  ]);
  if (!ontwerp) notFound();

  const parsed = canvasSchema.safeParse(ontwerp.canvas);
  const canvas = parsed.success ? parsed.data : LEEG_CANVAS;

  const bibliotheek = elementen.map((e) => ({
    id: e.id,
    naam: e.naam,
    categorie: e.categorie as string,
    soort: e.soort,
    breedteM: Number(e.standaardBreedteM ?? 1),
    diepteM: Number(e.standaardDiepteM ?? 1),
    valruimteM: Number(e.valruimteM ?? 0),
    prijs: Number(e.indicatieprijs ?? 0),
  }));

  const totaalPlanten = ontwerp.planten.reduce((acc, p) => acc + p.aantal, 0);
  const inheemsAantal = ontwerp.planten.reduce(
    (acc, p) => acc + (p.plant.inheems ? p.aantal : 0),
    0
  );
  const plantStats = {
    totaal: totaalPlanten,
    inheemsPct: totaalPlanten === 0 ? 0 : Math.round((inheemsAantal / totaalPlanten) * 100),
  };

  const gekoppeld = new Set(ontwerp.planten.map((p) => p.plantId));
  const beschikbarePlanten = allePlanten.filter((p) => !gekoppeld.has(p.id));

  return (
    <>
      <PageHeader
        titel={`${ontwerp.naam} · v${ontwerp.versie}`}
        sub="Ontwerpstudio: sleep, roteer en schaal elementen op het 1m-raster"
      >
        <Link
          href={`/projecten/${ontwerp.project.id}?tab=ontwerp`}
          className="text-sm font-semibold text-ink-soft hover:text-clay-deep"
        >
          ← {ontwerp.project.naam}
        </Link>
        <form action={deleteOntwerp.bind(null, ontwerp.id)}>
          <Button variant="danger">Verwijder versie</Button>
        </form>
      </PageHeader>

      <StudioLoader
        ontwerp={{
          id: ontwerp.id,
          naam: ontwerp.naam,
          versie: ontwerp.versie,
          canvas,
        }}
        bibliotheek={bibliotheek}
        plantStats={plantStats}
      />

      <Card className="mt-6 max-w-3xl">
        <h2 className="mb-1 text-lg text-moss-deep">Beplanting bij dit ontwerp</h2>
        <p className="mb-4 text-xs text-ink-soft">
          Het inheems-percentage ({plantStats.totaal === 0 ? "nog geen planten" : `${plantStats.inheemsPct}%`})
          telt mee in de ontwerpcoach en voor subsidie-eisen.
        </p>
        {ontwerp.planten.length > 0 && (
          <ul className="mb-4 divide-y divide-sage/40">
            {ontwerp.planten.map((op) => (
              <li key={op.id} className="flex items-center justify-between gap-2 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {op.aantal} x {op.plant.naamNL}
                  </span>
                  {op.plant.inheems && <Badge tint="moss">Inheems</Badge>}
                  {op.plant.giftig && <Badge tint="clayDeep">Giftig</Badge>}
                </div>
                <form action={removeOntwerpPlant.bind(null, op.id)}>
                  <button
                    type="submit"
                    aria-label={`Verwijder ${op.plant.naamNL}`}
                    className="text-ink-soft hover:text-clay-deep"
                  >
                    ✕
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
        {beschikbarePlanten.length > 0 && (
          <form
            action={setOntwerpPlant.bind(null, ontwerp.id)}
            className="flex flex-wrap items-end gap-3"
          >
            <Veld label="Plant" className="min-w-56 flex-1">
              <select name="plantId" required defaultValue="" className="input">
                <option value="" disabled>
                  Kies een plant...
                </option>
                {beschikbarePlanten.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.naamNL} {p.inheems ? "(inheems)" : ""}
                  </option>
                ))}
              </select>
            </Veld>
            <Veld label="Aantal">
              <input name="aantal" type="number" min="1" defaultValue="1" className="input w-24" />
            </Veld>
            <Button>Toevoegen</Button>
          </form>
        )}
      </Card>
    </>
  );
}
