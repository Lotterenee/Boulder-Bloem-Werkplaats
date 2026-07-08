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

## Lesbibliotheek (Fase 4b)
- De migratie heet `20260708085448_lesbibliotheek` (Prisma's timestamp-naamgeving
  via `migrate dev --name lesbibliotheek`), niet letterlijk `0007_lesbibliotheek`
  zoals het fase-document voorstelt.
- `LesSchema` heeft een extra optioneel veld `nummer` (werkboek-volgorde) dat
  niet in de oorspronkelijke requirements stond; het stuurt de volgorde en het
  nummer in het lesbibliotheek-overzicht.
- De 10 lessen hergebruiken waar mogelijk de bestaande activiteit-id's uit de
  Fase-4-seed (wilgen, moestuin, insectenhotel, vogels, waterdiertjes), zodat
  pakket-koppelingen intact blijven; titels en prijzen zijn bijgewerkt naar
  het werkboek. De overige 5 lessen zijn nieuwe activiteiten (ea-les-*).
  Oudere activiteiten zonder lesuitwerking blijven gewoon bestaan.
- De lesinhoud is programmatisch 1-op-1 uit het werkboek-HTML overgenomen;
  em-dashes zijn vervangen door en-dashes (repo-regel). Eén printblad (het
  bordje bij de hooidag) gebruikt het html-escape-blok, zoals voorzien.

## Ontwerpstudio 3b/3c (seizoensbloei, zones, pakketten)
- De twee voorgestelde migraties (`0008_seizoensbloei` en
  `0009_zones_pakketten`) zijn als een gecombineerde migratie toegevoegd
  (`*_seizoensbloei_zones_pakketten`), plus het `Plant.prijs`-veld (nodig voor
  de pakket-offerte-regel; stond wel in de tekst maar niet in de tabelkolommen).
- Beplanting leeft nu op het canvas (`Ontwerp.canvas.beplanting`) in plaats van
  alleen via de losse `OntwerpPlant`-koppeling. De oude koppel-UI onder het
  canvas is vervangen door planten plaatsen in de studio zelf; `OntwerpPlant`
  blijft in het schema voor compatibiliteit. Het inheems-percentage en de
  offerte-beplanting worden nu uit de canvas-beplanting berekend.
- De exacte zone-coordinaten uit het v3-prototype (`ZONES`-array) waren niet
  meegeleverd; de relatieve posities zijn zelf ontworpen op basis van de
  composities in sectie 5.2 van de requirements.
- "Bewaar als sjabloon" bewaart de hele huidige opstelling (elementen +
  beplanting) als eigen zone-sjabloon met thumbnail, in plaats van een
  meervoudige selectie (de studio kent enkelvoudige selectie).
- Unit-tests voor de bloei-helpers draaien via `npm test` (tsx + node assert),
  zonder los testframework.

## Demo-data (nepklanten) op dev
- Naast de bibliotheekdata seedt `prisma/seed-data/demo.ts` een set nepklanten,
  projecten (over alle 7 fasen), wensen, taken, subsidieaanvragen, een ontwerp
  met beplanting, een offerte en twee metingen, zodat elk scherm op dev/preview
  gevuld is. Idempotent (vaste id's met prefix `demo-`; child-records worden per
  project vervangen).
- Gated met `SEED_DEMO`: draait wanneer de demo-data is toegestaan
  (`SEED_DATA !== "false"`) en `SEED_DEMO !== "false"`. Productie heeft
  `SEED_DATA=false` en krijgt dit dus nooit; wie op dev wel de bibliotheken maar
  geen nepklanten wil, zet `SEED_DEMO=false`.

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
