"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { tekst, tekstOfNull, getalOfNull, aangevinkt } from "@/lib/forms";

// ---------- Elementen ----------

const elementSchema = z.object({
  naam: z.string().min(1),
  categorie: z.enum(["klimmen", "water", "groen", "rust", "moestuin", "pad", "terrein"]),
  soort: z.enum(["speelaanleiding", "speeltoestel"]),
  standaardBreedteM: z.number().positive().nullable(),
  standaardDiepteM: z.number().positive().nullable(),
  valruimteM: z.number().nonnegative().nullable(),
  indicatieprijs: z.number().nonnegative().nullable(),
  icoon: z.string().nullable(),
});

function elementData(fd: FormData) {
  return elementSchema.parse({
    naam: tekst(fd, "naam"),
    categorie: tekst(fd, "categorie"),
    soort: tekst(fd, "soort"),
    standaardBreedteM: getalOfNull(fd, "standaardBreedteM"),
    standaardDiepteM: getalOfNull(fd, "standaardDiepteM"),
    valruimteM: getalOfNull(fd, "valruimteM"),
    indicatieprijs: getalOfNull(fd, "indicatieprijs"),
    icoon: tekstOfNull(fd, "icoon"),
  });
}

export async function createElement(fd: FormData) {
  await prisma.element.create({ data: elementData(fd) });
  revalidatePath("/bibliotheek/elementen");
}

export async function updateElement(id: string, fd: FormData) {
  await prisma.element.update({ where: { id }, data: elementData(fd) });
  revalidatePath("/bibliotheek/elementen");
}

export async function deleteElement(id: string) {
  await prisma.element.delete({ where: { id } });
  revalidatePath("/bibliotheek/elementen");
  redirect("/bibliotheek/elementen");
}

// ---------- Planten ----------

const plantSchema = z.object({
  naamNL: z.string().min(1),
  naamWetenschappelijk: z.string().nullable(),
  categorie: z.string().nullable(),
  inheems: z.boolean(),
  waardplantVoor: z.string().nullable(),
  bloeitijd: z.string().nullable(),
  licht: z.string().nullable(),
  bodem: z.string().nullable(),
  giftig: z.boolean(),
});

function plantData(fd: FormData) {
  return plantSchema.parse({
    naamNL: tekst(fd, "naamNL"),
    naamWetenschappelijk: tekstOfNull(fd, "naamWetenschappelijk"),
    categorie: tekstOfNull(fd, "categorie"),
    inheems: aangevinkt(fd, "inheems"),
    waardplantVoor: tekstOfNull(fd, "waardplantVoor"),
    bloeitijd: tekstOfNull(fd, "bloeitijd"),
    licht: tekstOfNull(fd, "licht"),
    bodem: tekstOfNull(fd, "bodem"),
    giftig: aangevinkt(fd, "giftig"),
  });
}

export async function createPlant(fd: FormData) {
  await prisma.plant.create({ data: plantData(fd) });
  revalidatePath("/bibliotheek/planten");
}

export async function updatePlant(id: string, fd: FormData) {
  await prisma.plant.update({ where: { id }, data: plantData(fd) });
  revalidatePath("/bibliotheek/planten");
}

export async function deletePlant(id: string) {
  const inOntwerpen = await prisma.ontwerpPlant.count({ where: { plantId: id } });
  if (inOntwerpen > 0) {
    throw new Error("Plant is gekoppeld aan een ontwerp en kan niet verwijderd worden.");
  }
  await prisma.plant.delete({ where: { id } });
  revalidatePath("/bibliotheek/planten");
  redirect("/bibliotheek/planten");
}

// ---------- Partners ----------

const partnerSchema = z.object({
  naam: z.string().min(1),
  type: z.enum(["groenaannemer", "toestelleverancier", "kwekerij", "keuringsinstantie"]),
  contact: z.string().nullable(),
  tarieven: z.string().nullable(),
  notities: z.string().nullable(),
});

function partnerData(fd: FormData) {
  return partnerSchema.parse({
    naam: tekst(fd, "naam"),
    type: tekst(fd, "type"),
    contact: tekstOfNull(fd, "contact"),
    tarieven: tekstOfNull(fd, "tarieven"),
    notities: tekstOfNull(fd, "notities"),
  });
}

export async function createPartner(fd: FormData) {
  await prisma.partner.create({ data: partnerData(fd) });
  revalidatePath("/bibliotheek/partners");
}

export async function updatePartner(id: string, fd: FormData) {
  await prisma.partner.update({ where: { id }, data: partnerData(fd) });
  revalidatePath("/bibliotheek/partners");
}

export async function deletePartner(id: string) {
  await prisma.partner.delete({ where: { id } });
  revalidatePath("/bibliotheek/partners");
  redirect("/bibliotheek/partners");
}
