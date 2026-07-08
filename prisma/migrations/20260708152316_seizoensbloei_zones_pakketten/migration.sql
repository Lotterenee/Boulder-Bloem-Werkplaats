-- CreateEnum
CREATE TYPE "SjabloonRegelSoort" AS ENUM ('element', 'plant');

-- AlterTable
ALTER TABLE "Plant" ADD COLUMN     "bloeikleur" TEXT,
ADD COLUMN     "bloeimaanden" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "diameterM" DECIMAL(4,2),
ADD COLUMN     "drachtNectar" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "drachtPollen" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "hoogteM" DECIMAL(4,2),
ADD COLUMN     "prijs" DECIMAL(10,2),
ADD COLUMN     "wintergroen" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ZoneSjabloon" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "eigen" BOOLEAN NOT NULL DEFAULT false,
    "thumbnail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ZoneSjabloon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZoneSjabloonRegel" (
    "id" TEXT NOT NULL,
    "sjabloonId" TEXT NOT NULL,
    "soort" "SjabloonRegelSoort" NOT NULL,
    "refId" TEXT NOT NULL,
    "relXM" DECIMAL(6,2) NOT NULL,
    "relYM" DECIMAL(6,2) NOT NULL,
    "rotatie" DECIMAL(5,1) NOT NULL DEFAULT 0,
    "schaal" DECIMAL(4,2) NOT NULL DEFAULT 1,

    CONSTRAINT "ZoneSjabloonRegel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantPakket" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "doel" TEXT,

    CONSTRAINT "PlantPakket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantPakketRegel" (
    "id" TEXT NOT NULL,
    "pakketId" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "aantal" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "PlantPakketRegel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ZoneSjabloonRegel_sjabloonId_idx" ON "ZoneSjabloonRegel"("sjabloonId");

-- CreateIndex
CREATE INDEX "PlantPakketRegel_pakketId_idx" ON "PlantPakketRegel"("pakketId");

-- AddForeignKey
ALTER TABLE "ZoneSjabloonRegel" ADD CONSTRAINT "ZoneSjabloonRegel_sjabloonId_fkey" FOREIGN KEY ("sjabloonId") REFERENCES "ZoneSjabloon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantPakketRegel" ADD CONSTRAINT "PlantPakketRegel_pakketId_fkey" FOREIGN KEY ("pakketId") REFERENCES "PlantPakket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantPakketRegel" ADD CONSTRAINT "PlantPakketRegel_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
