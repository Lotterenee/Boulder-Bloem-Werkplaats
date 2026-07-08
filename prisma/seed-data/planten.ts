import { maandenNaarMasker } from "../../lib/domain/bloei";

// Plantenbibliotheek. Alle soorten inheems. `bloeimaanden` (bitmask) is de
// rekenbron voor palet/canvas/bloeiboog/coach; `bloeitijd` blijft leesbaar.
// Bloeitijden zijn indicatief (verschillen per jaar/streek) en een startpunt.
// `inheems` voedt het inheems-percentage; giftige soorten worden gemarkeerd.
type PlantSeed = {
  id: string;
  naamNL: string;
  naamWetenschappelijk: string;
  categorie: string;
  inheems: boolean;
  waardplantVoor: string | null;
  bloeitijd: string;
  licht: string;
  bodem: string;
  giftig: boolean;
  bloeimaanden: number;
  wintergroen: boolean;
  bloeikleur: string;
  drachtNectar: number;
  drachtPollen: number;
  hoogteM: number;
  prijs: number;
};

// Indicatieve prijs per stuk op basis van type (verifieren door Lotte).
const PRIJS_PER_TYPE: Record<string, number> = {
  boom: 35, struik: 12, dwergstruik: 6, klimplant: 14,
  "vaste plant": 4.5, oever: 5, bol: 0.35, kruid: 4,
};

function p(
  id: string, naamNL: string, wet: string, categorie: string,
  maanden: number[], bloeitijd: string, kleur: string,
  opts: { wintergroen?: boolean; giftig?: boolean; n?: number; pol?: number; hoogte?: number; waardplant?: string; licht?: string; bodem?: string; prijs?: number } = {}
): PlantSeed {
  return {
    id, naamNL, naamWetenschappelijk: wet, categorie, inheems: true,
    waardplantVoor: opts.waardplant ?? null, bloeitijd,
    licht: opts.licht ?? "zon", bodem: opts.bodem ?? "divers",
    giftig: opts.giftig ?? false,
    bloeimaanden: maandenNaarMasker(maanden), wintergroen: opts.wintergroen ?? false,
    bloeikleur: kleur, drachtNectar: opts.n ?? 0, drachtPollen: opts.pol ?? 0,
    hoogteM: opts.hoogte ?? 0.5,
    prijs: opts.prijs ?? PRIJS_PER_TYPE[categorie] ?? 5,
  };
}

export const planten: PlantSeed[] = [
  // Bomen en struiken (vroege dracht, waardplanten, wintergroen)
  p("pl-schietwilg", "Schietwilg", "Salix alba", "boom", [3, 4], "mrt-apr", "#E7D77C", { n: 5, pol: 5, hoogte: 6, waardplant: "insecten", bodem: "nat" }),
  p("pl-hazelaar", "Hazelaar", "Corylus avellana", "struik", [2, 3], "feb-mrt", "#E4D48A", { n: 1, pol: 5, hoogte: 4, waardplant: "vogels/insecten", licht: "halfschaduw" }),
  p("pl-sleedoorn", "Sleedoorn", "Prunus spinosa", "struik", [3, 4], "mrt-apr", "#F2EDE2", { n: 4, pol: 3, hoogte: 3, waardplant: "vlinders/vogels", bodem: "droog-vochtig" }),
  p("pl-meidoorn", "Meidoorn", "Crataegus monogyna", "struik", [5], "mei", "#F4EFE4", { n: 4, pol: 3, hoogte: 4, waardplant: "vogels/insecten" }),
  // Bollen en vaste planten
  p("pl-boerenkrokus", "Boerenkrokus (bol)", "Crocus tommasinianus", "bol", [2, 3], "feb-mrt", "#A98FD0", { n: 3, pol: 4, hoogte: 0.15, waardplant: "bijen" }),
  p("pl-pinksterbloem", "Pinksterbloem", "Cardamine pratensis", "vaste plant", [4, 5], "apr-mei", "#D3BFE3", { n: 3, pol: 2, hoogte: 0.4, waardplant: "oranjetipje", bodem: "vochtig" }),
  p("pl-slangenkruid", "Slangenkruid", "Echium vulgare", "vaste plant", [6, 7, 8], "jun-aug", "#6E93CF", { n: 5, pol: 4, hoogte: 0.8, waardplant: "wilde bijen", bodem: "droog" }),
  p("pl-knoopkruid", "Knoopkruid", "Centaurea jacea", "vaste plant", [6, 7, 8, 9], "jun-sep", "#B96FA0", { n: 5, pol: 4, hoogte: 0.7, waardplant: "vlinders" }),
  p("pl-beemdkroon", "Beemdkroon", "Knautia arvensis", "vaste plant", [7, 8, 9], "jul-sep", "#9F98CC", { n: 4, pol: 3, hoogte: 0.7, waardplant: "knautiabij" }),
  p("pl-wilde-marjolein", "Wilde marjolein", "Origanum vulgare", "vaste plant", [7, 8, 9], "jul-sep", "#D194B0", { n: 5, pol: 3, hoogte: 0.5, waardplant: "bijen/vlinders", bodem: "kalkrijk" }),
  p("pl-grote-kattenstaart", "Grote kattenstaart", "Lythrum salicaria", "oever", [6, 7, 8], "jun-aug", "#B473A6", { n: 4, pol: 3, hoogte: 1, waardplant: "bijen", bodem: "nat" }),
  // Wintergroen en late dracht
  p("pl-struikhei", "Struikhei", "Calluna vulgaris", "dwergstruik", [8, 9], "aug-sep", "#B07FC2", { wintergroen: true, n: 4, pol: 3, hoogte: 0.4, waardplant: "bijen", bodem: "zuur" }),
  p("pl-klimop", "Klimop", "Hedera helix", "klimplant", [9, 10, 11], "sep-nov", "#C7CE8F", { wintergroen: true, giftig: true, n: 5, pol: 4, hoogte: 3, waardplant: "late dracht", licht: "halfschaduw" }),
  p("pl-hulst", "Hulst", "Ilex aquifolium", "struik", [5, 6], "mei-jun", "#F1ECE0", { wintergroen: true, giftig: true, n: 3, pol: 2, hoogte: 3, waardplant: "vogels (bessen)", licht: "halfschaduw" }),
];
