import type { CanvasData } from "@/lib/validators/canvas";
import { type BibliotheekElement, vrijeZoneRadiusM } from "./types";

let volgnummer = 0;
export function nieuwId(): string {
  volgnummer += 1;
  return `c${Date.now().toString(36)}-${volgnummer}`;
}

/**
 * Sjablonen verwijzen naar element-id's uit de seed-bibliotheek. Elementen
 * die niet (meer) bestaan worden bij het laden stilletjes overgeslagen.
 */
export const SJABLONEN: {
  naam: string;
  beschrijving: string;
  terrein: { breedteM: number; diepteM: number };
  elementen: { elementId: string; x: number; y: number; rotatie?: number }[];
}[] = [
  {
    naam: "Schoolplein starter",
    beschrijving: "Klimtoestel, zand & water, moestuin en groene randen (ca. 20 x 15 m)",
    terrein: { breedteM: 20, diepteM: 15 },
    elementen: [
      { elementId: "el-klimtoestel", x: 5, y: 4.5 },
      { elementId: "el-zandbak", x: 12, y: 3.5 },
      { elementId: "el-waterpomp", x: 16.5, y: 4 },
      { elementId: "el-speelheuvel", x: 5, y: 11 },
      { elementId: "el-boomstammenparcours", x: 13, y: 8.5, rotatie: 15 },
      { elementId: "el-moestuinbak", x: 17.5, y: 11 },
      { elementId: "el-moestuinbak", x: 17.5, y: 13 },
      { elementId: "el-wilgentunnel", x: 11, y: 13 },
      { elementId: "el-vlindertuin", x: 3, y: 14 },
    ],
  },
  {
    naam: "Natuurlijk ontdekpad (BSO)",
    beschrijving: "Zonder keuringsplichtige toestellen: paden, hutten en water (ca. 15 x 12 m)",
    terrein: { breedteM: 15, diepteM: 12 },
    elementen: [
      { elementId: "el-stapstenen", x: 4, y: 3, rotatie: 30 },
      { elementId: "el-wilgenhut", x: 9, y: 3 },
      { elementId: "el-wilgentunnel", x: 12.5, y: 5, rotatie: 90 },
      { elementId: "el-waterpomp", x: 4, y: 8 },
      { elementId: "el-boomstammenparcours", x: 9, y: 9.5 },
      { elementId: "el-vlindertuin", x: 13, y: 10.5, rotatie: 90 },
    ],
  },
];

export function laadSjabloon(
  sjabloon: (typeof SJABLONEN)[number],
  bibliotheek: BibliotheekElement[]
): CanvasData {
  const bekend = new Set(bibliotheek.map((b) => b.id));
  return {
    terrein: { ...sjabloon.terrein },
    raster: 1,
    elementen: sjabloon.elementen
      .filter((e) => bekend.has(e.elementId))
      .map((e) => ({
        id: nieuwId(),
        elementId: e.elementId,
        x: e.x,
        y: e.y,
        rotatie: e.rotatie ?? 0,
        schaal: 1,
      })),
  };
}

export type WizardOpties = {
  leeftijd: "peuters" | "basisschool" | "gemengd";
  budget: number;
  metWater: boolean;
};

/**
 * Ontwerphulp: kiest op basis van leeftijd, budget en waterwens een set
 * elementen en zet ze gespreid (met valruimte) op het terrein neer.
 */
export function wizardOntwerp(
  opties: WizardOpties,
  terrein: { breedteM: number; diepteM: number },
  bibliotheek: BibliotheekElement[]
): CanvasData["elementen"] {
  let kandidaten = [...bibliotheek];

  if (opties.leeftijd === "peuters") {
    // Voor peuters: geen grote klimtoestellen met veel valruimte.
    kandidaten = kandidaten.filter((b) => b.valruimteM < 1.5);
  }
  if (!opties.metWater) {
    kandidaten = kandidaten.filter((b) => b.categorie !== "water");
  }

  // Divers en betaalbaar: goedkoopste eerst binnen elke categorie,
  // dan rondjes over de categorieën tot het budget op is.
  const perCategorie = new Map<string, BibliotheekElement[]>();
  for (const b of kandidaten.sort((a, z) => a.prijs - z.prijs)) {
    const lijst = perCategorie.get(b.categorie) ?? [];
    lijst.push(b);
    perCategorie.set(b.categorie, lijst);
  }

  const gekozen: BibliotheekElement[] = [];
  let budgetOver = opties.budget;
  let nogIets = true;
  while (nogIets) {
    nogIets = false;
    for (const lijst of perCategorie.values()) {
      const volgende = lijst.shift();
      if (volgende && volgende.prijs <= budgetOver) {
        gekozen.push(volgende);
        budgetOver -= volgende.prijs;
        nogIets = true;
      }
    }
  }

  // Plaatsing: rijen met tussenruimte op basis van de vrije zone.
  const elementen: CanvasData["elementen"] = [];
  const marge = 1;
  let x = marge;
  let y = marge;
  let rijHoogte = 0;
  for (const b of gekozen) {
    const zone = vrijeZoneRadiusM(b, 1);
    const nodigB = zone * 2 + 0.5;
    if (x + nodigB > terrein.breedteM - marge) {
      x = marge;
      y += rijHoogte + 0.5;
      rijHoogte = 0;
    }
    if (y + zone * 2 > terrein.diepteM - marge) break; // terrein vol
    elementen.push({
      id: nieuwId(),
      elementId: b.id,
      x: x + zone,
      y: y + zone,
      rotatie: 0,
      schaal: 1,
    });
    x += nodigB;
    rijHoogte = Math.max(rijHoogte, zone * 2);
  }
  return elementen;
}
