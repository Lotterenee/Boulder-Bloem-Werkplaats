// Plantenbibliotheek (starter). `inheems` voedt het inheems-percentage voor
// de ontwerpcoach (subsidie-eis, vaak minimaal 50% inheems). Giftige soorten
// worden duidelijk gemarkeerd in de UI (kinderomgeving).
export const planten = [
  { id: "pl-sleedoorn", naamNL: "Sleedoorn", naamWetenschappelijk: "Prunus spinosa", categorie: "struik", inheems: true, waardplantVoor: "vlinders/vogels", bloeitijd: "mrt-apr", licht: "zon/halfschaduw", bodem: "droog-vochtig", giftig: false },
  { id: "pl-meidoorn", naamNL: "Meidoorn", naamWetenschappelijk: "Crataegus monogyna", categorie: "struik", inheems: true, waardplantVoor: "vogels/insecten", bloeitijd: "mei", licht: "zon", bodem: "divers", giftig: false },
  { id: "pl-wilde-marjolein", naamNL: "Wilde marjolein", naamWetenschappelijk: "Origanum vulgare", categorie: "kruid", inheems: true, waardplantVoor: "bijen/vlinders", bloeitijd: "jul-sep", licht: "zon", bodem: "kalkrijk", giftig: false },
  { id: "pl-koninginnenkruid", naamNL: "Koninginnenkruid", naamWetenschappelijk: "Eupatorium cannabinum", categorie: "vaste plant", inheems: true, waardplantVoor: "vlinders", bloeitijd: "jul-sep", licht: "zon/halfschaduw", bodem: "vochtig", giftig: false },
  { id: "pl-grote-kattenstaart", naamNL: "Grote kattenstaart", naamWetenschappelijk: "Lythrum salicaria", categorie: "oever", inheems: true, waardplantVoor: "bijen", bloeitijd: "jun-aug", licht: "zon", bodem: "nat", giftig: false },
  { id: "pl-schietwilg", naamNL: "Wilg (schietwilg)", naamWetenschappelijk: "Salix alba", categorie: "boom", inheems: true, waardplantVoor: "insecten", bloeitijd: "mrt-apr", licht: "zon", bodem: "nat", giftig: false },
  { id: "pl-hazelaar", naamNL: "Hazelaar", naamWetenschappelijk: "Corylus avellana", categorie: "struik", inheems: true, waardplantVoor: "vogels/insecten", bloeitijd: "feb-mrt", licht: "halfschaduw", bodem: "divers", giftig: false },
  { id: "pl-vingerhoedskruid", naamNL: "Vingerhoedskruid", naamWetenschappelijk: "Digitalis purpurea", categorie: "vaste plant", inheems: true, waardplantVoor: "hommels", bloeitijd: "jun-jul", licht: "halfschaduw", bodem: "humusrijk", giftig: true },
  { id: "pl-es", naamNL: "Es", naamWetenschappelijk: "Fraxinus excelsior", categorie: "boom", inheems: true, waardplantVoor: "vogels", bloeitijd: "apr", licht: "zon", bodem: "vochtig", giftig: false },
  { id: "pl-gewone-vlier", naamNL: "Gewone vlier", naamWetenschappelijk: "Sambucus nigra", categorie: "struik", inheems: true, waardplantVoor: "vogels/insecten", bloeitijd: "jun", licht: "zon/halfschaduw", bodem: "voedselrijk", giftig: true },
] as const;
