"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { tekst, tekstOfNull } from "@/lib/forms";
import { berekenTotalen, BTW_PCT, type OfferteRegel } from "@/lib/domain/btw";
import { ROLAFBAKENING } from "@/lib/domain/rolafbakening";
import { offerteRegelsSchema } from "@/lib/validators/offerte";
import { canvasSchema } from "@/lib/validators/canvas";

async function volgendOffertenummer(): Promise<string> {
  const jaar = new Date().getFullYear();
  const prefix = `OFF-${jaar}-`;
  const aantal = await prisma.offerte.count({
    where: { offertenummer: { startsWith: prefix } },
  });
  for (let n = aantal + 1; ; n++) {
    const nummer = `${prefix}${String(n).padStart(3, "0")}`;
    const bestaat = await prisma.offerte.findUnique({
      where: { offertenummer: nummer },
    });
    if (!bestaat) return nummer;
  }
}

/** Genereer een offerte met regels uit een ontwerp en/of educatiepakket. */
export async function genereerOfferte(fd: FormData) {
  const projectId = tekst(fd, "projectId");
  const ontwerpId = tekstOfNull(fd, "ontwerpId");
  const pakketId = tekstOfNull(fd, "pakketId");

  const regels: OfferteRegel[] = [];

  if (ontwerpId) {
    const ontwerp = await prisma.ontwerp.findUniqueOrThrow({
      where: { id: ontwerpId },
    });
    const canvas = canvasSchema.safeParse(ontwerp.canvas);
    if (canvas.success) {
      // Elementen: geteld per soort.
      const aantallen = new Map<string, number>();
      for (const el of canvas.data.elementen) {
        aantallen.set(el.elementId, (aantallen.get(el.elementId) ?? 0) + 1);
      }
      const elementen = await prisma.element.findMany({
        where: { id: { in: [...aantallen.keys()] } },
      });
      for (const element of elementen) {
        regels.push({
          omschrijving: element.naam,
          aantal: aantallen.get(element.id) ?? 0,
          stuksprijs: Number(element.indicatieprijs ?? 0),
          btwPct: BTW_PCT,
        });
      }
      // Beplanting: geteld per soort vanaf het canvas (Fase 3b).
      const plantAantallen = new Map<string, number>();
      for (const bp of canvas.data.beplanting) {
        plantAantallen.set(bp.plantId, (plantAantallen.get(bp.plantId) ?? 0) + 1);
      }
      if (plantAantallen.size > 0) {
        const planten = await prisma.plant.findMany({
          where: { id: { in: [...plantAantallen.keys()] } },
        });
        for (const plant of planten) {
          regels.push({
            omschrijving: `Beplanting: ${plant.naamNL}`,
            aantal: plantAantallen.get(plant.id) ?? 0,
            stuksprijs: Number(plant.prijs ?? 0),
            btwPct: BTW_PCT,
          });
        }
      }
    }
  }

  if (pakketId) {
    const pakket = await prisma.educatiePakket.findUniqueOrThrow({
      where: { id: pakketId },
    });
    regels.push({
      omschrijving: `Educatiepakket: ${pakket.naam}`,
      aantal: 1,
      stuksprijs: Number(pakket.totaalprijs ?? 0),
      btwPct: BTW_PCT,
    });
  }

  const totalen = berekenTotalen(regels);
  const offerte = await prisma.offerte.create({
    data: {
      projectId,
      offertenummer: await volgendOffertenummer(),
      regels,
      totaalExcl: totalen.totaalExcl,
      totaalIncl: totalen.totaalIncl,
      rolafbakening: ROLAFBAKENING,
    },
  });
  revalidatePath(`/projecten/${projectId}`);
  redirect(`/offertes/${offerte.id}`);
}

const statusSchema = z.enum(["concept", "verzonden", "geaccepteerd", "afgewezen"]);

export async function updateOfferte(id: string, fd: FormData) {
  const regels = offerteRegelsSchema.parse(JSON.parse(tekst(fd, "regels")));
  const totalen = berekenTotalen(regels);
  const offerte = await prisma.offerte.update({
    where: { id },
    data: {
      regels,
      status: statusSchema.parse(tekst(fd, "status")),
      rolafbakening: tekst(fd, "rolafbakening"),
      totaalExcl: totalen.totaalExcl,
      totaalIncl: totalen.totaalIncl,
    },
  });
  revalidatePath(`/offertes/${id}`);
  revalidatePath(`/projecten/${offerte.projectId}`);
}

export async function deleteOfferte(id: string) {
  const offerte = await prisma.offerte.delete({ where: { id } });
  revalidatePath(`/projecten/${offerte.projectId}`);
  redirect(`/projecten/${offerte.projectId}?tab=offerte`);
}
