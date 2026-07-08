"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ProjectFase } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { projectSchema, wensSchema, taakSchema } from "@/lib/validators/kern";
import { tekst, tekstOfNull, getalOfNull, datumOfNull } from "@/lib/forms";

function projectData(fd: FormData) {
  return projectSchema.parse({
    klantId: tekst(fd, "klantId"),
    naam: tekst(fd, "naam"),
    fase: tekst(fd, "fase"),
    status: tekst(fd, "status"),
    locatieadres: tekstOfNull(fd, "locatieadres"),
    oppervlakteM2: getalOfNull(fd, "oppervlakteM2"),
    budgetIndicatie: getalOfNull(fd, "budgetIndicatie"),
    volgendeActie: tekstOfNull(fd, "volgendeActie"),
    volgendeActieDatum: datumOfNull(fd, "volgendeActieDatum"),
    samenvatting: tekstOfNull(fd, "samenvatting"),
  });
}

export async function createProject(fd: FormData) {
  const project = await prisma.project.create({ data: projectData(fd) });
  revalidatePath("/projecten");
  revalidatePath("/dashboard");
  redirect(`/projecten/${project.id}`);
}

export async function updateProject(id: string, fd: FormData) {
  await prisma.project.update({ where: { id }, data: projectData(fd) });
  revalidatePath("/projecten");
  revalidatePath(`/projecten/${id}`);
  revalidatePath("/dashboard");
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/projecten");
  revalidatePath("/dashboard");
  redirect("/projecten");
}

export async function setProjectFase(id: string, fase: ProjectFase) {
  await prisma.project.update({ where: { id }, data: { fase } });
  revalidatePath(`/projecten/${id}`);
  revalidatePath("/dashboard");
}

// ---------- Wensen ----------

export async function addWens(fd: FormData) {
  const data = wensSchema.parse({
    projectId: tekst(fd, "projectId"),
    bron: tekst(fd, "bron"),
    tekst: tekst(fd, "tekst"),
    prioriteit: tekst(fd, "prioriteit"),
  });
  await prisma.wens.create({ data });
  revalidatePath(`/projecten/${data.projectId}`);
}

export async function toggleWensVerwerkt(id: string) {
  const wens = await prisma.wens.findUniqueOrThrow({ where: { id } });
  await prisma.wens.update({
    where: { id },
    data: { verwerkt: !wens.verwerkt },
  });
  revalidatePath(`/projecten/${wens.projectId}`);
}

export async function deleteWens(id: string) {
  const wens = await prisma.wens.delete({ where: { id } });
  revalidatePath(`/projecten/${wens.projectId}`);
}

// ---------- Taken ----------

export async function createTaak(fd: FormData) {
  const data = taakSchema.parse({
    projectId: tekstOfNull(fd, "projectId"),
    titel: tekst(fd, "titel"),
    categorie: tekst(fd, "categorie"),
    deadline: datumOfNull(fd, "deadline"),
  });
  await prisma.taak.create({ data });
  if (data.projectId) revalidatePath(`/projecten/${data.projectId}`);
  revalidatePath("/dashboard");
}

export async function toggleTaak(id: string) {
  const taak = await prisma.taak.findUniqueOrThrow({ where: { id } });
  await prisma.taak.update({
    where: { id },
    data: { afgerond: !taak.afgerond },
  });
  if (taak.projectId) revalidatePath(`/projecten/${taak.projectId}`);
  revalidatePath("/dashboard");
}

export async function deleteTaak(id: string) {
  const taak = await prisma.taak.delete({ where: { id } });
  if (taak.projectId) revalidatePath(`/projecten/${taak.projectId}`);
  revalidatePath("/dashboard");
}
