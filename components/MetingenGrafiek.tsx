import { fmtDatum } from "@/lib/labels";

/**
 * Lijndiagram van waarnemingen per soortgroep over de metingen heen.
 * Gevalideerd categorisch palet (CVD-veilig, vaste volgorde, nooit gecycled);
 * soortgroepen boven de 8 vouwen samen in "Overig". De tabel eronder is de
 * toegankelijke weergave (relief voor lichte tinten).
 */
const SERIE_KLEUREN = [
  "#2a78d6",
  "#1baf7a",
  "#eda100",
  "#008300",
  "#4a3aa7",
  "#e34948",
  "#e87ba4",
  "#eb6834",
];

export type GrafiekMeting = {
  id: string;
  datum: Date;
  typeLabel: string;
  waarnemingen: { soortgroep: string; aantal: number }[];
};

export default function MetingenGrafiek({ metingen }: { metingen: GrafiekMeting[] }) {
  if (metingen.length === 0) return null;

  // Vaste serievolgorde: totaal aflopend; maximaal 8, rest vouwt in "Overig".
  const totalen = new Map<string, number>();
  for (const m of metingen) {
    for (const w of m.waarnemingen) {
      totalen.set(w.soortgroep, (totalen.get(w.soortgroep) ?? 0) + w.aantal);
    }
  }
  const gesorteerd = [...totalen.entries()].sort((a, b) => b[1] - a[1]);
  const hoofdgroepen = gesorteerd.slice(0, 8).map(([naam]) => naam);
  const heeftOverig = gesorteerd.length > 8;
  const series = heeftOverig ? [...hoofdgroepen.slice(0, 7), "Overig"] : hoofdgroepen;

  const waarde = (m: GrafiekMeting, serie: string): number => {
    if (serie === "Overig" && heeftOverig) {
      return m.waarnemingen
        .filter((w) => !hoofdgroepen.slice(0, 7).includes(w.soortgroep))
        .reduce((acc, w) => acc + w.aantal, 0);
    }
    return m.waarnemingen
      .filter((w) => w.soortgroep === serie)
      .reduce((acc, w) => acc + w.aantal, 0);
  };

  const max = Math.max(1, ...metingen.map((m) => series.map((s) => waarde(m, s))).flat());
  // Nette y-as: rond af op een veelvoud van 1/2/5.
  const stap = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500].find((s) => max / s <= 4) ?? 1000;
  const yMax = Math.ceil(max / stap) * stap;

  const B = { l: 44, r: 24, t: 12, b: 36 };
  const W = 680;
  const H = 300;
  const plotB = W - B.l - B.r;
  const plotH = H - B.t - B.b;
  const x = (i: number) =>
    B.l + (metingen.length === 1 ? plotB / 2 : (i / (metingen.length - 1)) * plotB);
  const y = (v: number) => B.t + plotH - (v / yMax) * plotH;

  const ticks = Array.from({ length: yMax / stap + 1 }, (_, i) => i * stap);
  const directLabels = series.length <= 4;

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Grafiek van waarnemingen per soortgroep per meting"
        className="w-full"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={B.l}
              x2={W - B.r}
              y1={y(t)}
              y2={y(t)}
              stroke="#CBD6C2"
              strokeWidth="1"
              opacity="0.5"
            />
            <text
              x={B.l - 8}
              y={y(t) + 4}
              textAnchor="end"
              fontSize="11"
              fill="#6B6258"
            >
              {t}
            </text>
          </g>
        ))}
        {metingen.map((m, i) => (
          <text
            key={m.id}
            x={x(i)}
            y={H - 14}
            textAnchor="middle"
            fontSize="11"
            fill="#6B6258"
          >
            {fmtDatum(m.datum)}
          </text>
        ))}
        {metingen.map((m, i) => (
          <text
            key={`${m.id}-type`}
            x={x(i)}
            y={H - 2}
            textAnchor="middle"
            fontSize="10"
            fill="#6B6258"
            opacity="0.8"
          >
            {m.typeLabel}
          </text>
        ))}
        {series.map((serie, si) => {
          const kleur = SERIE_KLEUREN[si];
          const punten = metingen.map((m, i) => ({ x: x(i), y: y(waarde(m, serie)), v: waarde(m, serie), m }));
          const pad = punten.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
          return (
            <g key={serie}>
              {punten.length > 1 && (
                <path d={pad} fill="none" stroke={kleur} strokeWidth="2" />
              )}
              {punten.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="4" fill={kleur} stroke="#FFFDF8" strokeWidth="2">
                  <title>{`${serie} · ${fmtDatum(p.m.datum)}: ${p.v}`}</title>
                </circle>
              ))}
              {directLabels && (
                <text
                  x={punten[punten.length - 1].x + 8}
                  y={punten[punten.length - 1].y + 4}
                  fontSize="11"
                  fontWeight="600"
                  fill="#3A352F"
                >
                  {serie}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1" aria-hidden={false}>
        {series.map((serie, si) => (
          <span key={serie} className="flex items-center gap-1.5 text-xs text-ink-soft">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: SERIE_KLEUREN[si] }}
            />
            {serie}
          </span>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Waarnemingen per soortgroep per meting
          </caption>
          <thead>
            <tr className="border-b border-sage/60 text-xs uppercase tracking-wide text-ink-soft">
              <th className="py-2 pr-3">Meting</th>
              {series.map((s) => (
                <th key={s} className="py-2 pr-3 text-right">
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metingen.map((m) => (
              <tr key={m.id} className="border-b border-sage/30 last:border-0">
                <td className="py-2 pr-3">
                  {fmtDatum(m.datum)}{" "}
                  <span className="text-xs text-ink-soft">({m.typeLabel})</span>
                </td>
                {series.map((s) => (
                  <td key={s} className="py-2 pr-3 text-right">
                    {waarde(m, s)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
