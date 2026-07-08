-- AlterTable
ALTER TABLE "EducatieActiviteit" ADD COLUMN     "les" JSONB;

-- CreateTable
CREATE TABLE "Printblad" (
    "id" TEXT NOT NULL,
    "activiteitId" TEXT NOT NULL,
    "titel" TEXT NOT NULL,
    "soort" TEXT NOT NULL,
    "volgorde" INTEGER NOT NULL DEFAULT 0,
    "inhoud" JSONB NOT NULL,

    CONSTRAINT "Printblad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Printblad_activiteitId_idx" ON "Printblad"("activiteitId");

-- AddForeignKey
ALTER TABLE "Printblad" ADD CONSTRAINT "Printblad_activiteitId_fkey" FOREIGN KEY ("activiteitId") REFERENCES "EducatieActiviteit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
