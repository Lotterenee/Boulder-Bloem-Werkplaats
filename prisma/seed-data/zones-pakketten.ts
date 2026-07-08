// Vaste zone-sjablonen (5) en plantpakketten (2), Fase 3c.
// Relatieve posities in meters t.o.v. het groepsanker (linksboven van de zone).
// Refereert naar bestaande element- en plant-id's uit de seed.

type Regel = {
  soort: "element" | "plant";
  refId: string;
  relXM: number;
  relYM: number;
  rotatie?: number;
  schaal?: number;
};

export const zoneSjablonen: {
  id: string;
  naam: string;
  categorie: string;
  regels: Regel[];
}[] = [
  {
    id: "zone-klim",
    naam: "Klimzone compleet",
    categorie: "klim",
    regels: [
      { soort: "element", refId: "el-klimtoestel", relXM: 2.5, relYM: 2.5 },
      { soort: "element", refId: "el-boomstammenparcours", relXM: 7, relYM: 2, rotatie: 15 },
      { soort: "plant", refId: "pl-schietwilg", relXM: 6, relYM: 6 },
    ],
  },
  {
    id: "zone-water",
    naam: "Waterspeelzone",
    categorie: "water",
    regels: [
      { soort: "element", refId: "el-waterpomp", relXM: 1.5, relYM: 2 },
      { soort: "element", refId: "el-stapstenen", relXM: 4.5, relYM: 3, rotatie: 30 },
      { soort: "plant", refId: "pl-grote-kattenstaart", relXM: 1, relYM: 4.5 },
      { soort: "plant", refId: "pl-grote-kattenstaart", relXM: 2, relYM: 5 },
      { soort: "plant", refId: "pl-grote-kattenstaart", relXM: 3, relYM: 4.5 },
    ],
  },
  {
    id: "zone-moestuin",
    naam: "Moestuinhoek",
    categorie: "moestuin",
    regels: [
      { soort: "element", refId: "el-moestuinbak", relXM: 1, relYM: 1 },
      { soort: "element", refId: "el-moestuinbak", relXM: 1, relYM: 3 },
      { soort: "element", refId: "el-stapstenen", relXM: 3.5, relYM: 2, rotatie: 90 },
      { soort: "plant", refId: "pl-wilde-marjolein", relXM: 4.5, relYM: 1 },
      { soort: "plant", refId: "pl-wilde-marjolein", relXM: 4.5, relYM: 2 },
      { soort: "plant", refId: "pl-wilde-marjolein", relXM: 4.5, relYM: 3 },
    ],
  },
  {
    id: "zone-rust",
    naam: "Rustzone",
    categorie: "rust",
    regels: [
      { soort: "element", refId: "el-wilgenhut", relXM: 2, relYM: 2 },
      { soort: "plant", refId: "pl-meidoorn", relXM: 5, relYM: 2 },
      { soort: "plant", refId: "pl-pinksterbloem", relXM: 1, relYM: 4.5 },
      { soort: "plant", refId: "pl-beemdkroon", relXM: 2.5, relYM: 4.5 },
      { soort: "plant", refId: "pl-knoopkruid", relXM: 4, relYM: 4.5 },
    ],
  },
  {
    id: "zone-bloemenweide",
    naam: "Bloemenweide-rand",
    categorie: "bloemenweide",
    regels: [
      { soort: "plant", refId: "pl-pinksterbloem", relXM: 0.5, relYM: 0.5 },
      { soort: "plant", refId: "pl-slangenkruid", relXM: 1.5, relYM: 0.5 },
      { soort: "plant", refId: "pl-knoopkruid", relXM: 2.5, relYM: 0.5 },
      { soort: "plant", refId: "pl-beemdkroon", relXM: 3.5, relYM: 0.5 },
      { soort: "plant", refId: "pl-wilde-marjolein", relXM: 4.5, relYM: 0.5 },
      { soort: "plant", refId: "pl-struikhei", relXM: 5.5, relYM: 0.5 },
    ],
  },
];

export const plantPakketten: {
  id: string;
  naam: string;
  doel: string;
  regels: { plantId: string; aantal: number }[];
}[] = [
  {
    id: "pp-vlinderlint",
    naam: "Vlinderlint voorjaar-herfst",
    doel: "Doorlopende nectar voor vlinders van april t/m november",
    regels: [
      { plantId: "pl-pinksterbloem", aantal: 3 },
      { plantId: "pl-knoopkruid", aantal: 4 },
      { plantId: "pl-beemdkroon", aantal: 3 },
      { plantId: "pl-wilde-marjolein", aantal: 4 },
      { plantId: "pl-klimop", aantal: 1 },
    ],
  },
  {
    id: "pp-winterskelet",
    naam: "Winterskelet + vroege dracht",
    doel: "Wintergroen plus de eerste stuifmeel- en nectarbronnen",
    regels: [
      { plantId: "pl-hazelaar", aantal: 1 },
      { plantId: "pl-schietwilg", aantal: 1 },
      { plantId: "pl-boerenkrokus", aantal: 4 },
      { plantId: "pl-struikhei", aantal: 3 },
      { plantId: "pl-hulst", aantal: 1 },
    ],
  },
];
