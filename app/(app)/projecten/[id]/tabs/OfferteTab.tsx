import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { genereerOfferte } from "@/lib/actions/offertes";
import { OFFERTE_STATUS_LABELS, fmtEuro, fmtDatum } from "@/lib/labels";
import { Card, Button, Badge, Veld, type BadgeTint } from "@/components/ui";

const statusTint: Record<string, BadgeTint> = {
  concept: "grijs",
  verzonden: "clay",
  geaccepteerd: "moss",
  afgewezen: "sand",
};

export default async function OfferteTab({ projectId }: { projectId: string }) {
  const [offertes, ontwerpen, pakketten] = await Promise.all([
    prisma.offerte.findMany({
      where: { projectId },
      orderBy: { datum: "desc" },
    }),
    prisma.ontwerp.findMany({
      where: { projectId },
      select: { id: true, naam: true, versie: true },
      orderBy: { versie: "desc" },
    }),
    prisma.educatiePakket.findMany({
      where: { projectId },
      select: { id: true, naam: true, totaalprijs: true },
    }),
  ]);

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <h2 className="mb-4 text-lg text-moss-deep">Offertes ({offertes.length})</h2>
        {offertes.length === 0 ? (
          <p className="text-sm text-ink-soft">
            Nog geen offertes. Genereer er een vanuit het ontwerp en/of het
            educatiepakket.
          </p>
        ) : (
          <ul className="divide-y divide-sage/40">
            {offertes.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-2 py-3">
                <div>
                  <Link
                    href={`/offertes/${o.id}`}
                    className="font-semibold text-moss-deep hover:text-clay-deep"
                  >
                    {o.offertenummer}
                  </Link>
                  <p className="text-xs text-ink-soft">{fmtDatum(o.datum)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    {fmtEuro(o.totaalIncl.toString())}{" "}
                    <span className="text-xs font-normal text-ink-soft">incl. btw</span>
                  </span>
                  <Badge tint={statusTint[o.status]}>
                    {OFFERTE_STATUS_LABELS[o.status]}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="mb-1 text-lg text-moss-deep">Nieuwe offerte</h2>
        <p className="mb-4 text-xs text-ink-soft">
          Regels worden overgenomen uit het gekozen ontwerp (materialen en
          beplanting) en/of pakket; daarna vrij te bewerken. Btw: 21%.
        </p>
        <form action={genereerOfferte} className="space-y-3">
          <input type="hidden" name="projectId" value={projectId} />
          <Veld label="Vanuit ontwerp">
            <select name="ontwerpId" defaultValue="" className="input">
              <option value="">Geen ontwerp</option>
              {ontwerpen.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.naam} (v{o.versie})
                </option>
              ))}
            </select>
          </Veld>
          <Veld label="Vanuit educatiepakket">
            <select name="pakketId" defaultValue="" className="input">
              <option value="">Geen pakket</option>
              {pakketten.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.naam} ({fmtEuro(p.totaalprijs?.toString())})
                </option>
              ))}
            </select>
          </Veld>
          <Button>Genereer offerte</Button>
        </form>
      </Card>
    </div>
  );
}
