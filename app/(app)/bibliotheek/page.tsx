import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function BibliotheekPage() {
  const [elementen, planten, partners] = await Promise.all([
    prisma.element.count(),
    prisma.plant.count(),
    prisma.partner.count(),
  ]);

  const items = [
    {
      href: "/bibliotheek/elementen",
      titel: "Elementen",
      aantal: elementen,
      tekst: "Speelaanleidingen en toestellen voor de ontwerpstudio, met afmetingen, valruimte en indicatieprijs.",
    },
    {
      href: "/bibliotheek/planten",
      titel: "Planten",
      aantal: planten,
      tekst: "Inheemse en overige soorten met waardplant-informatie; voedt het inheems-percentage.",
    },
    {
      href: "/bibliotheek/partners",
      titel: "Partners",
      aantal: partners,
      tekst: "Groenaannemers, toestelleveranciers, kwekerijen en keuringsinstanties (AKI's).",
    },
  ];

  return (
    <>
      <PageHeader titel="Bibliotheek" sub="Herbruikbare bouwstenen voor projecten" />
      <div className="grid max-w-4xl gap-6 sm:grid-cols-3">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="group">
            <Card className="h-full transition group-hover:border-clay">
              <p className="font-heading text-4xl text-moss-deep">{item.aantal}</p>
              <p className="mt-1 font-semibold text-moss-deep">{item.titel}</p>
              <p className="mt-1 text-sm text-ink-soft">{item.tekst}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
