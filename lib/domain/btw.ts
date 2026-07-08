/** Btw-percentage als constante: wijzigt het tarief, pas het hier aan. */
export const BTW_PCT = 21;

export type OfferteRegel = {
  omschrijving: string;
  aantal: number;
  stuksprijs: number;
  btwPct: number;
};

export function rondAf(bedrag: number): number {
  return Math.round(bedrag * 100) / 100;
}

export function regelExcl(regel: OfferteRegel): number {
  return rondAf(regel.aantal * regel.stuksprijs);
}

export function berekenTotalen(regels: OfferteRegel[]): {
  totaalExcl: number;
  totaalBtw: number;
  totaalIncl: number;
} {
  const totaalExcl = rondAf(regels.reduce((acc, r) => acc + regelExcl(r), 0));
  const totaalBtw = rondAf(
    regels.reduce((acc, r) => acc + regelExcl(r) * (r.btwPct / 100), 0)
  );
  return { totaalExcl, totaalBtw, totaalIncl: rondAf(totaalExcl + totaalBtw) };
}
