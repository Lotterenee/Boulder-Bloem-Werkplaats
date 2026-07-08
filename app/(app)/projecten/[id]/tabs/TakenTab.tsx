import { prisma } from "@/lib/prisma";
import { createTaak, toggleTaak, deleteTaak } from "@/lib/actions/projecten";
import { TAAK_CATEGORIE_LABELS, fmtDatum, isVerlopen } from "@/lib/labels";
import { Card, Button, Badge, Veld } from "@/components/ui";

export default async function TakenTab({ projectId }: { projectId: string }) {
  const taken = await prisma.taak.findMany({
    where: { projectId },
    orderBy: [{ afgerond: "asc" }, { deadline: { sort: "asc", nulls: "last" } }],
  });

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <h2 className="mb-4 text-lg text-moss-deep">
          Taken ({taken.filter((t) => !t.afgerond).length} open)
        </h2>
        {taken.length === 0 ? (
          <p className="text-sm text-ink-soft">Nog geen taken voor dit project.</p>
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
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${t.afgerond ? "text-ink-soft line-through" : ""}`}>
                    {t.titel}
                  </p>
                  <p className="text-xs text-ink-soft">
                    <Badge tint="grijs">{TAAK_CATEGORIE_LABELS[t.categorie]}</Badge>
                  </p>
                </div>
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
        <h2 className="mb-4 text-lg text-moss-deep">Nieuwe taak</h2>
        <form action={createTaak} className="space-y-3">
          <input type="hidden" name="projectId" value={projectId} />
          <Veld label="Titel *">
            <input name="titel" required className="input" />
          </Veld>
          <Veld label="Categorie">
            <select name="categorie" defaultValue="algemeen" className="input">
              {Object.entries(TAAK_CATEGORIE_LABELS).map(([w, l]) => (
                <option key={w} value={w}>
                  {l}
                </option>
              ))}
            </select>
          </Veld>
          <Veld label="Deadline">
            <input name="deadline" type="date" className="input" />
          </Veld>
          <Button>Taak toevoegen</Button>
        </form>
      </Card>
    </div>
  );
}
