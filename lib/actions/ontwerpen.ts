"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { tekst, getalOfNull } from "@/lib/forms";
import { canvasSchema, LEEG_CANVAS } from "@/lib/validators/canvas";

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
