import { prisma } from "@/lib/prisma";
import { toggleTaak, deleteTaak } from "@/lib/actions/projecten";
import { createBeheerTaak } from "@/lib/actions/metingen";
import { fmtDatum, isVerlopen } from "@/lib/labels";
import { Card, Button, Veld } from "@/components/ui";

export default async function BeheerTab({ projectId }: { projectId: string }) {
  const taken = await prisma.taak.findMany({
    where: { projectId, categorie: "beheer" },
    orderBy: [{ afgerond: "asc" }, { deadline: { sort: "asc", nulls: "last" } }],
  });

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <h2 className="mb-1 text-lg text-moss-deep">Beheeragenda</h2>
        <p className="mb-4 text-xs text-ink-soft">
          Terugkerend onderhoud na oplevering: snoeien, wilgen vlechten,
          herkeuring toestellen, waterpomp winterklaar maken.
        </p>
        {taken.length === 0 ? (
          <p className="text-sm text-ink-soft">Nog geen beheertaken gepland.</p>
        ) : (
          <ul className="divide-y divide-sage/40">
            {taken.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-3">
                <form action={toggleTaak.bind(null, t.id)}>
                  <button
                    type="submit"
                    aria-label={t.afgerond ? "Heropen taak" : "Vink taak af"}
                    className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                      t.afgerond
                        ? "border-moss bg-moss text-white"
                        : "border-sage bg-paper hover:border-moss"
                    }`}
                  >
                    {t.afgerond ? "✓" : ""}
                  </button>
                </form>
                <p
                  className={`flex-1 text-sm ${
                    t.afgerond ? "text-ink-soft line-through" : ""
                  }`}
                >
                  {t.titel}
                </p>
                {t.deadline && (
                  <span
                    className={`text-xs font-bold ${
                      !t.afgerond && isVerlopen(t.deadline)
                        ? "text-clay-deep"
                        : "text-ink-soft"
                    }`}
                  >
                    {fmtDatum(t.deadline)}
                  </span>
                )}
                <form action={deleteTaak.bind(null, t.id)}>
                  <button
                    type="submit"
                    aria-label="Taak verwijderen"
                    className="text-ink-soft hover:text-clay-deep"
                  >
                    ✕
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 text-lg text-moss-deep">Nieuwe beheertaak</h2>
        <form action={createBeheerTaak} className="space-y-3">
          <input type="hidden" name="projectId" value={projectId} />
          <Veld label="Taak *">
            <input name="titel" required className="input" placeholder="Wilgen knotten" />
          </Veld>
          <Veld label="Eerste datum *">
            <input name="deadline" type="date" required className="input" />
          </Veld>
          <Veld label="Jaarlijks herhalen (extra jaren, 0 t/m 5)">
            <input
              name="herhaalJaren"
              type="number"
              min="0"
              max="5"
              defaultValue="0"
              className="input"
            />
          </Veld>
          <Button>Inplannen</Button>
        </form>
      </Card>
    </div>
  );
}
