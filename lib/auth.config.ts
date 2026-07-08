import type { NextAuthConfig } from "next-auth";

// AUTH_SECRET hoort in productie expliciet gezet te worden. Als fallback
// gebruiken we DATABASE_URL (uniek en geheim per Railway-omgeving), zodat
// preview-omgevingen zonder handmatige configuratie kunnen inloggen.
const secret =
  process.env.AUTH_SECRET ??
  process.env.DATABASE_URL ??
  "de-kas-onveilige-dev-secret";

const PUBLIC_PATHS = ["/login", "/api/auth", "/api/health", "/api/subsidiescan"];

export const authConfig = {
  secret,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const loggedIn = !!auth?.user;
      const isPublic = PUBLIC_PATHS.some((p) => nextUrl.pathname.startsWith(p));
      if (isPublic) {
        if (loggedIn && nextUrl.pathname.startsWith("/login")) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }
      return loggedIn;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
