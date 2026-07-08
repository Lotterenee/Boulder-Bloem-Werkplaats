import type { Les } from "@/lib/validators/les";

function Sectie({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 font-heading text-lg text-moss-deep">{titel}</h3>
      {children}
    </section>
  );
}

/** Volledige lesuitwerking in vaste volgorde (US-4b.1). */
export default function LesWeergave({ les }: { les: Les }) {
  return (
    <div className="space-y-6">
      <p className="text-base italic leading-relaxed text-ink-soft">{les.kort}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-sage-light/60 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-moss-deep">School</p>
          <p className="text-sm leading-relaxed">{les.doelenSchool}</p>
        </div>
        <div className="rounded-lg bg-water/40 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-moss-night">BSO / opvang</p>
          <p className="text-sm leading-relaxed">{les.doelenBso}</p>
        </div>
      </div>

      <Sectie titel="Voorbereiding">
        <ul className="space-y-1.5 text-sm leading-relaxed">
          {les.voorbereiding.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden className="mt-1 inline-block h-3.5 w-3.5 shrink-0 rounded-sm border border-moss" />
              {item}
            </li>
          ))}
        </ul>
      </Sectie>

      <Sectie titel="Draaiboek">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-moss-deep text-left text-xs uppercase tracking-wide text-ink-soft">
              <th className="w-16 py-2 pr-3">Tijd</th>
              <th className="w-44 py-2 pr-3">Onderdeel</th>
              <th className="py-2">Zo doe je het</th>
            </tr>
          </thead>
          <tbody>
            {les.draaiboek.map((regel, i) => (
              <tr key={i} className="border-b border-sage/40 align-top last:border-0">
                <td className="whitespace-nowrap py-2.5 pr-3 font-bold text-moss-deep">{regel.tijd}</td>
                <td className="py-2.5 pr-3 font-semibold">{regel.onderdeel}</td>
                <td className="py-2.5 leading-relaxed">
                  {regel.instructie}
                  {regel.voorbeeldzin && (
                    <span className="mt-1 block italic text-clay-deep">
                      Zeg bijvoorbeeld: &ldquo;{regel.voorbeeldzin}&rdquo;
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Sectie>

      {les.variant && (
        <div className="rounded-lg border-2 border-sage bg-cream/60 p-4 text-sm leading-relaxed">
          {les.variant}
        </div>
      )}

      <Sectie titel="Differentiatie">
        <div className="grid gap-3 sm:grid-cols-2 text-sm leading-relaxed">
          <div className="rounded-lg border border-sage/60 p-3">{les.differentiatieJong}</div>
          <div className="rounded-lg border border-sage/60 p-3">{les.differentiatieOud}</div>
        </div>
      </Sectie>

      <div className="rounded-lg bg-clay-soft p-4 text-sm leading-relaxed">
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-clay-deep">Veiligheid</p>
        {les.veiligheid}
      </div>

      <div className="rounded-lg bg-water/40 p-4 text-sm leading-relaxed">
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-moss-night">Bij regen</p>
        {les.regenBackup}
      </div>

      <Sectie titel="Afronding & mee terug">
        <p className="text-sm leading-relaxed">{les.afronding}</p>
      </Sectie>
    </div>
  );
}
