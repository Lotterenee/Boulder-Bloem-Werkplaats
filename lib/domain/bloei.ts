/**
 * Bloei-rekenlogica (ADR-0008). Bloeimaanden zijn een 12-bits masker op Plant
 * (bit 0 = januari). Deze helpers zijn de enige rekenbron voor palet, canvas,
 * bloeiboog en coach.
 */

export const MAANDEN = [
  "jan", "feb", "mrt", "apr", "mei", "jun",
  "jul", "aug", "sep", "okt", "nov", "dec",
] as const;

export const MAANDEN_VOLUIT = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
] as const;

/** Bit voor maand m (1..12). */
export const maandBit = (m: number): number => 1 << (m - 1);

/** Bloeit een masker in maand m (1..12)? */
export const bloeitIn = (masker: number, m: number): boolean =>
  (masker & maandBit(m)) !== 0;

/** Zet een lijst maandnummers (1..12) om naar een masker. */
export function maandenNaarMasker(maanden: number[]): number {
  return maanden.reduce((acc, m) => acc | maandBit(m), 0);
}

/** Zet een masker om naar de lijst maandnummers (1..12) die aan staan. */
export function maskerNaarMaanden(masker: number): number[] {
  const out: number[] = [];
  for (let m = 1; m <= 12; m++) if (bloeitIn(masker, m)) out.push(m);
  return out;
}

export type PlantStatus = "bloei" | "groen" | "wintergroen" | "kaal";

/** Kleurstatus van een plant in een gegeven maand (1..12). */
export function plantStatus(
  p: { bloeimaanden: number; wintergroen: boolean },
  maand: number
): PlantStatus {
  if (bloeitIn(p.bloeimaanden, maand)) return "bloei";
  if (p.wintergroen) return "wintergroen";
  if (maand >= 4 && maand <= 10) return "groen";
  return "kaal";
}

/** Kleurregels uit het prototype (3.3). "bloei" gebruikt de eigen bloeikleur. */
export const STATUS_KLEUREN: Record<Exclude<PlantStatus, "bloei">, string> = {
  groen: "#9BB08A",
  wintergroen: "#5E6B4F",
  kaal: "transparent",
};

/** Per maand het aantal unieke bloeiende soorten (12 tellers, index 0 = jan). */
export function bloeiboog(soorten: { bloeimaanden: number }[]): number[] {
  const boog = new Array(12).fill(0);
  for (let m = 1; m <= 12; m++) {
    let n = 0;
    for (const s of soorten) if (bloeitIn(s.bloeimaanden, m)) n++;
    boog[m - 1] = n;
  }
  return boog;
}

/** Maanden (1..12) in het kernseizoen maart t/m oktober met 0 bloeiers. */
export function bloeigaten(boog: number[]): number[] {
  const gaten: number[] = [];
  for (let m = 3; m <= 10; m++) if ((boog[m - 1] ?? 0) === 0) gaten.push(m);
  return gaten;
}

/** Leesbare samenvatting van gaten, bv. "gat: apr, mei" of "doorlopend". */
export function bloeiSamenvatting(boog: number[]): string {
  const gaten = bloeigaten(boog);
  if (gaten.length === 0) return "doorlopend (maart t/m oktober)";
  return `gat: ${gaten.map((m) => MAANDEN[m - 1]).join(", ")}`;
}
