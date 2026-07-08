import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateActiviteit, deleteActiviteit } from "@/lib/actions/educatie";
import { LesSchema, PrintbladInhoudSchema } from "@/lib/validators/les";
import { PageHeader, Card, Button, LinkButton } from "@/components/ui";
import LesWeergave from "@/components/educatie/LesWeergave";
import PrintbladWeergave from "@/components/educatie/PrintbladWeergave";
import ActiviteitForm from "../ActiviteitForm";

export const dynamic = "force-dynamic";

export default async function ActiviteitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activiteit = await prisma.educatieActiviteit.findUnique({
    where: { id },
    include: {
      _count: { select: { pakketten: true } },
      printbladen: { orderBy: { volgorde: "asc" } },
    },
  });
  if (!activiteit) notFound();

  const les = LesSchema.safeParse(activiteit.les);

  return (
    <>
      <PageHeader
        titel={activiteit.titel}
        sub={les.success ? "Volledige lesuitwerking uit het werkboek" : "Activiteit bewerken"}
      >
        {les.success && (
          <>
            <Link
              href="/educatie/lesbibliotheek"
              className="text-sm font-semibold text-ink-soft hover:text-clay-deep"
            >
              ← Lesbibliotheek
            </Link>
            <LinkButton href={`/educatie/activiteiten/${activiteit.id}/print`}>
              🖨 Print deze les
            </LinkButton>
          </>
        )}
      </PageHeader>

      {les.success && (
        <div className="mb-6 max-w-4xl space-y-6">
          <Card>
            <LesWeergave les={les.data} />
          </Card>

          {activiteit.printbladen.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-heading text-xl text-moss-deep">
                Printbladen ({activiteit.printbladen.length})
              </h2>
              {activiteit.printbladen.map((pb) => {
                const inhoud = PrintbladInhoudSchema.safeParse(pb.inhoud);
                if (!inhoud.success) return null;
                return (
                  <PrintbladWeergave key={pb.id} titel={pb.titel} inhoud={inhoud.data} />
                );
              })}
            </div>
          )}
        </div>
      )}

      <details className="max-w-3xl" open={!les.success}>
        <summary className="cursor-pointer font-heading text-lg text-moss-deep">
          Basisgegevens bewerken
        </summary>
        <Card className="mt-3">
          <ActiviteitForm
            action={updateActiviteit.bind(null, activiteit.id)}
            activiteit={activiteit}
          />
          {activiteit._count.pakketten === 0 && (
            <form
              action={deleteActiviteit.bind(null, activiteit.id)}
              className="mt-6 border-t border-sage/40 pt-4"
            >
              <Button variant="danger">Activiteit verwijderen</Button>
            </form>
          )}
        </Card>
      </details>
    </>
  );
}
