-- CreateEnum
CREATE TYPE "KlantType" AS ENUM ('school', 'bso', 'particulier', 'recreatie', 'gemeente', 'anders');

-- CreateEnum
CREATE TYPE "ProjectFase" AS ENUM ('kennismaking', 'locatieanalyse', 'samen_ontwerpen', 'schetsontwerp', 'definitief_ontwerp', 'aanleg', 'oplevering_beheer');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('actief', 'gepauzeerd', 'afgerond', 'verloren');

-- CreateEnum
CREATE TYPE "WensBron" AS ENUM ('kinderen', 'team', 'ouders', 'schouw', 'opdrachtgever');

-- CreateEnum
CREATE TYPE "WensPrioriteit" AS ENUM ('moet', 'graag', 'misschien');

-- CreateEnum
CREATE TYPE "TaakCategorie" AS ENUM ('algemeen', 'subsidie', 'offerte', 'beheer', 'acquisitie');

-- CreateEnum
CREATE TYPE "ElementCategorie" AS ENUM ('klimmen', 'water', 'groen', 'rust', 'moestuin', 'pad', 'terrein');

-- CreateEnum
CREATE TYPE "ElementSoort" AS ENUM ('speelaanleiding', 'speeltoestel');

-- CreateEnum
CREATE TYPE "SubsidieNiveau" AS ENUM ('landelijk', 'provincie', 'gemeente', 'waterschap', 'fonds');

-- CreateEnum
CREATE TYPE "RegelingStatus" AS ENUM ('open', 'gesloten', 'onzeker');

-- CreateEnum
CREATE TYPE "AanvraagStatus" AS ENUM ('scan', 'kansrijk', 'in_voorbereiding', 'ingediend', 'toegekend', 'afgewezen', 'verantwoording', 'afgerond');

-- CreateEnum
CREATE TYPE "PakketStatus" AS ENUM ('concept', 'aangeboden', 'verkocht');

-- CreateEnum
CREATE TYPE "OfferteStatus" AS ENUM ('concept', 'verzonden', 'geaccepteerd', 'afgewezen');

-- CreateEnum
CREATE TYPE "MetingType" AS ENUM ('nulmeting', 'jaartelling');

-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('groenaannemer', 'toestelleverancier', 'kwekerij', 'keuringsinstantie');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "naam" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Klant" (
    "id" TEXT NOT NULL,
    "organisatie" TEXT NOT NULL,
    "type" "KlantType" NOT NULL,
    "contactpersoon" TEXT,
    "email" TEXT,
    "telefoon" TEXT,
    "adres" TEXT,
    "plaats" TEXT,
    "gemeente" TEXT NOT NULL,
    "notities" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Klant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "klantId" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "fase" "ProjectFase" NOT NULL DEFAULT 'kennismaking',
    "status" "ProjectStatus" NOT NULL DEFAULT 'actief',
    "locatieadres" TEXT,
    "oppervlakteM2" INTEGER,
    "budgetIndicatie" DECIMAL(10,2),
    "volgendeActie" TEXT,
    "volgendeActieDatum" TIMESTAMP(3),
    "samenvatting" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wens" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "bron" "WensBron" NOT NULL,
    "tekst" TEXT NOT NULL,
    "prioriteit" "WensPrioriteit" NOT NULL DEFAULT 'graag',
    "verwerkt" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Wens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Taak" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "titel" TEXT NOT NULL,
    "categorie" "TaakCategorie" NOT NULL DEFAULT 'algemeen',
    "deadline" TIMESTAMP(3),
    "afgerond" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Taak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ontwerp" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "versie" INTEGER NOT NULL DEFAULT 1,
    "canvas" JSONB NOT NULL,
    "laatstBewerkt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ontwerp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Element" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "categorie" "ElementCategorie" NOT NULL,
    "soort" "ElementSoort" NOT NULL,
    "standaardBreedteM" DECIMAL(5,2),
    "standaardDiepteM" DECIMAL(5,2),
    "valruimteM" DECIMAL(5,2),
    "indicatieprijs" DECIMAL(10,2),
    "icoon" TEXT,

    CONSTRAINT "Element_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plant" (
    "id" TEXT NOT NULL,
    "naamNL" TEXT NOT NULL,
    "naamWetenschappelijk" TEXT,
    "categorie" TEXT,
    "inheems" BOOLEAN NOT NULL DEFAULT false,
    "waardplantVoor" TEXT,
    "bloeitijd" TEXT,
    "licht" TEXT,
    "bodem" TEXT,
    "giftig" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Plant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OntwerpPlant" (
    "id" TEXT NOT NULL,
    "ontwerpId" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "aantal" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "OntwerpPlant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subsidie" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "verstrekker" TEXT NOT NULL,
    "niveau" "SubsidieNiveau" NOT NULL,
    "regio" TEXT,
    "doelgroep" TEXT,
    "maxBedrag" DECIMAL(10,2),
    "percentage" TEXT,
    "voorwaarden" TEXT,
    "deadline" TIMESTAMP(3),
    "doorlopend" BOOLEAN NOT NULL DEFAULT false,
    "status" "RegelingStatus" NOT NULL DEFAULT 'open',
    "laatstGecheckt" TIMESTAMP(3) NOT NULL,
    "bronlink" TEXT,

    CONSTRAINT "Subsidie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubsidieAanvraag" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "subsidieId" TEXT NOT NULL,
    "status" "AanvraagStatus" NOT NULL DEFAULT 'scan',
    "bedragAangevraagd" DECIMAL(10,2),
    "bedragToegekend" DECIMAL(10,2),
    "deadline" TIMESTAMP(3),
    "notities" TEXT,

    CONSTRAINT "SubsidieAanvraag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducatieActiviteit" (
    "id" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "omschrijving" TEXT,
    "leeftijdVan" INTEGER,
    "leeftijdTot" INTEGER,
    "seizoen" TEXT,
    "duurMinuten" INTEGER,
    "doelen" TEXT,
    "benodigdheden" TEXT,
    "prijs" DECIMAL(10,2),

    CONSTRAINT "EducatieActiviteit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducatiePakket" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "naam" TEXT NOT NULL,
    "status" "PakketStatus" NOT NULL DEFAULT 'concept',
    "totaalprijs" DECIMAL(10,2),

    CONSTRAINT "EducatiePakket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PakketActiviteit" (
    "id" TEXT NOT NULL,
    "pakketId" TEXT NOT NULL,
    "activiteitId" TEXT NOT NULL,

    CONSTRAINT "PakketActiviteit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offerte" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "offertenummer" TEXT NOT NULL,
    "datum" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "OfferteStatus" NOT NULL DEFAULT 'concept',
    "regels" JSONB NOT NULL,
    "totaalExcl" DECIMAL(10,2) NOT NULL,
    "totaalIncl" DECIMAL(10,2) NOT NULL,
    "rolafbakening" TEXT NOT NULL,

    CONSTRAINT "Offerte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meting" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "datum" TIMESTAMP(3) NOT NULL,
    "type" "MetingType" NOT NULL,
    "waarnemingen" JSONB NOT NULL,
    "notities" TEXT,

    CONSTRAINT "Meting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "type" "PartnerType" NOT NULL,
    "contact" TEXT,
    "tarieven" TEXT,
    "notities" TEXT,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Project_fase_idx" ON "Project"("fase");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Wens_projectId_idx" ON "Wens"("projectId");

-- CreateIndex
CREATE INDEX "Taak_deadline_idx" ON "Taak"("deadline");

-- CreateIndex
CREATE INDEX "Ontwerp_projectId_idx" ON "Ontwerp"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "OntwerpPlant_ontwerpId_plantId_key" ON "OntwerpPlant"("ontwerpId", "plantId");

-- CreateIndex
CREATE INDEX "Subsidie_niveau_idx" ON "Subsidie"("niveau");

-- CreateIndex
CREATE INDEX "Subsidie_regio_idx" ON "Subsidie"("regio");

-- CreateIndex
CREATE INDEX "SubsidieAanvraag_projectId_idx" ON "SubsidieAanvraag"("projectId");

-- CreateIndex
CREATE INDEX "SubsidieAanvraag_status_idx" ON "SubsidieAanvraag"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PakketActiviteit_pakketId_activiteitId_key" ON "PakketActiviteit"("pakketId", "activiteitId");

-- CreateIndex
CREATE UNIQUE INDEX "Offerte_offertenummer_key" ON "Offerte"("offertenummer");

-- CreateIndex
CREATE INDEX "Meting_projectId_idx" ON "Meting"("projectId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_klantId_fkey" FOREIGN KEY ("klantId") REFERENCES "Klant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wens" ADD CONSTRAINT "Wens_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taak" ADD CONSTRAINT "Taak_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ontwerp" ADD CONSTRAINT "Ontwerp_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OntwerpPlant" ADD CONSTRAINT "OntwerpPlant_ontwerpId_fkey" FOREIGN KEY ("ontwerpId") REFERENCES "Ontwerp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OntwerpPlant" ADD CONSTRAINT "OntwerpPlant_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubsidieAanvraag" ADD CONSTRAINT "SubsidieAanvraag_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubsidieAanvraag" ADD CONSTRAINT "SubsidieAanvraag_subsidieId_fkey" FOREIGN KEY ("subsidieId") REFERENCES "Subsidie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducatiePakket" ADD CONSTRAINT "EducatiePakket_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PakketActiviteit" ADD CONSTRAINT "PakketActiviteit_pakketId_fkey" FOREIGN KEY ("pakketId") REFERENCES "EducatiePakket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PakketActiviteit" ADD CONSTRAINT "PakketActiviteit_activiteitId_fkey" FOREIGN KEY ("activiteitId") REFERENCES "EducatieActiviteit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offerte" ADD CONSTRAINT "Offerte_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meting" ADD CONSTRAINT "Meting_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
