import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { METING_TYPE_LABELS, AANVRAAG_STATUS_LABELS } from "@/lib/labels";
import { waarnemingenSchema } from "@/lib/validators/meting";

function csvVeld(v: string | number | null | undefined): string {
  const s = String(v ?? "");
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Verantwoordings-export (CSV) voor subsidieverantwoording per project. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return new Response("Niet ingelogd", { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      klant: true,
      metingen: { orderBy: { datum: "asc" } },
      subsidieAanvragen: { include: { subsidie: true } },
    },
  });
  if (!project) return new Response("Project niet gevonden", { status: 404 });

  const r: string[] = [];
  r.push("Verantwoording biodiversiteit en subsidie");
  r.push(`Project;${csvVeld(project.naam)}`);
  r.push(`Klant;${csvVeld(project.klant.organisatie)}`);
  r.push(`Gemeente;${csvVeld(project.klant.gemeente)}`);
  r.push(`Geexporteerd;${new Date().toLocaleDateString("nl-NL")}`);
  r.push("");
  r.push("Subsidieaanvragen");
  r.push("Regeling;Verstrekker;Status;Bedrag aangevraagd;Bedrag toegekend");
  for (const a of project.subsidieAanvragen) {
    r.push(
      [
        csvVeld(a.subsidie.naam),
        csvVeld(a.subsidie.verstrekker),
        csvVeld(AANVRAAG_STATUS_LABELS[a.status]),
        csvVeld(a.bedragAangevraagd?.toString()),
        csvVeld(a.bedragToegekend?.toString()),
      ].join(";")
    );
  }
  r.push("");
  r.push("Biodiversiteitsmetingen");
  r.push("Datum;Type;Soortgroep;Aantal;Notities");
  for (const m of project.metingen) {
    const waarnemingen = waarnemingenSchema.safeParse(m.waarnemingen);
    const datum = m.datum.toLocaleDateString("nl-NL");
    for (const w of waarnemingen.success ? waarnemingen.data : []) {
      r.push(
        [
          datum,
          METING_TYPE_LABELS[m.type],
          csvVeld(w.soortgroep),
          w.aantal,
          csvVeld(m.notities),
        ].join(";")
      );
    }
  }

  // BOM zodat Excel de utf-8 en puntkomma's goed leest.
  const body = "﻿" + r.join("\r\n");
  const bestandsnaam = `verantwoording-${project.naam.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${bestandsnaam}"`,
    },
  });
}
