"use client";

import { bloeitIn, MAANDEN, bloeiSamenvatting } from "@/lib/domain/bloei";

/** Kleine 12-maands bloeikalender-strip voor het palet en selectiepaneel. */
export function BloeiStrip({
  bloeimaanden,
  bloeikleur,
  actieveMaand,
}: {
  bloeimaanden: number;
  bloeikleur: string;
  actieveMaand: number | null;
}) {
  return (
    <span className="inline-flex gap-px" aria-hidden>
      {MAANDEN.map((_, i) => {
        const m = i + 1;
        const aan = bloeitIn(bloeimaanden, m);
        const actief = actieveMaand === m;
        return (
          <span
            key={m}
            title={MAANDEN[i]}
            className={`inline-block h-3 w-1.5 rounded-[1px] ${actief ? "ring-1 ring-ink" : ""}`}
            style={{ backgroundColor: aan ? bloeikleur : "#E7E1D3" }}
          />
        );
      })}
    </span>
  );
}

/** Bloeiboog-balk: 12 staafjes met kleurcode 0/1/2+ en klikbare maanden. */
export function BloeiBoog({
  boog,
  actieveMaand,
  onKiesMaand,
}: {
  boog: number[];
  actieveMaand: number | null;
  onKiesMaand: (maand: number) => void;
}) {
  const max = Math.max(1, ...boog);
  const kleurVoor = (n: number) =>
    n === 0 ? "#B0714F" : n === 1 ? "#C98E70" : "#7E8C6A";

  return (
    <div>
      <div className="flex items-end gap-px" style={{ height: 56 }}>
        {boog.map((n, i) => {
          const m = i + 1;
          const hoogte = Math.max(4, (n / max) * 52);
          return (
            <button
              key={m}
              type="button"
              onClick={() => onKiesMaand(m)}
              title={`${MAANDEN[i]}: ${n} bloeiende soort(en)`}
              className={`flex flex-1 flex-col items-center justify-end gap-0.5 rounded-sm ${
                actieveMaand === m ? "bg-sage-light" : "hover:bg-cream"
              }`}
              style={{ height: 56 }}
            >
              <span
                className="w-full rounded-[2px]"
                style={{ height: hoogte, backgroundColor: kleurVoor(n) }}
              />
              <span className="text-[8px] text-ink-soft">{MAANDEN[i][0]}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-xs text-ink-soft">
        Bloeiboog: <span className="font-semibold">{bloeiSamenvatting(boog)}</span>
      </p>
    </div>
  );
}
