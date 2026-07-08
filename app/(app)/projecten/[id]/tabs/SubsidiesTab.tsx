import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  createAanvraag,
  updateAanvraag,
  deleteAanvraag,
} from "@/lib/actions/subsidies";
import {
  AANVRAAG_STATUS_LABELS,
  SUBSIDIE_NIVEAU_LABELS,
  fmtEuro,
  fmtDatum,
  checkKleur,
} from "@/lib/labels";
import { Card, Button, Badge, TrafficLight, Veld } from "@/components/ui";

export default async function SubsidiesTab({
  projectId,
  gemeente,
}: {
  projectId: string;
  gemeente: string;
}) {
  const [aanvragen, subsidies] = await Promise.all([
    prisma.subsidieAanvraag.findMany({
      where: { projectId },
      include: { subsidie: true },
      orderBy: { status: "asc" },
    }),
    prisma.subsidie.findMany({ orderBy: { naam: "asc" } }),
  ]);

  const gekoppeld = new Set(aanvragen.map((a) => a.subsidieId));
  const beschikbaar = subsidies.filter((s) => !gekoppeld.has(s.id));
  // Eenvoudige match: landelijke regelingen en regelingen waarvan de regio
  // de gemeente noemt (of andersom). Provincie-matching blijft handwerk.
  const isMatch = (regio: string | null) =>
    !regio ||
    regio.toLowerCase().includes(gemeente.toLowerCase()) ||
    gemeente.toLowerCase().includes(regio.toLowerCase());

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-1 text-lg text-moss-deep">
          Aanvragen-pijplijn ({aanvragen.length})
        </h2>
        <p className="mb-4 text-xs text-ink-soft">
          scan → kansrijk → in voorbereiding → ingediend → toegekend/afgewezen →
          verantwoording → afgerond
        </p>
        {aanvragen.length === 0 ? (
          <p className="text-sm text-ink-soft">
            Nog geen aanvragen. Koppel hieronder een regeling aan dit project.
          </p>
        ) : (
          <div className="space-y-4">
            {aanvragen.map((a) => (
              <div key={a.id} className="rounded-lg border border-sage/50 bg-cream/40 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <TrafficLight
                      kleur={checkKleur(a.subsidie.laatstGecheckt)}
                      titel={`Regeling laatst gecheckt: ${fmtDatum(a.subsidie.laatstGecheckt)}`}
                    />
                    <Link
                      href={`/subsidies/${a.subsidieId}`}
                      className="font-semibold text-moss-deep hover:text-clay-deep"
                    >
                      {a.subsidie.naam}
                    </Link>
                    <Badge tint="water">
                      {SUBSIDIE_NIVEAU_LABELS[a.subsidie.niveau]}
                    </Badge>
                  </div>
                  <span className="text-xs text-ink-soft">
                    Max: {fmtEuro(a.subsidie.maxBedrag?.toString())}
                    {a.subsidie.percentage && ` · ${a.subsidie.percentage}`}
                  </span>
                </div>
                <form
                  action={updateAanvraag.bind(null, a.id)}
                  className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
                >
                  <Veld label="Status">
                    <select name="status" defaultValue={a.status} className="input">
                      {Object.entries(AANVRAAG_STATUS_LABELS).map(([w, l]) => (
                        <option key={w} value={w}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </Veld>
                  <Veld label="Aangevraagd (euro)">
                    <input
                      name="bedragAangevraagd"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={a.bedragAangevraagd?.toString() ?? ""}
                      className="input"
                    />
                  </Veld>
                  <Veld label="Toegekend (euro)">
                    <input
                      name="bedragToegekend"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue={a.bedragToegekend?.toString() ?? ""}
                      className="input"
                    />
                  </Veld>
                  <Veld label="Deadline">
                    <input
                      name="deadline"
                      type="date"
                      defaultValue={a.deadline?.toISOString().slice(0, 10) ?? ""}
                      className="input"
                    />
                  </Veld>
                  <Veld label="Notities">
                    <input name="notities" defaultValue={a.notities ?? ""} className="input" />
                  </Veld>
                  <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-5">
                    <Button variant="klein">Opslaan</Button>
                    <button
                      formAction={deleteAanvraag.bind(null, a.id)}
                      className="text-xs font-semibold text-ink-soft hover:text-clay-deep"
                    >
                      Verwijderen
                    </button>
                  </div>
                </form>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 text-lg text-moss-deep">Regeling koppelen</h2>
        {beschikbaar.length === 0 ? (
          <p className="text-sm text-ink-soft">
            Alle regelingen zijn al gekoppeld aan dit project.
          </p>
        ) : (
          <form action={createAanvraag} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="projectId" value={projectId} />
            <Veld label={`Regeling (✓ = mogelijke match voor ${gemeente})`}>
              <select name="subsidieId" required defaultValue="" className="input w-96 max-w-full">
                <option value="" disabled>
                  Kies een regeling...
                </option>
                {beschikbaar.map((s) => (
                  <option key={s.id} value={s.id}>
                    {isMatch(s.regio) ? "✓ " : ""}
                    {s.naam} ({s.regio ?? "landelijk"})
                  </option>
                ))}
              </select>
            </Veld>
            <Button>Start aanvraag</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
