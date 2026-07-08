import { prisma } from "@/lib/prisma";
import { deleteMeting } from "@/lib/actions/metingen";
import { METING_TYPE_LABELS, fmtDatum } from "@/lib/labels";
import { waarnemingenSchema } from "@/lib/validators/meting";
import { Card, Badge } from "@/components/ui";
import MetingenGrafiek from "@/components/MetingenGrafiek";
import MetingForm from "./MetingForm";

export default async function MetingenTab({ projectId }: { projectId: string }) {
  const metingen = await prisma.meting.findMany({
    where: { projectId },
    orderBy: { datum: "asc" },
  });

  const grafiekData = metingen.map((m) => {
    const parsed = waarnemingenSchema.safeParse(m.waarnemingen);
    return {
      id: m.id,
      datum: m.datum,
      typeLabel: METING_TYPE_LABELS[m.type],
      waarnemingen: parsed.success ? parsed.data : [],
      notities: m.notities,
    };
  });

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg text-moss-deep">Biodiversiteitsontwikkeling</h2>
          {metingen.length > 0 && (
            <a
              href={`/api/projecten/${projectId}/verantwoording`}
              className="rounded-lg border border-sage px-3 py-1.5 text-sm font-semibold text-moss-deep transition hover:bg-sage-light"
            >
              ⬇ Verantwoordings-export (CSV)
            </a>
          )}
        </div>
        {metingen.length === 0 ? (
          <p className="text-sm text-ink-soft">
            Nog geen metingen. Begin met een nulmeting bij de start van het
            project; tel daarna jaarlijks.
          </p>
        ) : (
          <MetingenGrafiek metingen={grafiekData} />
        )}
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg text-moss-deep">Metingen ({metingen.length})</h2>
          {metingen.length === 0 ? (
            <p className="text-sm text-ink-soft">Nog geen metingen ingevoerd.</p>
          ) : (
            <ul className="divide-y divide-sage/40">
              {[...grafiekData].reverse().map((m) => (
                <li key={m.id} className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">
                      {fmtDatum(m.datum)}{" "}
                      <Badge tint={m.typeLabel === "Nulmeting" ? "water" : "sage"}>
                        {m.typeLabel}
                      </Badge>
                    </p>
                    <form action={deleteMeting.bind(null, m.id)}>
                      <button
                        type="submit"
                        aria-label="Meting verwijderen"
                        className="text-ink-soft hover:text-clay-deep"
                      >
                        ✕
                      </button>
                    </form>
                  </div>
                  <p className="mt-1 text-xs text-ink-soft">
                    {m.waarnemingen
                      .map((w) => `${w.soortgroep}: ${w.aantal}`)
                      .join(" · ") || "Geen waarnemingen"}
                  </p>
                  {m.notities && (
                    <p className="mt-1 text-xs italic text-ink-soft">{m.notities}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-4 text-lg text-moss-deep">Nieuwe meting</h2>
          <MetingForm projectId={projectId} />
        </Card>
      </div>
    </div>
  );
}
