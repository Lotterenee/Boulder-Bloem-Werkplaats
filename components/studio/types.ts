import type { CanvasData } from "@/lib/validators/canvas";

/** Serialiseerbare weergave van een bibliotheekelement voor de studio. */
export type BibliotheekElement = {
  id: string;
  naam: string;
  categorie: string;
  soort: "speelaanleiding" | "speeltoestel";
  breedteM: number;
  diepteM: number;
  valruimteM: number;
  prijs: number;
};

export type CanvasElement = CanvasData["elementen"][number];

export const CATEGORIE_KLEUREN: Record<string, { fill: string; stroke: string }> = {
  klimmen: { fill: "#D9C4AC", stroke: "#9A7B5A" },
  water: { fill: "#AECAC4", stroke: "#5F8A81" },
  groen: { fill: "#CBD6C2", stroke: "#7E8C6A" },
  rust: { fill: "#F1E0D2", stroke: "#C98E70" },
  moestuin: { fill: "#E3D3A9", stroke: "#A08A4C" },
  pad: { fill: "#E7D8C5", stroke: "#B7A183" },
  terrein: { fill: "#E4E0C8", stroke: "#9C9666" },
};

export const SCHAAL = 32; // pixels per meter (raster = 1 m)

export function footprintRadiusM(bib: BibliotheekElement, schaal: number): number {
  return (Math.max(bib.breedteM, bib.diepteM) / 2) * schaal;
}

/** Straal van de vrije zone: halve voetafdruk plus de valruimte (absoluut). */
export function vrijeZoneRadiusM(bib: BibliotheekElement, schaal: number): number {
  return footprintRadiusM(bib, schaal) + bib.valruimteM;
}
