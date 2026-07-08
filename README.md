# De Kas 🌿

Interne werkapplicatie van **Boulder Bloem** - ecologische natuurspeelplekken voor
scholen, BSO/kinderopvang, particulieren, recreatie en gemeenten.

De Kas is één plek voor: klanten & projecten, de 7 projectfasen, wensen & taken,
een subsidieradar, een ontwerpstudio op schaal, educatiepakketten, offertes met
btw, plant- en elementbibliotheken, partners-CRM en biodiversiteitsmetingen.

## Wat is dit?
Eén gebruiker (Lotte). Eén app. Ruggengraat = **Project**. Alles hangt aan een project.

## Tech stack (vastgesteld)
- **Next.js** (App Router, React 19 + TypeScript) - frontend én backend in één app
- **PostgreSQL** via de **Railway** PostgreSQL-plugin
- **Prisma** - schema-as-code + migraties
- **Tailwind CSS** - Boulder Bloem-huisstijl (zie `docs/03-ontwerpsysteem.md`)
- **Auth.js (NextAuth) v5** - e-mail + wachtwoord, één gebruiker
- **Konva.js / react-konva** - 2D ontwerpstudio (canvas)
- Hosting: **Railway**, automatische deploys vanaf `main`

## Quickstart (lokaal)
```bash
git clone <repo> && cd <repo>
cp .env.example .env            # vul DATABASE_URL + AUTH_SECRET in
npm install                     # draait postinstall: prisma generate
npx prisma migrate dev          # maakt lokale schema + tabellen
npx prisma db seed              # laadt subsidies, elementen, planten, educatie
npm run dev                     # http://localhost:3000
```
Login: het seed-script maakt de gebruiker `lotte@boulderbloem.nl` aan
(wachtwoord in `prisma/seed.ts`; wijzig direct na eerste login via Instellingen).

## Deploy (harness + Railway)
Deze repo draait op de [Harness Companion](https://www.harnesscompanion.com)-workflow:
elke feature-branch krijgt automatisch een eigen Railway-preview met PostgreSQL,
`/mergedev` promoot naar `dev`, `/release` naar productie (`main`). Migraties en
seed draaien bij elke deploy via het `startCommand` in `railway.json`; productie
slaat de seed over (`SEED_DATA=false`). Zie `.claude/HARNESS.md` en
[docs/beheer-en-onderhoud.md](docs/beheer-en-onderhoud.md). Verschillen tussen
de oorspronkelijke requirements en deze implementatie staan in
[docs/afwijkingen.md](docs/afwijkingen.md).

## Documentatie
| Doc | Inhoud |
|-----|--------|
| [00 Visie & context](docs/00-visie-en-context.md) | Wat, voor wie, kernprincipes |
| [01 Architectuur](docs/01-architectuur.md) | C4 + Mermaid, stackkeuzes, repostructuur, conventies |
| [02 Datamodel](docs/02-datamodel.md) | Volledig Prisma-schema, uitleg per model, migratiestrategie |
| [03 Ontwerpsysteem](docs/03-ontwerpsysteem.md) | Huisstijl-tokens, componenten, toegankelijkheid |
| [Fase 0](docs/fase-0-fundament.md) → [Fase 6](docs/fase-6-meetbaar-groen.md) | Requirements per bouwfase |
| [ADR's](docs/adr/) | Architectuurbeslissingen (MADR) |
| [Seed-data](docs/seed-data/) | Subsidies, elementen, planten, educatie |
| [Beheer & onderhoud](docs/beheer-en-onderhoud.md) | Deploy-runbook, backups, troubleshooting |
| [Woordenlijst](docs/woordenlijst.md) | Domeinbegrippen (WAS 2023, fasen, statussen) |

## Bijdragen / wijzigen
Zie [docs/beheer-en-onderhoud.md](docs/beheer-en-onderhoud.md) → "Hoe voer ik een wijziging door".
Elke architectuur­beslissing = een nieuwe ADR. Elke schemawijziging = een Prisma-migratie.
