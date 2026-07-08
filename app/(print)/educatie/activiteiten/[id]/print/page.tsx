import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LesSchema, PrintbladInhoudSchema } from "@/lib/validators/les";
import { fmtEuro } from "@/lib/labels";
import LesWeergave from "@/components/educatie/LesWeergave";
import PrintbladWeergave from "@/components/educatie/PrintbladWeergave";
import PrintKnoppen from "./PrintKnoppen";

export const dynamic = "force-dynamic";

/**
 * Printweergave van één les (US-4b.5): alleen de les en haar printbladen,
 * zonder zijbalk of app-navigatie. Elk printblad op een eigen pagina.
 */
export default async function LesPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activiteit = await prisma.educatieActiviteit.findUnique({
    where: { id },
    include: { printbladen: { orderBy: { volgorde: "asc" } } },
  });
  if (!activiteit) notFound();

  const les = LesSchema.safeParse(activiteit.les);
  if (!les.success) notFound();

  const chips = [
    activiteit.leeftijdVan != null && activiteit.leeftijdTot != null
      ? `${activiteit.leeftijdVan} tot ${activiteit.leeftijdTot} jaar`
      : null,
    activiteit.seizoen,
    activiteit.duurMinuten ? `${activiteit.duurMinuten} min` : null,
    activiteit.prijs ? fmtEuro(activiteit.prijs.toString()) : null,
  ].filter(Boolean);

  return (
    <main className="mx-auto max-w-3xl p-8 print:max-w-none print:p-0">
      <PrintKnoppen activiteitId={activiteit.id} />

      <header className="mb-6 border-b-2 border-moss-deep pb-4">
        <p className="text-xs uppercase tracking-wider text-ink-soft">
          Boulder Bloem · Lesbibliotheek
        </p>
        <h1 className="font-heading text-3xl text-moss-deep">
          {les.data.nummer ? `${les.data.nummer}. ` : ""}
          {activiteit.titel}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">{chips.join(" · ")}</p>
      </header>

      <LesWeergave les={les.data} />

      <div className="mt-8 space-y-6">
        {activiteit.printbladen.map((pb) => {
          const inhoud = PrintbladInhoudSchema.safeParse(pb.inhoud);
          if (!inhoud.success) return null;
          return <PrintbladWeergave key={pb.id} titel={pb.titel} inhoud={inhoud.data} />;
        })}
      </div>
    </main>
  );
}
