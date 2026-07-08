import { prisma } from "@/lib/prisma";
import { addWens, toggleWensVerwerkt, deleteWens } from "@/lib/actions/projecten";
import { WENS_BRON_LABELS, WENS_PRIORITEIT_LABELS } from "@/lib/labels";
import { Card, Button, Badge, Veld, type BadgeTint } from "@/components/ui";

const prioriteitTint: Record<string, BadgeTint> = {
  moet: "clayDeep",
  graag: "clay",
  misschien: "sand",
};

export default async function WensenTab({ projectId }: { projectId: string }) {
  const wensen = await prisma.wens.findMany({
    where: { projectId },
    orderBy: [{ verwerkt: "asc" }, { prioriteit: "asc" }],
  });

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <h2 className="mb-4 text-lg text-moss-deep">
          Wensen ({wensen.filter((w) => !w.verwerkt).length} open)
        </h2>
        {wensen.length === 0 ? (
          <p className="text-sm text-ink-soft">
            Nog geen wensen vastgelegd. Verzamel ze bij kinderen, team, ouders of
            tijdens de schouw.
          </p>
        ) : (
          <ul className="divide-y divide-sage/40">
            {wensen.map((w) => (
              <li key={w.id} className="flex items-center gap-3 py-3">
                <form action={toggleWensVerwerkt.bind(null, w.id)}>
                  <button
                    type="submit"
                    aria-label={w.verwerkt ? "Markeer als onverwerkt" : "Markeer als verwerkt"}
                    className={`flex h-5 w-5 items-center justify-center rounded border text-xs ${
                      w.verwerkt
                        ? "border-moss bg-moss text-white"
                        : "border-sage bg-paper hover:border-moss"
                    }`}
                  >
                    {w.verwerkt ? "✓" : ""}
                  </button>
                </form>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${w.verwerkt ? "text-ink-soft line-through" : ""}`}>
                    {w.tekst}
                  </p>
                  <p className="text-xs text-ink-soft">{WENS_BRON_LABELS[w.bron]}</p>
                </div>
                <Badge tint={prioriteitTint[w.prioriteit]}>
                  {WENS_PRIORITEIT_LABELS[w.prioriteit]}
                </Badge>
                <form action={deleteWens.bind(null, w.id)}>
                  <button
                    type="submit"
                    aria-label="Wens verwijderen"
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
        <h2 className="mb-4 text-lg text-moss-deep">Nieuwe wens</h2>
        <form action={addWens} className="space-y-3">
          <input type="hidden" name="projectId" value={projectId} />
          <Veld label="Wens *">
            <textarea name="tekst" required rows={2} className="input" />
          </Veld>
          <Veld label="Bron">
            <select name="bron" defaultValue="kinderen" className="input">
              {Object.entries(WENS_BRON_LABELS).map(([w, l]) => (
                <option key={w} value={w}>
                  {l}
                </option>
              ))}
            </select>
          </Veld>
          <Veld label="Prioriteit">
            <select name="prioriteit" defaultValue="graag" className="input">
              {Object.entries(WENS_PRIORITEIT_LABELS).map(([w, l]) => (
                <option key={w} value={w}>
                  {l}
                </option>
              ))}
            </select>
          </Veld>
          <Button>Wens toevoegen</Button>
        </form>
      </Card>
    </div>
  );
}
