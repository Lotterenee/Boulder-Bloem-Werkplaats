// Elementbibliotheek (starter). `soort` codeert het WAS 2023-onderscheid:
// zonder vaste constructie = speelaanleiding (geen keuring), met vaste
// constructie of gecertificeerd toestel = speeltoestel (keuringsplichtig
// via een AKI). Prijzen zijn indicatief en moeten geverifieerd worden.
export const elementen = [
  { id: "el-wilgentunnel", naam: "Wilgentunnel", categorie: "groen", soort: "speelaanleiding", standaardBreedteM: 3, standaardDiepteM: 1, valruimteM: 0, indicatieprijs: 350, icoon: "boog" },
  { id: "el-stapstenen", naam: "Stapstenen (natuursteen)", categorie: "pad", soort: "speelaanleiding", standaardBreedteM: 4, standaardDiepteM: 0.5, valruimteM: 0, indicatieprijs: 300, icoon: "stenen" },
  { id: "el-waterpomp", naam: "Waterpomp met geul", categorie: "water", soort: "speelaanleiding", standaardBreedteM: 2, standaardDiepteM: 3, valruimteM: 0, indicatieprijs: 900, icoon: "pomp" },
  { id: "el-boomstammenparcours", naam: "Boomstammenparcours", categorie: "klimmen", soort: "speelaanleiding", standaardBreedteM: 6, standaardDiepteM: 1, valruimteM: 1.0, indicatieprijs: 700, icoon: "balken" },
  { id: "el-speelheuvel", naam: "Speelheuvel met tunnel", categorie: "terrein", soort: "speelaanleiding", standaardBreedteM: 5, standaardDiepteM: 5, valruimteM: 0, indicatieprijs: 1500, icoon: "heuvel" },
  { id: "el-zandbak", naam: "Zandbak met rand", categorie: "terrein", soort: "speelaanleiding", standaardBreedteM: 3, standaardDiepteM: 3, valruimteM: 0, indicatieprijs: 600, icoon: "zand" },
  { id: "el-moestuinbak", naam: "Moestuinbak (hoog)", categorie: "moestuin", soort: "speelaanleiding", standaardBreedteM: 2, standaardDiepteM: 1, valruimteM: 0, indicatieprijs: 250, icoon: "bak" },
  { id: "el-klimtoestel", naam: "Klimtoestel (gecertificeerd)", categorie: "klimmen", soort: "speeltoestel", standaardBreedteM: 4, standaardDiepteM: 4, valruimteM: 1.5, indicatieprijs: 4500, icoon: "klim" },
  { id: "el-schommel", naam: "Schommel (gecertificeerd)", categorie: "klimmen", soort: "speeltoestel", standaardBreedteM: 3, standaardDiepteM: 2, valruimteM: 2.0, indicatieprijs: 2800, icoon: "schommel" },
  { id: "el-glijbaan", naam: "Glijbaan op heuvel", categorie: "klimmen", soort: "speeltoestel", standaardBreedteM: 1, standaardDiepteM: 3, valruimteM: 1.5, indicatieprijs: 1900, icoon: "glijbaan" },
  { id: "el-wilgenhut", naam: "Wilgenhut", categorie: "rust", soort: "speelaanleiding", standaardBreedteM: 2, standaardDiepteM: 2, valruimteM: 0, indicatieprijs: 400, icoon: "hut" },
  { id: "el-vlindertuin", naam: "Vlindertuin/border", categorie: "groen", soort: "speelaanleiding", standaardBreedteM: 4, standaardDiepteM: 1, valruimteM: 0, indicatieprijs: 300, icoon: "bloem" },
] as const;
