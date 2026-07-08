import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        try {
          const user = await prisma.user.findUnique({
            where: { email: parsed.data.email.toLowerCase().trim() },
          });
          if (!user) {
            console.warn("[login] geen gebruiker gevonden voor dit e-mailadres");
            return null;
          }
          const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
          if (!ok) {
            console.warn("[login] onjuist wachtwoord");
            return null;
          }
          return { id: user.id, email: user.email, name: user.naam };
        } catch (e) {
          // Een DB-fout (tabellen ontbreken, geen verbinding) mag hier niet als
          // "onjuiste inloggegevens" verdwijnen: log de echte oorzaak.
          console.error("[login] databasefout tijdens authorize:", e);
          return null;
        }
      },
    }),
  ],
});
