import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { subsidies, LAATST_GECHECKT } from "./seed-data/subsidies";
import { elementen } from "./seed-data/elementen";
import { planten } from "./seed-data/planten";
import { activiteiten, pakketten } from "./seed-data/educatie";
import { lessen } from "./seed-data/educatie/index";
import { LesSchema, PrintbladInhoudSchema } from "../lib/validators/les";

const prisma = new PrismaClient();

const STANDAARD_WACHTWOORD = "kas-groeit-2026";

// De inlog-gebruiker wordt ALTIJD gegarandeerd (ook bij SEED_DATA=false):
// zonder account kan niemand inloggen, ook niet in productie. Idempotent en
// het wachtwoord wordt alleen bij eerste aanmaak gezet, nooit overschreven.
async function ensureUser() {
  const passwordHash = await bcrypt.hash(STANDAARD_WACHTWOORD, 12);
  await prisma.user.upsert({
    where: { email: "lotte@boulderbloem.nl" },
    update: {},
    create: { email: "lotte@boulderbloem.nl", naam: "Lotte", passwordHash },
  });
  console.log("Gebruiker gegarandeerd: lotte@boulderbloem.nl (wachtwoord alleen bij eerste aanmaak gezet)");
}

async function main() {
  await ensureUser();

  // Demo-data (subsidies, elementen, planten, educatie) wordt in productie
  // overgeslagen via SEED_DATA=false; de gebruiker hierboven blijft wel staan.
  if (process.env.SEED_DATA === "false") {
    console.log("SEED_DATA=false, demo-data overgeslagen (gebruiker wel aangemaakt)");
    return;
  }

  // ---- Subsidieregelingen ----
  for (const s of subsidies) {
    const { id, ...data } = s;
    const payload = {
      ...data,
      niveau: data.niveau as Prisma.SubsidieUncheckedCreateInput["niveau"],
      status: data.status as Prisma.SubsidieUncheckedCreateInput["status"],
      laatstGecheckt: LAATST_GECHECKT,
    };
    await prisma.subsidie.upsert({ where: { id }, update: payload, create: { id, ...payload } });
  }
  console.log(`Subsidies: ${subsidies.length}`);

  // ---- Elementen ----
  for (const e of elementen) {
    const { id, ...data } = e;
    const payload = {
      ...data,
      categorie: data.categorie as Prisma.ElementUncheckedCreateInput["categorie"],
      soort: data.soort as Prisma.ElementUncheckedCreateInput["soort"],
    };
    await prisma.element.upsert({ where: { id }, update: payload, create: { id, ...payload } });
  }
  console.log(`Elementen: ${elementen.length}`);

  // ---- Planten ----
  for (const p of planten) {
    const { id, ...data } = p;
    await prisma.plant.upsert({ where: { id }, update: data, create: { id, ...data } });
  }
  console.log(`Planten: ${planten.length}`);

  // ---- Educatie ----
  for (const a of activiteiten) {
    const { id, ...data } = a;
    await prisma.educatieActiviteit.upsert({ where: { id }, update: data, create: { id, ...data } });
  }
  for (const p of pakketten) {
    const { id, activiteitIds, ...data } = p;
    await prisma.educatiePakket.upsert({ where: { id }, update: data, create: { id, ...data } });
    for (const activiteitId of activiteitIds) {
      await prisma.pakketActiviteit.upsert({
        where: { pakketId_activiteitId: { pakketId: id, activiteitId } },
        update: {},
        create: { pakketId: id, activiteitId },
      });
    }
  }
  console.log(`Educatie: ${activiteiten.length} activiteiten, ${pakketten.length} pakketten`);

  // ---- Lesbibliotheek (Fase 4b): 10 uitgewerkte lessen + printbladen ----
  // Zod bewaakt het JSONB-contract bij het seeden; printbladen worden per
  // activiteit vervangen (deleteMany + create) zodat de seed herhaalbaar is.
  let aantalPrintbladen = 0;
  for (const lesRecord of lessen) {
    const lesInhoud = LesSchema.parse(lesRecord.les);
    const activiteitData = {
      titel: lesRecord.titel,
      leeftijdVan: lesRecord.leeftijdVan,
      leeftijdTot: lesRecord.leeftijdTot,
      seizoen: lesRecord.seizoen,
      duurMinuten: lesRecord.duurMinuten,
      prijs: lesRecord.prijs,
      omschrijving: lesRecord.omschrijving,
      doelen: lesRecord.doelen,
      les: lesInhoud,
    };
    await prisma.educatieActiviteit.upsert({
      where: { id: lesRecord.id },
      update: activiteitData,
      create: { id: lesRecord.id, ...activiteitData },
    });
    await prisma.printblad.deleteMany({ where: { activiteitId: lesRecord.id } });
    for (const pb of lesRecord.printbladen) {
      await prisma.printblad.create({
        data: {
          activiteitId: lesRecord.id,
          titel: pb.titel,
          soort: pb.soort,
          volgorde: pb.volgorde,
          inhoud: PrintbladInhoudSchema.parse(pb.inhoud),
        },
      });
      aantalPrintbladen++;
    }
  }
  console.log(`Lesbibliotheek: ${lessen.length} lessen, ${aantalPrintbladen} printbladen`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed klaar.");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
