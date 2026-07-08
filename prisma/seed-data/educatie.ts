// Educatie-activiteiten en pakketten (starter).
export const activiteiten = [
  { id: "ea-modderkeuken", titel: "Modderkeuken-workshop", leeftijdVan: 4, leeftijdTot: 8, seizoen: "lente/zomer", duurMinuten: 60, prijs: 120 },
  { id: "ea-insectenhotel", titel: "Insectenhotel bouwen", leeftijdVan: 6, leeftijdTot: 12, seizoen: "voorjaar", duurMinuten: 90, prijs: 150 },
  { id: "ea-zaaien-moestuin", titel: "Zaaien & moestuinles", leeftijdVan: 6, leeftijdTot: 10, seizoen: "voorjaar", duurMinuten: 60, prijs: 110 },
  { id: "ea-vogels-spotten", titel: "Vogels spotten & tellen", leeftijdVan: 8, leeftijdTot: 12, seizoen: "winter", duurMinuten: 45, prijs: 95 },
  { id: "ea-waterdiertjes", titel: "Waterdiertjes onderzoeken", leeftijdVan: 8, leeftijdTot: 12, seizoen: "zomer", duurMinuten: 60, prijs: 130 },
  { id: "ea-wilgen-vlechten", titel: "Wilgen vlechten", leeftijdVan: 6, leeftijdTot: 12, seizoen: "winter", duurMinuten: 90, prijs: 140 },
  { id: "ea-bijen-bestuiving", titel: "Bijen & bestuiving", leeftijdVan: 8, leeftijdTot: 12, seizoen: "zomer", duurMinuten: 60, prijs: 120 },
  { id: "ea-kruiden-proeven", titel: "Kruiden proeven & ruiken", leeftijdVan: 4, leeftijdTot: 8, seizoen: "zomer", duurMinuten: 45, prijs: 90 },
  { id: "ea-herfstoogst", titel: "Herfstoogst & pompoenen", leeftijdVan: 6, leeftijdTot: 10, seizoen: "herfst", duurMinuten: 60, prijs: 100 },
  { id: "ea-buitenlesdag", titel: "Buitenlesdag begeleiding", leeftijdVan: 4, leeftijdTot: 12, seizoen: "jaarrond", duurMinuten: 240, prijs: 250 },
] as const;

// Richtprijzen uit het aanbod: lesmap + beheerkalender vanaf 750 euro,
// openingsworkshop vanaf 250 euro per dagdeel, seizoensprogramma 850 tot
// 1100 euro per jaar. Bij het koppelen van activiteiten herberekent de app
// de totaalprijs als som van de gekozen activiteiten.
export const pakketten = [
  { id: "ep-lesmap", naam: "Lesmap + beheerkalender", totaalprijs: 750, activiteitIds: [] as string[] },
  { id: "ep-openingsworkshop", naam: "Openingsworkshop", totaalprijs: 250, activiteitIds: ["ea-modderkeuken", "ea-kruiden-proeven"] },
  { id: "ep-seizoensprogramma", naam: "Seizoensprogramma", totaalprijs: 850, activiteitIds: ["ea-zaaien-moestuin", "ea-waterdiertjes", "ea-herfstoogst", "ea-vogels-spotten"] },
] as const;
