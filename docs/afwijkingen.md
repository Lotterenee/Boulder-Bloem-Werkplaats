# Afwijkingen van het requirements-pakket

De app is gebouwd volgens `docs/fase-0` t/m `fase-6`. Op deze punten wijkt de
implementatie bewust af; alles hier is klein en terug te draaien.

## Infrastructuur
- **Harness-workflow in plaats van kale Railway-deploys.** Deploys lopen via
  feature-branches → `dev` → `main` (zie `.claude/HARNESS.md`), niet direct
  vanaf `main`. Migraties draaien niet als pre-deploy command maar in het
  `startCommand` van `railway.json` (`prisma migrate deploy && seed && start`),
  met `/api/health` als healthcheck. De seed is idempotent en slaat productie
  over via `SEED_DATA=false`.
- **AUTH_SECRET-fallback.** Preview-omgevingen krijgen niet automatisch een
  `AUTH_SECRET`; als die ontbreekt gebruikt de app `DATABASE_URL` (per omgeving
  uniek en geheim) als sleutel. Zet in productie altijd een echte `AUTH_SECRET`
  (zie `.env.example`).
- **Eén init-migratie.** Het volledige schema staat in één migratie
  (`prisma/migrations/*_init`) in plaats van zes fase-migraties; de app is in
  één keer opgebouwd, dus er was geen bestaand schema om te migreren.

## Functioneel
- **Offerte-route.** Offertes worden bewerkt op `/offertes/[id]` (bereikbaar
  via de project-tab "Offerte"), zodat het document bookmarkbaar en printbaar
  is. PDF = browser-print (de pagina heeft een nette printweergave).
- **Canvas-JSONB.** Elk geplaatst element heeft naast `elementId` ook een eigen
  `id` (instantie-id, nodig voor selectie/transformer): een superset van de
  gespecificeerde vorm.
- **Ontwerpcoach.** "Valruimte vrij", "water bij zand", "binnen terrein",
  "inheems-percentage" en "AKI-herinnering" zijn geïmplementeerd. "Waterzone
  niet naast peuterzone" en "schaduw bij zandzone" vragen zone-concepten die
  niet in het datamodel zitten; de water-bij-zand-check dekt dit gedeeltelijk
  als informatieve melding.
- **Terugkerende beheertaken.** Er is geen herhaal-model; de beheeragenda maakt
  bij "jaarlijks herhalen" direct taken voor de komende jaren aan (max 5).
- **Subsidiescan.** Het publieke endpoint maakt naast klant + project + taak
  ook meteen scan-aanvragen aan voor open regelingen die qua regio matchen.
- **Wachtwoord wijzigen** kan via Instellingen (het pakket noemde alleen
  handmatig via seed).

## Inlog-account altijd gegarandeerd
- Het seed-script maakt de inlog-gebruiker (`lotte@boulderbloem.nl`) **altijd**
  aan, ook bij `SEED_DATA=false`. Zonder account kan niemand inloggen, ook niet
  in productie of op een preview-omgeving die de demo-seed overslaat. Alleen de
  demo-data (subsidies, elementen, planten, educatie) valt onder de
  `SEED_DATA=false`-uitzondering. De upsert overschrijft nooit een gewijzigd
  wachtwoord.
- De Railway-startCommand laat een eventuele seed-fout de app niet blokkeren
  (`... || echo ...`); alleen een gefaalde migratie stopt de deploy. Zo blijft
  de app bereikbaar en zijn seed-problemen zichtbaar in de Railway-logs.
- `authorize()` vangt databasefouten expliciet en logt de echte oorzaak, zodat
  een ontbrekende tabel of verbinding niet stil als "onjuiste inloggegevens"
  verdwijnt.

## Seed-data
- De regeling "Themafonds Groenblauwe Schoolpleinen Zuid-Holland" is geseed met
  status **onzeker** en een waarschuwing in de voorwaarden (vermoedelijk
  vervangen door de Groene Pluspuntenregeling), conform het voorbehoud in
  `docs/seed-data/subsidieregelingen.md`.
- Educatiepakketten uit de seed hebben de richtprijzen uit het aanbod; zodra je
  activiteiten aan een pakket koppelt herberekent de app de totaalprijs als som
  van de activiteiten.

## Stijl
- Em-dashes zijn overal vervangen (repo-regel van de harness).
- Tailwind v3 met `tailwind.config.ts`, zoals het ontwerpsysteem-document
  specificeert.
