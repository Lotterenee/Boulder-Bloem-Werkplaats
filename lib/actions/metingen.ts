"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { tekst, tekstOfNull, datumOfNull, getalOfNull } from "@/lib/forms";
import { waarnemingenSchema } from "@/lib/validators/meting";

export async function createMeting(fd: FormData) {
  const projectId = tekst(fd, "projectId");
  const datum = datumOfNull(fd, "datum");
  if (!datum) throw new Error("Datum is verplicht");

  const waarnemingen = waarnemingenSchema.parse(
    JSON.parse(tekst(fd, "waarnemingen"))
  );
  await prisma.meting.create({
    data: {
      projectId,
      datum,
      type: z.enum(["nulmeting", "jaartelling"]).parse(tekst(fd, "type")),
      waarnemingen,
      notities: tekstOfNull(fd, "notities"),
    },
  });
  revalidatePath(`/projecten/${projectId}`);
}

export async function deleteMeting(id: string) {
  const meting = await prisma.meting.delete({ where: { id } });
  revalidatePath(`/projecten/${meting.projectId}`);
}

/**
 * Beheertaak aanmaken, optioneel jaarlijks herhaald: er worden dan meteen
 * taken voor de komende jaren klaargezet (zelfde titel, deadline +1 jaar).
 */
export async function createBeheerTaak(fd: FormData) {
  const projectId = tekst(fd, "projectId");
  const titel = tekst(fd, "titel");
  const deadline = datumOfNull(fd, "deadline");
  const herhaalJaren = Math.min(Math.max(getalOfNull(fd, "herhaalJaren") ?? 0, 0), 5);
  if (!titel || !deadline) throw new Error("Titel en eerste datum zijn verplicht");

  const taken = [];
  for (let i = 0; i <= herhaalJaren; i++) {
    const d = new Date(deadline);
    d.setFullYear(d.getFullYear() + i);
    taken.push({
      projectId,
      titel: herhaalJaren > 0 ? `${titel} (${d.getFullYear()})` : titel,
      categorie: "beheer" as const,
      deadline: d,
    });
  }
  await prisma.taak.createMany({ data: taken });
  revalidatePath(`/projecten/${projectId}`);
  revalidatePath("/dashboard");
}
