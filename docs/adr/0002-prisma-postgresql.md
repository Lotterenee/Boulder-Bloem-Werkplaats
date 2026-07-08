# ADR-0002 - Prisma + PostgreSQL
Status: Aanvaard · 2026-07-07
## Beslissing
Prisma als ORM (schema-as-code, migraties) op PostgreSQL (Railway-plugin).
Prisma-singleton in `lib/prisma.ts` tegen connectieleaks bij hot-reload.
Productie: `prisma migrate deploy` (nooit `migrate dev`).
## Gevolgen
+ Typeveilige queries, versioneerde migraties, JSONB-ondersteuning.
