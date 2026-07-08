import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { subsidies, LAATST_GECHECKT } from "./seed-data/subsidies";
import { elementen } from "./seed-data/elementen";
import { planten } from "./seed-data/planten";
import { activiteiten, pakketten } from "./seed-data/educatie";
import { lessen } from "./seed-data/educatie/index";
import { LesSchema, PrintbladInhoudSchema } from "../lib/validators/les";
import {
  demoKlanten,
  demoProjecten,
  demoWensen,
  demoTaken,
  demoAanvragen,
  demoOntwerp,
  demoOfferte,
  demoMetingen,
  demoPakketKoppeling,
} from "./seed-data/demo";
import { berekenTotalen } from "../lib/domain/btw";
import { ROLAFBAKENING } from "../lib/domain/rolafbakening";
import { zoneSjablonen, plantPakketten } from "./seed-data/zones-pakketten";

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

  // ---- Zone-sjablonen + plantpakketten (Fase 3c) ----
  // Regels worden per sjabloon/pakket vervangen zodat de seed herhaalbaar is.
  for (const z of zoneSjablonen) {
    const { regels, ...data } = z;
    await prisma.zoneSjabloon.upsert({
      where: { id: data.id },
      update: { naam: data.naam, categorie: data.categorie, eigen: false },
      create: { id: data.id, naam: data.naam, categorie: data.categorie, eigen: false },
    });
    await prisma.zoneSjabloonRegel.deleteMany({ where: { sjabloonId: data.id } });
    for (const r of regels) {
      await prisma.zoneSjabloonRegel.create({
        data: {
          sjabloonId: data.id,
          soort: r.soort,
          refId: r.refId,
          relXM: r.relXM,
          relYM: r.relYM,
          rotatie: r.rotatie ?? 0,
          schaal: r.schaal ?? 1,
        },
      });
    }
  }
  for (const pp of plantPakketten) {
    const { regels, ...data } = pp;
    await prisma.plantPakket.upsert({
      where: { id: data.id },
      update: { naam: data.naam, doel: data.doel },
      create: { id: data.id, naam: data.naam, doel: data.doel },
    });
    await prisma.plantPakketRegel.deleteMany({ where: { pakketId: data.id } });
    for (const r of regels) {
      await prisma.plantPakketRegel.create({
        data: { pakketId: data.id, plantId: r.plantId, aantal: r.aantal },
      });
    }
  }
  console.log(`Studio: ${zoneSjablonen.length} zone-sjablonen, ${plantPakketten.length} plantpakketten`);

  // ---- Demo-klanten en projecten (alleen dev/preview) ----
  // Nepdata zodat elk scherm gevuld is. Productie heeft SEED_DATA=false en
  // komt hier nooit; wie de bibliotheekdata wel maar de nepklanten niet wil,
  // zet SEED_DEMO=false.
  if (process.env.SEED_DEMO === "false") {
    console.log("SEED_DEMO=false, demo-klanten overgeslagen");
    return;
  }
  await seedDemo();
}

async function seedDemo() {
  for (const k of demoKlanten) {
    const { id, ...data } = k;
    const payload = { ...data, type: data.type as Prisma.KlantUncheckedCreateInput["type"] };
    await prisma.klant.upsert({ where: { id }, update: payload, create: { id, ...payload } });
  }
  for (const p of demoProjecten) {
    const { id, ...data } = p;
    const payload = {
      ...data,
      fase: data.fase as Prisma.ProjectUncheckedCreateInput["fase"],
      status: data.status as Prisma.ProjectUncheckedCreateInput["status"],
    };
    await prisma.project.upsert({ where: { id }, update: payload, create: { id, ...payload } });
  }

  // Child-records per project vervangen zodat de seed herhaalbaar blijft.
  const projectIds = demoProjecten.map((p) => p.id);
  await prisma.wens.deleteMany({ where: { projectId: { in: projectIds } } });
  for (const w of demoWensen) {
    await prisma.wens.create({
      data: { ...w, bron: w.bron as Prisma.WensUncheckedCreateInput["bron"], prioriteit: w.prioriteit as Prisma.WensUncheckedCreateInput["prioriteit"] },
    });
  }

  for (const t of demoTaken) {
    const { id, ...data } = t;
    const payload = { ...data, categorie: data.categorie as Prisma.TaakUncheckedCreateInput["categorie"] };
    await prisma.taak.upsert({ where: { id }, update: payload, create: { id, ...payload } });
  }

  for (const a of demoAanvragen) {
    const { id, ...data } = a;
    const payload = { ...data, status: data.status as Prisma.SubsidieAanvraagUncheckedCreateInput["status"] };
    await prisma.subsidieAanvraag.upsert({ where: { id }, update: payload, create: { id, ...payload } });
  }

  // Ontwerp + gekoppelde beplanting.
  const { planten: ontwerpPlanten, ...ontwerpData } = demoOntwerp;
  await prisma.ontwerp.upsert({
    where: { id: ontwerpData.id },
    update: { naam: ontwerpData.naam, versie: ontwerpData.versie, canvas: ontwerpData.canvas },
    create: { ...ontwerpData, canvas: ontwerpData.canvas },
  });
  await prisma.ontwerpPlant.deleteMany({ where: { ontwerpId: ontwerpData.id } });
  for (const op of ontwerpPlanten) {
    await prisma.ontwerpPlant.create({ data: { ontwerpId: ontwerpData.id, ...op } });
  }

  // Offerte met btw-totalen (21%) en vaste rolafbakeningstekst.
  const totalen = berekenTotalen([...demoOfferte.regels]);
  await prisma.offerte.upsert({
    where: { id: demoOfferte.id },
    update: {
      status: demoOfferte.status as Prisma.OfferteUncheckedCreateInput["status"],
      regels: demoOfferte.regels,
      totaalExcl: totalen.totaalExcl,
      totaalIncl: totalen.totaalIncl,
      rolafbakening: ROLAFBAKENING,
    },
    create: {
      id: demoOfferte.id,
      projectId: demoOfferte.projectId,
      offertenummer: demoOfferte.offertenummer,
      status: demoOfferte.status as Prisma.OfferteUncheckedCreateInput["status"],
      regels: demoOfferte.regels,
      totaalExcl: totalen.totaalExcl,
      totaalIncl: totalen.totaalIncl,
      rolafbakening: ROLAFBAKENING,
    },
  });

  for (const m of demoMetingen) {
    const { id, ...data } = m;
    const payload = { ...data, type: data.type as Prisma.MetingUncheckedCreateInput["type"], waarnemingen: data.waarnemingen };
    await prisma.meting.upsert({ where: { id }, update: payload, create: { id, ...payload } });
  }

  await prisma.educatiePakket.update({
    where: { id: demoPakketKoppeling.pakketId },
    data: { projectId: demoPakketKoppeling.projectId },
  });

  console.log(
    `Demo: ${demoKlanten.length} klanten, ${demoProjecten.length} projecten, ${demoWensen.length} wensen, ${demoTaken.length} taken, ${demoAanvragen.length} aanvragen, 1 ontwerp, 1 offerte, ${demoMetingen.length} metingen`
  );
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
