import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { subsidies, LAATST_GECHECKT } from "./seed-data/subsidies";
import { elementen } from "./seed-data/elementen";
import { planten } from "./seed-data/planten";
import { activiteiten, pakketten } from "./seed-data/educatie";

// Productie heeft SEED_DATA=false (gezet door de harness); dev- en
// feature-omgevingen seeden normaal. Het script is idempotent (upserts op
// vaste id's) en overschrijft nooit een gewijzigd wachtwoord.
if (process.env.SEED_DATA === "false") {
  console.log("SEED_DATA=false, seed overgeslagen");
  process.exit(0);
}

const prisma = new PrismaClient();

const STANDAARD_WACHTWOORD = "kas-groeit-2026";

async function main() {
  // ---- Gebruiker (wachtwoord alleen bij aanmaken, nooit overschrijven) ----
  const passwordHash = await bcrypt.hash(STANDAARD_WACHTWOORD, 12);
  await prisma.user.upsert({
    where: { email: "lotte@boulderbloem.nl" },
    update: {},
    create: { email: "lotte@boulderbloem.nl", naam: "Lotte", passwordHash },
  });
  console.log("Gebruiker: lotte@boulderbloem.nl (wachtwoord alleen bij eerste aanmaak gezet)");

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
