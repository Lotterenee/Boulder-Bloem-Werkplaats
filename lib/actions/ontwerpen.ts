"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { tekst, getalOfNull } from "@/lib/forms";
import { canvasSchema, LEEG_CANVAS } from "@/lib/validators/canvas";
import { berekenTotalen, BTW_PCT } from "@/lib/domain/btw";
import { ROLAFBAKENING } from "@/lib/domain/rolafbakening";
import { offerteRegelsSchema } from "@/lib/validators/offerte";

export async function createOntwerp(fd: FormData) {
  const projectId = tekst(fd, "projectId");
  const naam = tekst(fd, "naam") || "Ontwerp";
  const breedteM = getalOfNull(fd, "breedteM") ?? LEEG_CANVAS.terrein.breedteM;
  const diepteM = getalOfNull(fd, "diepteM") ?? LEEG_CANVAS.terrein.diepteM;

  const ontwerp = await prisma.ontwerp.create({
    data: {
      projectId,
      naam,
      canvas: {
        ...LEEG_CANVAS,
        terrein: { breedteM, diepteM },
      },
    },
  });
  revalidatePath(`/projecten/${projectId}`);
  redirect(`/ontwerpstudio/${ontwerp.id}`);
}

/** Slaat de canvas-state (JSONB) van de huidige versie op. */
export async function saveCanvas(id: string, canvasJson: string) {
  const canvas = canvasSchema.parse(JSON.parse(canvasJson));
  await prisma.ontwerp.update({ where: { id }, data: { canvas } });
  revalidatePath(`/ontwerpstudio/${id}`);
}

/** Maakt een kopie als nieuwe genummerde versie en opent die. */
export async function saveAlsNieuweVersie(id: string, canvasJson: string) {
  const canvas = canvasSchema.parse(JSON.parse(canvasJson));
  const huidig = await prisma.ontwerp.findUniqueOrThrow({
    where: { id },
    include: { planten: true },
  });
  const hoogste = await prisma.ontwerp.aggregate({
    where: { projectId: huidig.projectId, naam: huidig.naam },
    _max: { versie: true },
  });
  const nieuw = await prisma.ontwerp.create({
    data: {
      projectId: huidig.projectId,
      naam: huidig.naam,
      versie: (hoogste._max.versie ?? huidig.versie) + 1,
      canvas,
      planten: {
        create: huidig.planten.map((p) => ({
          plantId: p.plantId,
          aantal: p.aantal,
        })),
      },
    },
  });
  revalidatePath(`/projecten/${huidig.projectId}`);
  redirect(`/ontwerpstudio/${nieuw.id}`);
}

export async function deleteOntwerp(id: string) {
  const ontwerp = await prisma.ontwerp.delete({ where: { id } });
  revalidatePath(`/projecten/${ontwerp.projectId}`);
  redirect(`/projecten/${ontwerp.projectId}?tab=ontwerp`);
}

// ---------- Planten koppelen (voedt het inheems-percentage) ----------

export async function setOntwerpPlant(ontwerpId: string, fd: FormData) {
  const plantId = tekst(fd, "plantId");
  const aantal = Math.max(1, getalOfNull(fd, "aantal") ?? 1);
  await prisma.ontwerpPlant.upsert({
    where: { ontwerpId_plantId: { ontwerpId, plantId } },
    update: { aantal },
    create: { ontwerpId, plantId, aantal },
  });
  revalidatePath(`/ontwerpstudio/${ontwerpId}`);
}

export async function removeOntwerpPlant(id: string) {
  const op = await prisma.ontwerpPlant.delete({ where: { id } });
  revalidatePath(`/ontwerpstudio/${op.ontwerpId}`);
}

// ---------- Eigen zone-sjablonen (Fase 3c) ----------

const eigenRegelSchema = z.array(
  z.object({
    soort: z.enum(["element", "plant"]),
    refId: z.string(),
    relXM: z.number(),
    relYM: z.number(),
    rotatie: z.number(),
    schaal: z.number(),
  })
);

/** Bewaar een selectie als eigen zone-sjabloon met thumbnail. */
export async function createEigenSjabloon(
  ontwerpId: string,
  naam: string,
  regelsJson: string,
  thumbnail: string | null
) {
  const regels = eigenRegelSchema.parse(JSON.parse(regelsJson));
  if (regels.length === 0) throw new Error("Selectie is leeg");
  await prisma.zoneSjabloon.create({
    data: {
      naam: naam.trim() || "Eigen sjabloon",
      categorie: "eigen",
      eigen: true,
      thumbnail: thumbnail && thumbnail.startsWith("data:image") ? thumbnail : null,
      regels: {
        create: regels.map((r) => ({
          soort: r.soort,
          refId: r.refId,
          relXM: r.relXM,
          relYM: r.relYM,
          rotatie: r.rotatie,
          schaal: r.schaal,
        })),
      },
    },
  });
  revalidatePath(`/ontwerpstudio/${ontwerpId}`);
}

export async function deleteEigenSjabloon(ontwerpId: string, sjabloonId: string) {
  await prisma.zoneSjabloon.delete({ where: { id: sjabloonId } });
  revalidatePath(`/ontwerpstudio/${ontwerpId}`);
}

// ---------- Plantpakket als offerte-regel (US-3c.4) ----------

/** Voeg een plantpakket als offerte-regel toe aan het project van dit ontwerp. */
export async function pakketNaarOfferte(ontwerpId: string, pakketId: string) {
  const [ontwerp, pakket] = await Promise.all([
    prisma.ontwerp.findUniqueOrThrow({ where: { id: ontwerpId }, select: { projectId: true } }),
    prisma.plantPakket.findUniqueOrThrow({
      where: { id: pakketId },
      include: { regels: { include: { plant: true } } },
    }),
  ]);

  const stuksprijs = pakket.regels.reduce(
    (som, r) => som + r.aantal * Number(r.plant.prijs ?? 0),
    0
  );
  const nieuweRegel = {
    omschrijving: `Plantpakket: ${pakket.naam}`,
    aantal: 1,
    stuksprijs,
    btwPct: BTW_PCT,
  };

  // Voeg toe aan de nieuwste concept-offerte, of maak een nieuwe.
  const bestaand = await prisma.offerte.findFirst({
    where: { projectId: ontwerp.projectId, status: "concept" },
    orderBy: { datum: "desc" },
  });

  if (bestaand) {
    const regels = offerteRegelsSchema.safeParse(bestaand.regels);
    const nieuweRegels = [...(regels.success ? regels.data : []), nieuweRegel];
    const totalen = berekenTotalen(nieuweRegels);
    await prisma.offerte.update({
      where: { id: bestaand.id },
      data: { regels: nieuweRegels, totaalExcl: totalen.totaalExcl, totaalIncl: totalen.totaalIncl },
    });
    revalidatePath(`/offertes/${bestaand.id}`);
    revalidatePath(`/projecten/${ontwerp.projectId}`);
    return;
  }

  const totalen = berekenTotalen([nieuweRegel]);
  const jaar = new Date().getFullYear();
  const aantal = await prisma.offerte.count({
    where: { offertenummer: { startsWith: `OFF-${jaar}-` } },
  });
  await prisma.offerte.create({
    data: {
      projectId: ontwerp.projectId,
      offertenummer: `OFF-${jaar}-${String(aantal + 1).padStart(3, "0")}`,
      regels: [nieuweRegel],
      totaalExcl: totalen.totaalExcl,
      totaalIncl: totalen.totaalIncl,
      rolafbakening: ROLAFBAKENING,
    },
  });
  revalidatePath(`/projecten/${ontwerp.projectId}`);
}
