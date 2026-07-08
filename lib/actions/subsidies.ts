"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { AanvraagStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { tekst, tekstOfNull, getalOfNull, datumOfNull, aangevinkt } from "@/lib/forms";

const subsidieSchema = z.object({
  naam: z.string().min(1),
  verstrekker: z.string().min(1),
  niveau: z.enum(["landelijk", "provincie", "gemeente", "waterschap", "fonds"]),
  regio: z.string().nullable(),
  doelgroep: z.string().nullable(),
  maxBedrag: z.number().nonnegative().nullable(),
  percentage: z.string().nullable(),
  voorwaarden: z.string().nullable(),
  deadline: z.date().nullable(),
  doorlopend: z.boolean(),
  status: z.enum(["open", "gesloten", "onzeker"]),
  bronlink: z.string().nullable(),
});

function subsidieData(fd: FormData) {
  return subsidieSchema.parse({
    naam: tekst(fd, "naam"),
    verstrekker: tekst(fd, "verstrekker"),
    niveau: tekst(fd, "niveau"),
    regio: tekstOfNull(fd, "regio"),
    doelgroep: tekstOfNull(fd, "doelgroep"),
    maxBedrag: getalOfNull(fd, "maxBedrag"),
    percentage: tekstOfNull(fd, "percentage"),
    voorwaarden: tekstOfNull(fd, "voorwaarden"),
    deadline: datumOfNull(fd, "deadline"),
    doorlopend: aangevinkt(fd, "doorlopend"),
    status: tekst(fd, "status"),
    bronlink: tekstOfNull(fd, "bronlink"),
  });
}

export async function createSubsidie(fd: FormData) {
  const subsidie = await prisma.subsidie.create({
    data: { ...subsidieData(fd), laatstGecheckt: new Date() },
  });
  revalidatePath("/subsidies");
  redirect(`/subsidies/${subsidie.id}`);
}

export async function updateSubsidie(id: string, fd: FormData) {
  await prisma.subsidie.update({ where: { id }, data: subsidieData(fd) });
  revalidatePath("/subsidies");
  revalidatePath(`/subsidies/${id}`);
}

/** Markeer een regeling als vandaag geverifieerd (kleurcode springt op groen). */
export async function markeerGecheckt(id: string) {
  await prisma.subsidie.update({
    where: { id },
    data: { laatstGecheckt: new Date() },
  });
  revalidatePath("/subsidies");
  revalidatePath(`/subsidies/${id}`);
}

// ---------- Aanvragen ----------

export async function createAanvraag(fd: FormData) {
  const projectId = tekst(fd, "projectId");
  const subsidieId = tekst(fd, "subsidieId");
  if (!projectId || !subsidieId) throw new Error("Project en subsidie zijn verplicht");

  const subsidie = await prisma.subsidie.findUniqueOrThrow({ where: { id: subsidieId } });
  await prisma.subsidieAanvraag.create({
    data: {
      projectId,
      subsidieId,
      // Neem de deadline van de regeling als startpunt over.
      deadline: datumOfNull(fd, "deadline") ?? subsidie.deadline,
      notities: tekstOfNull(fd, "notities"),
    },
  });
  revalidatePath(`/projecten/${projectId}`);
  revalidatePath("/dashboard");
}

const aanvraagStatusSchema = z.enum([
  "scan",
  "kansrijk",
  "in_voorbereiding",
  "ingediend",
  "toegekend",
  "afgewezen",
  "verantwoording",
  "afgerond",
]);

export async function updateAanvraag(id: string, fd: FormData) {
  const aanvraag = await prisma.subsidieAanvraag.update({
    where: { id },
    data: {
      status: aanvraagStatusSchema.parse(tekst(fd, "status")) as AanvraagStatus,
      bedragAangevraagd: getalOfNull(fd, "bedragAangevraagd"),
      bedragToegekend: getalOfNull(fd, "bedragToegekend"),
      deadline: datumOfNull(fd, "deadline"),
      notities: tekstOfNull(fd, "notities"),
    },
  });
  revalidatePath(`/projecten/${aanvraag.projectId}`);
  revalidatePath("/dashboard");
}

export async function deleteAanvraag(id: string) {
  const aanvraag = await prisma.subsidieAanvraag.delete({ where: { id } });
  revalidatePath(`/projecten/${aanvraag.projectId}`);
  revalidatePath("/dashboard");
}
