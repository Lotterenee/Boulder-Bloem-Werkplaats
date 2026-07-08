import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  updatePakket,
  deletePakket,
  addActiviteitAanPakket,
  removeActiviteitVanPakket,
} from "@/lib/actions/educatie";
import { PAKKET_STATUS_LABELS, fmtEuro } from "@/lib/labels";
import { PageHeader, Card, Button, Veld } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function PakketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [pakket, alleActiviteiten, projecten] = await Promise.all([
    prisma.educatiePakket.findUnique({
      where: { id },
      include: {
        activiteiten: { include: { activiteit: true } },
        project: { select: { id: true, naam: true } },
      },
    }),
    prisma.educatieActiviteit.findMany({ orderBy: { titel: "asc" } }),
    prisma.project.findMany({
      where: { status: "actief" },
      select: { id: true, naam: true },
      orderBy: { naam: "asc" },
    }),
  ]);
  if (!pakket) notFound();

  const gekoppeld = new Set(pakket.activiteiten.map((k) => k.activiteitId));
  const beschikbaar = alleActiviteiten.filter((a) => !gekoppeld.has(a.id));

  return (
    <>
      <PageHeader
        titel={pakket.naam}
        sub={`Totaalprijs (som van activiteiten): ${fmtEuro(pakket.totaalprijs?.toString())}`}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg text-moss-deep">Activiteiten in dit pakket</h2>
          {pakket.activiteiten.length === 0 ? (
            <p className="text-sm text-ink-soft">
              Nog geen activiteiten gekoppeld. De totaalprijs wordt automatisch
              berekend zodra je activiteiten toevoegt.
            </p>
          ) : (
            <ul className="divide-y divide-sage/40">
              {pakket.activiteiten.map((k) => (
                <li key={k.id} className="flex items-center justify-between gap-2 py-2">
                  <div>
                    <p className="text-sm font-semibold">{k.activiteit.titel}</p>
                    <p className="text-xs text-ink-soft">
                      {k.activiteit.duurMinuten
                        ? `${k.activiteit.duurMinuten} min · `
                        : ""}
                      {fmtEuro(k.activiteit.prijs?.toString())}
                    </p>
                  </div>
                  <form action={removeActiviteitVanPakket.bind(null, k.id)}>
                    <button
                      type="submit"
                      aria-label="Verwijder uit pakket"
                      className="text-ink-soft hover:text-clay-deep"
                    >
                      ✕
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          {beschikbaar.length > 0 && (
            <form
              action={addActiviteitAanPakket.bind(null, pakket.id)}
              className="mt-4 flex items-end gap-2 border-t border-sage/40 pt-4"
            >
              <Veld label="Activiteit toevoegen" className="flex-1">
                <select name="activiteitId" required defaultValue="" className="input">
                  <option value="" disabled>
                    Kies een activiteit...
                  </option>
                  {beschikbaar.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.titel} ({fmtEuro(a.prijs?.toString())})
                    </option>
                  ))}
                </select>
              </Veld>
              <Button>Toevoegen</Button>
            </form>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-lg text-moss-deep">Pakketgegevens</h2>
          <form action={updatePakket.bind(null, pakket.id)} className="space-y-3">
            <Veld label="Naam *">
              <input name="naam" required defaultValue={pakket.naam} className="input" />
            </Veld>
            <Veld label="Status">
              <select name="status" defaultValue={pakket.status} className="input">
                {Object.entries(PAKKET_STATUS_LABELS).map(([w, l]) => (
                  <option key={w} value={w}>
                    {l}
                  </option>
                ))}
              </select>
            </Veld>
            <Veld label="Gekoppeld project">
              <select name="projectId" defaultValue={pakket.projectId ?? ""} className="input">
                <option value="">Geen project</option>
                {projecten.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.naam}
                  </option>
                ))}
              </select>
            </Veld>
            <Button>Opslaan</Button>
          </form>
          <form action={deletePakket.bind(null, pakket.id)} className="mt-6 border-t border-sage/40 pt-4">
            <Button variant="danger">Pakket verwijderen</Button>
          </form>
        </Card>
      </div>
    </>
  );
}
