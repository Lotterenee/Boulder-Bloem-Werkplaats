# De Kas (Boulder Bloem)

Interne werkapplicatie van Boulder Bloem: klanten, projecten (7 fasen),
wensen/taken, subsidieradar, ontwerpstudio (react-konva), educatie (incl.
lesbibliotheek met printbladen), offertes, bibliotheken en
biodiversiteitsmetingen. Eén gebruiker (Lotte), Nederlands als UI-taal.

Lees eerst `docs/00-visie-en-context.md` en `docs/01-architectuur.md`. De
requirements per fase staan in `docs/fase-*.md`; bewuste implementatie-
afwijkingen in `docs/afwijkingen.md`.

## Stack & conventies
- Next.js 15 App Router (React 19, TypeScript), monoliet. Route-groepen `(app)`
  en `(print)` zijn beschermd (Auth.js v5 middleware); `(auth)` en
  `/api/health` + `/api/subsidiescan` zijn publiek.
- Data lezen in Server Components via Prisma; muteren via Server Actions in
  `lib/actions/*` met Zod-validatie (`lib/validators/*`).
- Nooit `new PrismaClient()` in componenten: gebruik `import { prisma } from
  "@/lib/prisma"` (singleton).
- JSONB-velden (`Ontwerp.canvas`, `Offerte.regels`, `Meting.waarnemingen`,
  `EducatieActiviteit.les`, `Printblad.inhoud`) altijd door hun Zod-schema
  halen bij lezen én schrijven.
- Domeinlogica (btw, rolafbakening, coach-checks) leeft in `lib/domain/` en
  `components/studio/`; btw-percentage is een constante in `lib/domain/btw.ts`.
- Huisstijl-tokens staan in `tailwind.config.ts` (zie
  `docs/03-ontwerpsysteem.md`); koppen in Fraunces (`font-heading`), body in
  Nunito Sans. UI-teksten in het Nederlands.
- Schemawijziging = `npx prisma migrate dev --name <naam>` + commit van de
  migratie. Architectuurkeuze = nieuwe ADR in `docs/adr/`.
- De seed (`prisma/seed.ts`) is idempotent (upserts op vaste id's), overschrijft
  nooit het wachtwoord van een bestaande gebruiker en slaat bij
  `SEED_DATA=false` (productie) alleen de demo-data over; de inlog-gebruiker
  wordt altijd gegarandeerd.

## Lokaal draaien
PostgreSQL nodig (zie `.env.example`). `npm install`, `npx prisma migrate dev`,
`npx prisma db seed`, `npm run dev`. Login: `lotte@boulderbloem.nl`, wachtwoord
in `prisma/seed.ts`.

## Harness infrastructure

Dit project gebruikt de
[harness-forge](https://github.com/Evolutionary-Leadership/harness-forge)
CI/CD-opzet. Lees `.claude/HARNESS.md` voor welke bestanden harness-managed
zijn (niet bewerken) en hoe feature-branches, Railway-previews en `/mergedev`,
`/review`, `/release` werken. Migraties en seed draaien bij elke deploy via het
`startCommand` in `railway.json`; elke feature-omgeving start met een lege
database.

## Writing rules

- Never use em dashes (U+2014). Use commas, colons, semicolons, or parentheses
  instead. A PreToolUse hook will block any write containing an em dash.

## Avoiding stream timeouts

- Avoid single tool calls that produce huge output; cap noisy commands with
  `| head` and prefer `Read` with offset/limit for large files.
- Break large file writes into multiple `Edit` calls instead of one mega
  `Write`.
- Prefer parallel small tool calls over a single huge sequential one.

## Railway preview URL

Na een push haalt een hook de preview-URL op; handmatig kan altijd met
`bash .claude/scripts/get-railway-url.sh`. Neem de URL op in je samenvatting
na de laatste push.
