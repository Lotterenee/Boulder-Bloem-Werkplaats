"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { tekst, tekstOfNull, getalOfNull } from "@/lib/forms";

const activiteitSchema = z.object({
  titel: z.string().min(1),
  omschrijving: z.string().nullable(),
  leeftijdVan: z.number().int().nonnegative().nullable(),
  leeftijdTot: z.number().int().nonnegative().nullable(),
  seizoen: z.string().nullable(),
  duurMinuten: z.number().int().positive().nullable(),
  doelen: z.string().nullable(),
  benodigdheden: z.string().nullable(),
  prijs: z.number().nonnegative().nullable(),
});

function activiteitData(fd: FormData) {
  return activiteitSchema.parse({
    titel: tekst(fd, "titel"),
    omschrijving: tekstOfNull(fd, "omschrijving"),
    leeftijdVan: getalOfNull(fd, "leeftijdVan"),
    leeftijdTot: getalOfNull(fd, "leeftijdTot"),
    seizoen: tekstOfNull(fd, "seizoen"),
    duurMinuten: getalOfNull(fd, "duurMinuten"),
    doelen: tekstOfNull(fd, "doelen"),
    benodigdheden: tekstOfNull(fd, "benodigdheden"),
    prijs: getalOfNull(fd, "prijs"),
  });
}

export async function createActiviteit(fd: FormData) {
  await prisma.educatieActiviteit.create({ data: activiteitData(fd) });
  revalidatePath("/educatie/activiteiten");
}

export async function updateActiviteit(id: string, fd: FormData) {
  await prisma.educatieActiviteit.update({ where: { id }, data: activiteitData(fd) });
  await herberekenPakkettenMetActiviteit(id);
  revalidatePath("/educatie");
}

export async function deleteActiviteit(id: string) {
  const inPakketten = await prisma.pakketActiviteit.count({ where: { activiteitId: id } });
  if (inPakketten > 0) {
    throw new Error("Activiteit zit nog in een pakket en kan niet verwijderd worden.");
  }
  await prisma.educatieActiviteit.delete({ where: { id } });
  revalidatePath("/educatie/activiteiten");
}

// ---------- Pakketten ----------

async function herberekenTotaalprijs(pakketId: string) {
  const koppelingen = await prisma.pakketActiviteit.findMany({
    where: { pakketId },
    include: { activiteit: { select: { prijs: true } } },
  });
  const som = koppelingen.reduce(
    (acc, k) => acc + Number(k.activiteit.prijs ?? 0),
    0
  );
  await prisma.educatiePakket.update({
    where: { id: pakketId },
    data: { totaalprijs: som },
  });
}

async function herberekenPakkettenMetActiviteit(activiteitId: string) {
  const koppelingen = await prisma.pakketActiviteit.findMany({
    where: { activiteitId },
    select: { pakketId: true },
  });
  for (const k of koppelingen) await herberekenTotaalprijs(k.pakketId);
}

export async function createPakket(fd: FormData) {
  const pakket = await prisma.educatiePakket.create({
    data: {
      naam: tekst(fd, "naam"),
      projectId: tekstOfNull(fd, "projectId"),
    },
  });
  const projectId = tekstOfNull(fd, "projectId");
  if (projectId) {
    revalidatePath(`/projecten/${projectId}`);
    return;
  }
  revalidatePath("/educatie/pakketten");
  redirect(`/educatie/pakketten/${pakket.id}`);
}

export async function updatePakket(id: string, fd: FormData) {
  await prisma.educatiePakket.update({
    where: { id },
    data: {
      naam: tekst(fd, "naam"),
      status: z.enum(["concept", "aangeboden", "verkocht"]).parse(tekst(fd, "status")),
      projectId: tekstOfNull(fd, "projectId"),
    },
  });
  revalidatePath(`/educatie/pakketten/${id}`);
  revalidatePath("/educatie/pakketten");
}

export async function deletePakket(id: string) {
  await prisma.educatiePakket.delete({ where: { id } });
  revalidatePath("/educatie/pakketten");
  redirect("/educatie/pakketten");
}

export async function addActiviteitAanPakket(pakketId: string, fd: FormData) {
  const activiteitId = tekst(fd, "activiteitId");
  await prisma.pakketActiviteit.upsert({
    where: { pakketId_activiteitId: { pakketId, activiteitId } },
    update: {},
    create: { pakketId, activiteitId },
  });
  await herberekenTotaalprijs(pakketId);
  revalidatePath(`/educatie/pakketten/${pakketId}`);
}

export async function removeActiviteitVanPakket(koppelingId: string) {
  const koppeling = await prisma.pakketActiviteit.delete({ where: { id: koppelingId } });
  await herberekenTotaalprijs(koppeling.pakketId);
  revalidatePath(`/educatie/pakketten/${koppeling.pakketId}`);
}

/** Koppel een bestaand pakket aan een project (of ontkoppel met projectId=null). */
export async function koppelPakketAanProject(pakketId: string, projectId: string | null) {
  await prisma.educatiePakket.update({
    where: { id: pakketId },
    data: { projectId },
  });
  if (projectId) revalidatePath(`/projecten/${projectId}`);
  revalidatePath("/educatie/pakketten");
}
