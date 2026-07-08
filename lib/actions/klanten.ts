"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { klantSchema } from "@/lib/validators/kern";
import { tekst, tekstOfNull } from "@/lib/forms";

function klantData(fd: FormData) {
  return klantSchema.parse({
    organisatie: tekst(fd, "organisatie"),
    type: tekst(fd, "type"),
    contactpersoon: tekstOfNull(fd, "contactpersoon"),
    email: tekstOfNull(fd, "email"),
    telefoon: tekstOfNull(fd, "telefoon"),
    adres: tekstOfNull(fd, "adres"),
    plaats: tekstOfNull(fd, "plaats"),
    gemeente: tekst(fd, "gemeente"),
    notities: tekstOfNull(fd, "notities"),
  });
}

export async function createKlant(fd: FormData) {
  const klant = await prisma.klant.create({ data: klantData(fd) });
  revalidatePath("/klanten");
  redirect(`/klanten/${klant.id}`);
}

export async function updateKlant(id: string, fd: FormData) {
  await prisma.klant.update({ where: { id }, data: klantData(fd) });
  revalidatePath("/klanten");
  revalidatePath(`/klanten/${id}`);
}

export async function deleteKlant(id: string) {
  const aantalProjecten = await prisma.project.count({ where: { klantId: id } });
  if (aantalProjecten > 0) {
    throw new Error("Klant heeft nog projecten en kan niet verwijderd worden.");
  }
  await prisma.klant.delete({ where: { id } });
  revalidatePath("/klanten");
  redirect("/klanten");
}
