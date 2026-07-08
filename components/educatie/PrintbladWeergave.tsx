import type { PrintbladInhoud, PrintbladBlok, PrintbladCel } from "@/lib/validators/les";

/** Tekst waarin het token {invul} een invul-lijn wordt. */
function TekstMetInvul({ tekst }: { tekst: string }) {
  const delen = tekst.split("{invul}");
  return (
    <>
      {delen.map((deel, i) => (
        <span key={i}>
          {deel}
          {i < delen.length - 1 && (
            <span
              aria-label="invulruimte"
              className="mx-1 inline-block min-w-24 border-b border-ink-soft/70 align-baseline"
            >
              &nbsp;
            </span>
          )}
        </span>
      ))}
    </>
  );
}

function Cel({ cel }: { cel: PrintbladCel }) {
  if (cel.turf) {
    return (
      <div className="min-h-8">
        {cel.tekst && (
          <span className="text-xs italic text-ink-soft/70">{cel.tekst}</span>
        )}
      </div>
    );
  }
  if (cel.invul) {
    return (
      <span>
        {cel.tekst && <span>{cel.tekst} </span>}
        <span className="inline-block min-w-16 border-b border-ink-soft/70">&nbsp;</span>
      </span>
    );
  }
  return <span>{cel.tekst ?? ""}</span>;
}

function Blok({ blok }: { blok: PrintbladBlok }) {
  switch (blok.type) {
    case "tekst":
      return (
        <p className="text-sm leading-relaxed">
          <TekstMetInvul tekst={blok.inhoud} />
        </p>
      );
    case "stappen":
      return (
        <ol className="list-decimal space-y-1 pl-5 text-sm leading-relaxed">
          {blok.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );
    case "checklist":
      return (
        <ul className="space-y-1 text-sm leading-relaxed">
          {blok.items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden className="mt-0.5 inline-block h-3.5 w-3.5 shrink-0 rounded-sm border border-ink-soft" />
              {item}
            </li>
          ))}
        </ul>
      );
    case "poster":
      return (
        <div className="space-y-3 py-2 text-center">
          {blok.regels.map((regel, i) => (
            <p key={i} className="font-heading text-xl leading-snug text-moss-deep">
              <TekstMetInvul tekst={regel} />
            </p>
          ))}
          {blok.slot && (
            <p className="pt-2 text-sm italic text-ink-soft">
              <TekstMetInvul tekst={blok.slot} />
            </p>
          )}
        </div>
      );
    case "tabel":
      return (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {blok.koppen.map((kop, i) => (
                <th
                  key={i}
                  className="border border-sage/70 bg-sage-light/50 px-2 py-1.5 text-left text-xs font-bold uppercase tracking-wide text-moss-deep"
                >
                  {kop}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {blok.rijen.map((rij, r) => (
              <tr key={r}>
                {rij.map((cel, c) => (
                  <td key={c} className="border border-sage/70 px-2 py-1.5 align-top">
                    <Cel cel={cel} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    case "kader":
      return (
        <div className="rounded-lg border-2 border-sage bg-cream/60 p-3 text-sm">
          {blok.titel && <p className="mb-1 font-bold text-moss-deep">{blok.titel}</p>}
          <TekstMetInvul tekst={blok.inhoud} />
        </div>
      );
    case "html":
      // Escape-hatch voor eigenzinnige vellen (bordjes, niveaukaarten).
      // Acceptabel: alle content is door Lotte zelf geschreven (ADR-0007).
      return (
        <div
          className="printblad-html text-sm"
          dangerouslySetInnerHTML={{ __html: blok.html }}
        />
      );
  }
}

/** Eén printblad als omkaderd vel; print op een eigen pagina. */
export default function PrintbladWeergave({
  titel,
  inhoud,
}: {
  titel: string;
  inhoud: PrintbladInhoud;
}) {
  return (
    <section
      aria-label={`Printblad: ${titel}`}
      className="vel rounded-xl border-2 border-dashed border-wood/50 bg-paper p-6 print:break-before-page print:rounded-none print:border-solid"
    >
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-moss-deep pb-2">
        <h3 className="font-heading text-xl text-moss-deep">{titel}</h3>
        <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-wood">
          {inhoud.tag}
        </span>
      </div>
      <div className="space-y-4">
        {inhoud.blokken.map((blok, i) => (
          <Blok key={i} blok={blok} />
        ))}
      </div>
      <p className="mt-6 border-t border-sage/50 pt-2 text-right text-[10px] uppercase tracking-wider text-ink-soft/70">
        Boulder Bloem · De Kas · lesbibliotheek
      </p>
    </section>
  );
}
