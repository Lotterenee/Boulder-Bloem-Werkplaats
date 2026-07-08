# 02 - Datamodel

## ERD (Mermaid)
```mermaid
erDiagram
    Klant ||--o{ Project : heeft
    Project ||--o{ Wens : bevat
    Project ||--o{ Taak : heeft
    Project ||--o{ Ontwerp : heeft
    Project ||--o{ SubsidieAanvraag : heeft
    Project ||--o{ EducatiePakket : heeft
    Project ||--o{ Offerte : heeft
    Project ||--o{ Meting : heeft
    Ontwerp ||--o{ OntwerpPlant : plaatst
    Plant ||--o{ OntwerpPlant : verschijnt_in
    Subsidie ||--o{ SubsidieAanvraag : voor
    EducatiePakket ||--o{ PakketActiviteit : bundelt
    EducatieActiviteit ||--o{ PakketActiviteit : in
    EducatieActiviteit ||--o{ Printblad : heeft
    ZoneSjabloon ||--o{ ZoneSjabloonRegel : bevat
    PlantPakket ||--o{ PlantPakketRegel : bundelt
    Plant ||--o{ PlantPakketRegel : in
    Element ||.. Ontwerp : "gebruikt via canvas JSONB"
    Plant ||.. Ontwerp : "beplanting via canvas JSONB"
    Partner }o..o{ Project : "betrokken (los)"
```

## Fase 3b/3c: seizoensbloei, zone-sjablonen en plantpakketten
- `Plant` kreeg bloeivelden: `bloeimaanden` (12-bits masker, bit 0 = januari,
  de rekenbron), `wintergroen`, `bloeikleur`, `drachtNectar`/`drachtPollen`,
  `hoogteM`, `diameterM` en `prijs`. Het leesbare `bloeitijd`-tekstveld blijft.
- `Ontwerp.canvas` (JSONB) bevat naast `elementen` nu ook `beplanting`
  (geplaatste plant-instanties: id, plantId, x, y), gevalideerd met het
  canvas-Zod-schema. Zie ADR-0008.
- `ZoneSjabloon` + `ZoneSjabloonRegel` (regel verwijst via `soort` + `refId`
  naar Element of Plant met relatieve positie) en `PlantPakket` +
  `PlantPakketRegel` zijn echte tabellen (telbaar, querybaar). Bloei-helpers
  staan in `lib/domain/bloei.ts`.

## Volledig Prisma-schema
> Plaats dit in `prisma/schema.prisma`. Provider = postgresql.

```prisma
generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ---------- ENUMS ----------
enum KlantType { school bso particulier recreatie gemeente anders }
enum ProjectFase { kennismaking locatieanalyse samen_ontwerpen schetsontwerp definitief_ontwerp aanleg oplevering_beheer }
enum ProjectStatus { actief gepauzeerd afgerond verloren }
enum WensBron { kinderen team ouders schouw opdrachtgever }
enum WensPrioriteit { moet graag misschien }
enum TaakCategorie { algemeen subsidie offerte beheer acquisitie }
enum ElementCategorie { klimmen water groen rust moestuin pad terrein }
enum ElementSoort { speelaanleiding speeltoestel } // WAS 2023-onderscheid
enum SubsidieNiveau { landelijk provincie gemeente waterschap fonds }
enum RegelingStatus { open gesloten onzeker }
enum AanvraagStatus { scan kansrijk in_voorbereiding ingediend toegekend afgewezen verantwoording afgerond }
enum PakketStatus { concept aangeboden verkocht }
enum OfferteStatus { concept verzonden geaccepteerd afgewezen }
enum MetingType { nulmeting jaartelling }
enum PartnerType { groenaannemer toestelleverancier kwekerij keuringsinstantie }

// ---------- AUTH ----------
model User {
  id           String  @id @default(cuid())
  email        String  @unique
  passwordHash String
  naam         String?
  createdAt    DateTime @default(now())
}

// ---------- KERN ----------
model Klant {
  id            String   @id @default(cuid())
  organisatie   String
  type          KlantType
  contactpersoon String?
  email         String?
  telefoon      String?
  adres         String?
  plaats        String?
  gemeente      String   // VERPLICHT: subsidieradar filtert hierop
  notities      String?
  projecten     Project[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Project {
  id             String        @id @default(cuid())
  klantId        String
  klant          Klant         @relation(fields: [klantId], references: [id])
  naam           String
  fase           ProjectFase   @default(kennismaking)
  status         ProjectStatus @default(actief)
  locatieadres   String?
  oppervlakteM2  Int?
  budgetIndicatie Decimal?     @db.Decimal(10,2)
  volgendeActie  String?
  volgendeActieDatum DateTime?
  samenvatting   String?
  wensen         Wens[]
  taken          Taak[]
  ontwerpen      Ontwerp[]
  subsidieAanvragen SubsidieAanvraag[]
  educatiePakketten EducatiePakket[]
  offertes       Offerte[]
  metingen       Meting[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  @@index([fase])
  @@index([status])
}

model Wens {
  id         String        @id @default(cuid())
  projectId  String
  project    Project        @relation(fields: [projectId], references: [id], onDelete: Cascade)
  bron       WensBron
  tekst      String
  prioriteit WensPrioriteit @default(graag)
  verwerkt   Boolean        @default(false)
  @@index([projectId])
}

model Taak {
  id        String        @id @default(cuid())
  projectId String?
  project   Project?      @relation(fields: [projectId], references: [id], onDelete: SetNull)
  titel     String
  categorie TaakCategorie @default(algemeen)
  deadline  DateTime?
  afgerond  Boolean       @default(false)
  @@index([deadline])
}

// ---------- ONTWERPSTUDIO ----------
model Ontwerp {
  id           String   @id @default(cuid())
  projectId    String
  project      Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  naam         String
  versie       Int      @default(1)
  canvas       Json     // JSONB: {terrein:{breedteM,diepteM}, raster:1, elementen:[{elementId,x,y,rotatie,schaal}]}
  laatstBewerkt DateTime @updatedAt
  planten      OntwerpPlant[]
  @@index([projectId])
}

model Element {
  id             String           @id @default(cuid())
  naam           String
  categorie      ElementCategorie
  soort          ElementSoort     // speelaanleiding | speeltoestel (WAS 2023)
  standaardBreedteM Decimal?      @db.Decimal(5,2)
  standaardDiepteM  Decimal?      @db.Decimal(5,2)
  valruimteM     Decimal?         @db.Decimal(5,2) // benodigde valruimte-straal
  indicatieprijs Decimal?         @db.Decimal(10,2)
  icoon          String?          // naam van vorm/icoon
}

model Plant {
  id            String   @id @default(cuid())
  naamNL        String
  naamWetenschappelijk String?
  categorie     String?
  inheems       Boolean  @default(false)
  waardplantVoor String?
  bloeitijd     String?
  licht         String?
  bodem         String?
  giftig        Boolean  @default(false)
  ontwerpen     OntwerpPlant[]
}

model OntwerpPlant {
  id        String  @id @default(cuid())
  ontwerpId String
  plantId   String
  aantal    Int     @default(1)
  ontwerp   Ontwerp @relation(fields: [ontwerpId], references: [id], onDelete: Cascade)
  plant     Plant   @relation(fields: [plantId], references: [id])
  @@unique([ontwerpId, plantId])
}

// ---------- SUBSIDIES ----------
model Subsidie {
  id           String        @id @default(cuid())
  naam         String
  verstrekker  String
  niveau       SubsidieNiveau
  regio        String?
  doelgroep    String?
  maxBedrag    Decimal?      @db.Decimal(10,2)
  percentage   String?       // bv. "70% / max €10.000"
  voorwaarden  String?
  deadline     DateTime?     // null = doorlopend
  doorlopend   Boolean       @default(false)
  status       RegelingStatus @default(open)
  laatstGecheckt DateTime
  bronlink     String?
  aanvragen    SubsidieAanvraag[]
  @@index([niveau])
  @@index([regio])
}

model SubsidieAanvraag {
  id             String        @id @default(cuid())
  projectId      String
  subsidieId     String
  project        Project        @relation(fields: [projectId], references: [id], onDelete: Cascade)
  subsidie       Subsidie       @relation(fields: [subsidieId], references: [id])
  status         AanvraagStatus @default(scan)
  bedragAangevraagd Decimal?    @db.Decimal(10,2)
  bedragToegekend   Decimal?    @db.Decimal(10,2)
  deadline       DateTime?
  notities       String?
  @@index([projectId])
  @@index([status])
}

// ---------- EDUCATIE ----------
model EducatieActiviteit {
  id            String @id @default(cuid())
  titel         String
  omschrijving  String?
  leeftijdVan   Int?
  leeftijdTot   Int?
  seizoen       String?
  duurMinuten   Int?
  doelen        String? // korte samenvatting; rijke doelen in les.doelenSchool/Bso
  benodigdheden String?
  prijs         Decimal? @db.Decimal(10,2)
  les           Json?    // JSONB (Fase 4b): rijke lesuitwerking (LesSchema); null = nog niet uitgewerkt
  pakketten     PakketActiviteit[]
  printbladen   Printblad[]
}

model Printblad { // Fase 4b, zie ADR-0007
  id           String @id @default(cuid())
  activiteitId String
  activiteit   EducatieActiviteit @relation(fields: [activiteitId], references: [id], onDelete: Cascade)
  titel        String
  soort        String // telkaart | werkblad | poster | protocol | bouwkaart | ...
  volgorde     Int    @default(0)
  inhoud       Json   // JSONB: { tag, blokken[] } (PrintbladInhoudSchema)
  @@index([activiteitId])
}

model EducatiePakket {
  id         String      @id @default(cuid())
  projectId  String?
  project    Project?    @relation(fields: [projectId], references: [id], onDelete: SetNull)
  naam       String
  status     PakketStatus @default(concept)
  totaalprijs Decimal?   @db.Decimal(10,2)
  activiteiten PakketActiviteit[]
}

model PakketActiviteit {
  id           String @id @default(cuid())
  pakketId     String
  activiteitId String
  pakket       EducatiePakket     @relation(fields: [pakketId], references: [id], onDelete: Cascade)
  activiteit   EducatieActiviteit @relation(fields: [activiteitId], references: [id])
  @@unique([pakketId, activiteitId])
}

// ---------- OFFERTE ----------
model Offerte {
  id            String       @id @default(cuid())
  projectId     String
  project       Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  offertenummer String        @unique
  datum         DateTime      @default(now())
  status        OfferteStatus @default(concept)
  regels        Json          // JSONB: [{omschrijving, aantal, stuksprijs, btwPct}]
  totaalExcl    Decimal       @db.Decimal(10,2)
  totaalIncl    Decimal       @db.Decimal(10,2)
  rolafbakening String        // vaste aansprakelijkheidstekst
}

// ---------- MEETBAAR GROEN ----------
model Meting {
  id          String     @id @default(cuid())
  projectId   String
  project     Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  datum       DateTime
  type        MetingType
  waarnemingen Json      // JSONB: [{soortgroep, aantal}]
  notities    String?
  @@index([projectId])
}

model Partner {
  id       String      @id @default(cuid())
  naam     String
  type     PartnerType
  contact  String?
  tarieven String?
  notities String?
}
```

## Uitleg per model (kern)
- **Klant.gemeente is verplicht** omdat de subsidieradar per gemeente/regio filtert.
- **Project** draagt "volgende actie + datum" voor het dashboard.
- **Element.soort** codeert het WAS 2023-onderscheid; de studio telt hierop.
- **Ontwerp.canvas / Offerte.regels / Meting.waarnemingen = JSONB** (ADR-0004),
  gevalideerd met Zod in `lib/validators/`.
- **EducatieActiviteit.les / Printblad.inhoud = JSONB** (Fase 4b, ADR-0007),
  gevalideerd met `LesSchema` / `PrintbladInhoudSchema` in `lib/validators/les.ts`.
- **`onDelete`-regels:** child-records van een Project cascaden mee; Taak en
  EducatiePakket zijn optioneel gekoppeld → `SetNull`.

## Migratiestrategie
- **Lokaal/dev:** `npx prisma migrate dev --name <beschrijving>` (maakt migratie + past toe).
- **Productie (Railway):** **nooit** `migrate dev`; Railway draait `npx prisma migrate deploy`
  als **pre-deploy command** (zie `railway.json`). Migraties worden gecommit in `prisma/migrations/`.
- **Client genereren** gebeurt via `postinstall: prisma generate`.
- **Terugdraaien:** maak een nieuwe migratie die de wijziging herstelt (forward-only);
  gebruik een backup voor destructieve fouten.
