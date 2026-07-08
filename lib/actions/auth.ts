"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { signIn, signOut, auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Onjuiste inloggegevens. Probeer het opnieuw.";
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

export async function wijzigWachtwoord(
  _prevState: { ok?: boolean; fout?: string } | undefined,
  formData: FormData
): Promise<{ ok?: boolean; fout?: string }> {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const huidig = String(formData.get("huidig") ?? "");
  const nieuw = String(formData.get("nieuw") ?? "");
  const herhaal = String(formData.get("herhaal") ?? "");

  if (nieuw.length < 10) {
    return { fout: "Nieuw wachtwoord moet minimaal 10 tekens zijn." };
  }
  if (nieuw !== herhaal) {
    return { fout: "De herhaling komt niet overeen." };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user || !(await bcrypt.compare(huidig, user.passwordHash))) {
    return { fout: "Huidig wachtwoord klopt niet." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(nieuw, 12) },
  });
  return { ok: true };
}
