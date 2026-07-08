import type { CanvasData } from "@/lib/validators/canvas";
import type {
  BibliotheekElement,
  BibliotheekPlant,
  StudioZone,
  StudioPakket,
  CanvasElement,
  CanvasBeplanting,
} from "./types";
import { vrijeZoneRadiusM } from "./types";
import { bloeiboog, bloeigaten } from "@/lib/domain/bloei";

let volgnummer = 0;
export function nieuwId(): string {
  volgnummer += 1;
  return `c${Date.now().toString(36)}-${volgnummer}`;
}

type Toevoeging = { elementen: CanvasElement[]; beplanting: CanvasBeplanting[] };

/** Plaats een zone-sjabloon als groep op een anker (absolute meters). */
export function plaatsZone(
  zone: StudioZone,
  ankerXM: number,
  ankerYM: number,
  elementBib: Map<string, BibliotheekElement>,
  plantBib: Map<string, BibliotheekPlant>
): Toevoeging {
  const elementen: CanvasElement[] = [];
  const beplanting: CanvasBeplanting[] = [];
  for (const r of zone.regels) {
    const x = ankerXM + r.relXM;
    const y = ankerYM + r.relYM;
    if (r.soort === "element" && elementBib.has(r.refId)) {
      elementen.push({ id: nieuwId(), elementId: r.refId, x, y, rotatie: r.rotatie, schaal: r.schaal });
    } else if (r.soort === "plant" && plantBib.has(r.refId)) {
      beplanting.push({ id: nieuwId(), plantId: r.refId, x, y });
    }
  }
  return { elementen, beplanting };
}

/** Plaats een plantpakket als nette groep planten rond een anker. */
export function plaatsPakket(
  pakket: StudioPakket,
  ankerXM: number,
  ankerYM: number,
  plantBib: Map<string, BibliotheekPlant>
): CanvasBeplanting[] {
  const stuks: string[] = [];
  for (const r of pakket.regels) {
    if (!plantBib.has(r.plantId)) continue;
    for (let i = 0; i < r.aantal; i++) stuks.push(r.plantId);
  }
  const beplanting: CanvasBeplanting[] = [];
  const kolommen = Math.max(1, Math.ceil(Math.sqrt(stuks.length)));
  const spatie = 0.8;
  stuks.forEach((plantId, i) => {
    const kol = i % kolommen;
    const rij = Math.floor(i / kolommen);
    beplanting.push({
      id: nieuwId(),
      plantId,
      x: ankerXM + kol * spatie,
      y: ankerYM + rij * spatie,
    });
  });
  return beplanting;
}

/** Bereken de 12-maands dekking van een pakket uit zijn regels. */
export function pakketDekking(
  pakket: StudioPakket,
  plantBib: Map<string, BibliotheekPlant>
): number[] {
  const soorten = pakket.regels
    .map((r) => plantBib.get(r.plantId))
    .filter((p): p is BibliotheekPlant => Boolean(p));
  return bloeiboog(soorten);
}

export type WizardOpties = {
  leeftijd: "peuters" | "basisschool" | "gemengd";
  budget: number;
  metWater: boolean;
  winterGroen: boolean;
};

// Welke zones passen bij welke wens; volgorde bepaalt plaatsing.
const WENS_ZONES: { categorie: string; vereistWater?: boolean }[] = [
  { categorie: "klim" },
  { categorie: "water", vereistWater: true },
  { categorie: "moestuin" },
  { categorie: "rust" },
  { categorie: "bloemenweide" },
];

/**
 * Ontwerphulp: bouwt een startopzet uit zone-sjablonen (passend bij leeftijd,
 * water en budget) en voegt minstens een plantpakket toe zodat de bloeiboog
 * maart t/m oktober dekt; bij winterGroen ook het winterskelet-pakket.
 */
export function wizardOntwerp(
  opties: WizardOpties,
  terrein: { breedteM: number; diepteM: number },
  elementBib: Map<string, BibliotheekElement>,
  plantBib: Map<string, BibliotheekPlant>,
  zones: StudioZone[],
  pakketten: StudioPakket[]
): Toevoeging {
  const vasteZones = zones.filter((z) => !z.eigen);
  const gekozenZones: StudioZone[] = [];
  for (const wens of WENS_ZONES) {
    if (wens.vereistWater && !opties.metWater) continue;
    // Peuters: geen klimzone met keuringsplichtige toestellen.
    if (opties.leeftijd === "peuters" && wens.categorie === "klim") continue;
    const zone = vasteZones.find((z) => z.categorie === wens.categorie);
    if (zone) gekozenZones.push(zone);
  }

  // Grof budget: elke zone ~ een kwart van het budget; stop als het op is.
  const kostenPerZone = (z: StudioZone) =>
    z.regels
      .filter((r) => r.soort === "element")
      .reduce((som, r) => som + (elementBib.get(r.refId)?.prijs ?? 0), 0);

  const elementen: CanvasElement[] = [];
  const beplanting: CanvasBeplanting[] = [];
  let budgetOver = opties.budget;

  // Tegelen: zones naast elkaar in rijen van ~10 m breed.
  let x = 1;
  let y = 1;
  let rijHoogte = 0;
  for (const zone of gekozenZones) {
    const kosten = kostenPerZone(zone);
    if (kosten > budgetOver && elementen.length > 0) continue;
    const breedte = Math.max(...zone.regels.map((r) => r.relXM)) + 2;
    const hoogte = Math.max(...zone.regels.map((r) => r.relYM)) + 2;
    if (x + breedte > terrein.breedteM - 1) {
      x = 1;
      y += rijHoogte + 1;
      rijHoogte = 0;
    }
    if (y + hoogte > terrein.diepteM - 1) break;
    const toev = plaatsZone(zone, x, y, elementBib, plantBib);
    elementen.push(...toev.elementen);
    beplanting.push(...toev.beplanting);
    budgetOver -= kosten;
    x += breedte + 1;
    rijHoogte = Math.max(rijHoogte, hoogte);
  }

  // Bloeiboog dekken: vlinderlint erbij als er nog gaten zijn.
  const uniek = () => {
    const m = new Map<string, BibliotheekPlant>();
    for (const b of beplanting) {
      const p = plantBib.get(b.plantId);
      if (p) m.set(p.id, p);
    }
    return [...m.values()];
  };
  const vlinderlint = pakketten.find((p) => p.id === "pp-vlinderlint");
  if (vlinderlint && bloeigaten(bloeiboog(uniek())).length > 0) {
    beplanting.push(...plaatsPakket(vlinderlint, 1, Math.min(y + rijHoogte + 1, terrein.diepteM - 2), plantBib));
  }

  // Winterskelet bij winterwens (of als er nog geen wintergroen is).
  const heeftWintergroen = () => uniek().some((p) => p.wintergroen);
  const winterskelet = pakketten.find((p) => p.id === "pp-winterskelet");
  if (winterskelet && (opties.winterGroen || !heeftWintergroen())) {
    beplanting.push(
      ...plaatsPakket(winterskelet, Math.max(1, terrein.breedteM - 4), 1, plantBib)
    );
  }

  return { elementen, beplanting };
}

/**
 * Bewaar de huidige selectie als eigen-sjabloonregels: relatieve posities
 * t.o.v. het meest linksboven gelegen item.
 */
export function selectieAlsRegels(
  elementen: CanvasElement[],
  beplanting: CanvasBeplanting[]
): { soort: "element" | "plant"; refId: string; relXM: number; relYM: number; rotatie: number; schaal: number }[] {
  const items = [
    ...elementen.map((e) => ({ soort: "element" as const, refId: e.elementId, x: e.x, y: e.y, rotatie: e.rotatie, schaal: e.schaal })),
    ...beplanting.map((b) => ({ soort: "plant" as const, refId: b.plantId, x: b.x, y: b.y, rotatie: 0, schaal: 1 })),
  ];
  if (items.length === 0) return [];
  const minX = Math.min(...items.map((i) => i.x));
  const minY = Math.min(...items.map((i) => i.y));
  return items.map((i) => ({
    soort: i.soort,
    refId: i.refId,
    relXM: Math.round((i.x - minX) * 100) / 100,
    relYM: Math.round((i.y - minY) * 100) / 100,
    rotatie: i.rotatie,
    schaal: i.schaal,
  }));
}

/** Backwards-compat helper voor volledige-canvas starters (ongebruikt na 3c). */
export type { CanvasData };
