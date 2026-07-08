import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canvasSchema, LEEG_CANVAS } from "@/lib/validators/canvas";
import { deleteOntwerp } from "@/lib/actions/ontwerpen";
import { PageHeader, Button } from "@/components/ui";
import StudioLoader from "@/components/studio/StudioLoader";

export const dynamic = "force-dynamic";

export default async function OntwerpstudioPage({
  params,
}: {
  params: Promise<{ ontwerpId: string }>;
}) {
  const { ontwerpId } = await params;
  const [ontwerp, elementen, allePlanten, zoneSjablonen, plantPakketten] =
    await Promise.all([
      prisma.ontwerp.findUnique({
        where: { id: ontwerpId },
        include: { project: { select: { id: true, naam: true } } },
      }),
      prisma.element.findMany({ orderBy: [{ categorie: "asc" }, { naam: "asc" }] }),
      prisma.plant.findMany({ orderBy: { naamNL: "asc" } }),
      prisma.zoneSjabloon.findMany({
        include: { regels: true },
        orderBy: [{ eigen: "asc" }, { naam: "asc" }],
      }),
      prisma.plantPakket.findMany({ include: { regels: true }, orderBy: { naam: "asc" } }),
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

  const plantBibliotheek = allePlanten.map((p) => ({
    id: p.id,
    naamNL: p.naamNL,
    categorie: p.categorie ?? "plant",
    inheems: p.inheems,
    giftig: p.giftig,
    bloeimaanden: p.bloeimaanden,
    wintergroen: p.wintergroen,
    bloeikleur: p.bloeikleur ?? "#B96FA0",
    hoogteM: Number(p.hoogteM ?? 0.5),
    diameterM: Number(p.diameterM ?? 0),
    prijs: Number(p.prijs ?? 0),
  }));

  const zones = zoneSjablonen.map((z) => ({
    id: z.id,
    naam: z.naam,
    categorie: z.categorie,
    eigen: z.eigen,
    thumbnail: z.thumbnail,
    regels: z.regels.map((r) => ({
      soort: r.soort,
      refId: r.refId,
      relXM: Number(r.relXM),
      relYM: Number(r.relYM),
      rotatie: Number(r.rotatie),
      schaal: Number(r.schaal),
    })),
  }));

  const pakketten = plantPakketten.map((pp) => ({
    id: pp.id,
    naam: pp.naam,
    doel: pp.doel,
    regels: pp.regels.map((r) => ({ plantId: r.plantId, aantal: r.aantal })),
  }));

  return (
    <>
      <PageHeader
        titel={`${ontwerp.naam} · v${ontwerp.versie}`}
        sub="Ontwerpstudio: elementen en beplanting op het 1m-raster, met seizoensweergave en bloeiboog"
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
        ontwerp={{ id: ontwerp.id, naam: ontwerp.naam, versie: ontwerp.versie, canvas }}
        bibliotheek={bibliotheek}
        plantBibliotheek={plantBibliotheek}
        zones={zones}
        pakketten={pakketten}
      />
    </>
  );
}
