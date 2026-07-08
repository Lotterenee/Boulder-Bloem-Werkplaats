import { prisma } from "@/lib/prisma";
import { subsidiescanSchema } from "@/lib/validators/subsidiescan";

/**
 * Publiek endpoint voor het subsidiescan-formulier op de klantensite.
 * Beveiliging: gedeeld geheim in de X-Subsidiescan-Token header plus een
 * eenvoudige in-memory rate limit per IP (5 per uur).
 */

const pogingen = new Map<string, number[]>();
const LIMIET = 5;
const VENSTER_MS = 60 * 60 * 1000;

function rateLimited(ip: string): boolean {
  const nu = Date.now();
  const recent = (pogingen.get(ip) ?? []).filter((t) => nu - t < VENSTER_MS);
  if (recent.length >= LIMIET) return true;
  recent.push(nu);
  pogingen.set(ip, recent);
  if (pogingen.size > 10_000) pogingen.clear(); // simpele geheugenbescherming
  return false;
}

export async function POST(req: Request) {
  const token = process.env.SUBSIDIESCAN_TOKEN;
  if (!token) {
    return Response.json(
      { fout: "Subsidiescan is niet geconfigureerd (SUBSIDIESCAN_TOKEN ontbreekt)." },
      { status: 503 }
    );
  }
  if (req.headers.get("x-subsidiescan-token") !== token) {
    return Response.json({ fout: "Ongeldig token." }, { status: 401 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "onbekend";
  if (rateLimited(ip)) {
    return Response.json(
      { fout: "Te veel aanvragen; probeer het later opnieuw." },
      { status: 429 }
    );
  }

  let payload;
  try {
    payload = subsidiescanSchema.parse(await req.json());
  } catch {
    return Response.json({ fout: "Ongeldige aanvraag." }, { status: 400 });
  }

  // Conceptklant + project aanmaken.
  const klant = await prisma.klant.create({
    data: {
      organisatie: payload.organisatie,
      type: payload.type,
      contactpersoon: payload.contactpersoon ?? null,
      email: payload.email,
      telefoon: payload.telefoon ?? null,
      plaats: payload.plaats ?? null,
      gemeente: payload.gemeente,
      notities: "Binnengekomen via subsidiescan-formulier op de website.",
    },
  });
  const project = await prisma.project.create({
    data: {
      klantId: klant.id,
      naam: `Subsidiescan ${payload.organisatie}`,
      samenvatting: payload.bericht ?? null,
      volgendeActie: "Subsidiescan opvolgen",
      volgendeActieDatum: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Scan: koppel open regelingen die landelijk zijn of qua regio matchen.
  const gemeente = payload.gemeente.toLowerCase();
  const openRegelingen = await prisma.subsidie.findMany({
    where: { status: "open" },
  });
  const matches = openRegelingen.filter(
    (s) =>
      !s.regio ||
      s.regio.toLowerCase().includes(gemeente) ||
      gemeente.includes(s.regio.toLowerCase())
  );
  await prisma.subsidieAanvraag.createMany({
    data: matches.map((s) => ({
      projectId: project.id,
      subsidieId: s.id,
      status: "scan" as const,
      deadline: s.deadline,
    })),
  });

  await prisma.taak.create({
    data: {
      projectId: project.id,
      titel: `Subsidiescan beoordelen: ${payload.organisatie}`,
      categorie: "subsidie",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return Response.json(
    { ok: true, regelingen: matches.length },
    { status: 201 }
  );
}
