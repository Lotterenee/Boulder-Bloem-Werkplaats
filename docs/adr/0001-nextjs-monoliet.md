# ADR-0001 - Next.js App Router als monoliet (frontend + backend)
Status: Aanvaard · Datum: 2026-07-07
## Context
Eén bouwer/onderhouder, meerdere domeinen, wens tot nabouwbaarheid.
## Beslissing
Eén Next.js-app (App Router, React 19 + TS): Server Components lezen data via Prisma;
mutaties via Server Actions; publieke API via Route Handlers.
## Alternatieven
Aparte SPA + API-backend (meer bewegende delen); Remix/SvelteKit (minder AI-ondersteuning).
## Gevolgen
+ Minimale infrastructuur, typeveilig end-to-end. − Alles in één deploy (acceptabel).
