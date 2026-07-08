import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function EducatiePage() {
  const [aantalActiviteiten, aantalPakketten, aantalLessen] = await Promise.all([
    prisma.educatieActiviteit.count(),
    prisma.educatiePakket.count(),
    prisma.educatieActiviteit.count({ where: { les: { not: Prisma.DbNull } } }),
  ]);

  return (
    <>
      <PageHeader
        titel="Educatie"
        sub="Activiteitenbibliotheek, het werkboek en pakketten voor scholen en BSO's"
      />
      <div className="grid max-w-4xl gap-6 sm:grid-cols-3">
        <Link href="/educatie/lesbibliotheek" className="group">
          <Card className="h-full transition group-hover:border-clay">
            <p className="font-heading text-4xl text-moss-deep">{aantalLessen}</p>
            <p className="mt-1 font-semibold text-moss-deep">Lesbibliotheek</p>
            <p className="mt-1 text-sm text-ink-soft">
              Het werkboek: volledig uitgewerkte lessen met draaiboek,
              printbladen en een losse les-PDF.
            </p>
          </Card>
        </Link>
        <Link href="/educatie/activiteiten" className="group">
          <Card className="h-full transition group-hover:border-clay">
            <p className="font-heading text-4xl text-moss-deep">{aantalActiviteiten}</p>
            <p className="mt-1 font-semibold text-moss-deep">Activiteiten</p>
            <p className="mt-1 text-sm text-ink-soft">
              Losse workshops en lessen met leeftijd, seizoen, duur en prijs.
            </p>
          </Card>
        </Link>
        <Link href="/educatie/pakketten" className="group">
          <Card className="h-full transition group-hover:border-clay">
            <p className="font-heading text-4xl text-moss-deep">{aantalPakketten}</p>
            <p className="mt-1 font-semibold text-moss-deep">Pakketten</p>
            <p className="mt-1 text-sm text-ink-soft">
              Bundels van activiteiten met automatische totaalprijs, koppelbaar
              aan een project.
            </p>
          </Card>
        </Link>
      </div>
    </>
  );
}
