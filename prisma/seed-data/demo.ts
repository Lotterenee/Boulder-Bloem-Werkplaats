// Demo-data voor dev/preview: nepklanten en projecten zodat elk scherm gevuld
// is. Draait alleen als SEED_DATA de demo-data toelaat EN SEED_DEMO niet op
// "false" staat; productie (SEED_DATA=false) krijgt dit dus nooit.
// Alle id's zijn vast (idempotent); child-records worden per project vervangen.

// Datums relatief t.o.v. een vaste peildatum, zodat de seed reproduceerbaar is
// maar het dashboard (deadlines, volgende acties) er levendig uitziet.
const PEIL = new Date("2026-07-08T00:00:00Z");
function dagen(n: number): Date {
  return new Date(PEIL.getTime() + n * 24 * 60 * 60 * 1000);
}

export const demoKlanten = [
  {
    id: "demo-klant-regenboog",
    organisatie: "OBS De Regenboog",
    type: "school",
    contactpersoon: "Anke de Vries",
    email: "a.devries@obsderegenboog.nl",
    telefoon: "030 555 12 34",
    adres: "Schoolstraat 12",
    plaats: "Utrecht",
    gemeente: "Utrecht",
    notities: "Enthousiast team, wil groen plein met moestuin en waterspeelplek.",
  },
  {
    id: "demo-klant-boshoeve",
    organisatie: "BSO De Boshoeve",
    type: "bso",
    contactpersoon: "Youssef El Amrani",
    email: "youssef@bsodeboshoeve.nl",
    telefoon: "038 444 88 21",
    adres: "Boslaan 3",
    plaats: "Zwolle",
    gemeente: "Zwolle",
    notities: "Naschoolse opvang, nadruk op natuurlijk spelen zonder toestellen.",
  },
  {
    id: "demo-klant-gemeente-tilburg",
    organisatie: "Gemeente Tilburg, team Openbare Ruimte",
    type: "gemeente",
    contactpersoon: "Mirjam Bakker",
    email: "m.bakker@tilburg.nl",
    telefoon: "013 542 90 00",
    adres: "Stadhuisplein 130",
    plaats: "Tilburg",
    gemeente: "Tilburg",
    notities: "Wijkgroenproject; zoekt cofinanciering via provincie Noord-Brabant.",
  },
  {
    id: "demo-klant-familie-jansen",
    organisatie: "Familie Jansen",
    type: "particulier",
    contactpersoon: "Peter en Lisa Jansen",
    email: "jansen.tuin@gmail.com",
    telefoon: "06 12 34 56 78",
    adres: "Beukenhof 8",
    plaats: "Amersfoort",
    gemeente: "Amersfoort",
    notities: "Grote achtertuin, wil natuurlijke speelaanleidingen voor 3 kinderen.",
  },
  {
    id: "demo-klant-zonnebloem",
    organisatie: "KDV De Zonnebloem",
    type: "bso",
    contactpersoon: "Sandra Willemsen",
    email: "s.willemsen@kdvzonnebloem.nl",
    telefoon: "026 333 11 22",
    adres: "Tulpstraat 45",
    plaats: "Arnhem",
    gemeente: "Arnhem",
    notities: "Kinderdagverblijf, oplevering vorig jaar; jaarlijkse biodiversiteitstelling loopt.",
  },
] as const;

export const demoProjecten = [
  {
    id: "demo-proj-regenboog",
    klantId: "demo-klant-regenboog",
    naam: "Groen schoolplein De Regenboog",
    fase: "definitief_ontwerp",
    status: "actief",
    locatieadres: "Schoolstraat 12, Utrecht",
    oppervlakteM2: 850,
    budgetIndicatie: 45000,
    volgendeActie: "Offerte bespreken met MR",
    volgendeActieDatum: dagen(5),
    samenvatting:
      "Volledige herinrichting van het schoolplein: moestuin, waterpomp, klimheuvel en veel inheemse beplanting. Subsidieaanvraag bij provincie Utrecht loopt.",
  },
  {
    id: "demo-proj-boshoeve",
    klantId: "demo-klant-boshoeve",
    naam: "Natuurlijk ontdekterrein Boshoeve",
    fase: "samen_ontwerpen",
    status: "actief",
    locatieadres: "Boslaan 3, Zwolle",
    oppervlakteM2: 320,
    budgetIndicatie: 18000,
    volgendeActie: "Wensen kinderen ophalen tijdens schouw",
    volgendeActieDatum: dagen(-2),
    samenvatting:
      "Compact BSO-terrein zonder keuringsplichtige toestellen; hutten, stapstammen en een wilgentunnel.",
  },
  {
    id: "demo-proj-tilburg",
    klantId: "demo-klant-gemeente-tilburg",
    naam: "Wijkgroen Reeshof speelbos",
    fase: "kennismaking",
    status: "actief",
    locatieadres: "Reeshof, Tilburg",
    oppervlakteM2: 1500,
    budgetIndicatie: 90000,
    volgendeActie: "Intakegesprek plannen",
    volgendeActieDatum: dagen(12),
    samenvatting:
      "Groot wijkgroenproject; gemeente zoekt cofinanciering. Nog in oriëntatiefase.",
  },
  {
    id: "demo-proj-jansen",
    klantId: "demo-klant-familie-jansen",
    naam: "Natuurtuin familie Jansen",
    fase: "aanleg",
    status: "actief",
    locatieadres: "Beukenhof 8, Amersfoort",
    oppervlakteM2: 240,
    budgetIndicatie: 12000,
    volgendeActie: "Beplanting leveren en aanplanten",
    volgendeActieDatum: dagen(3),
    samenvatting:
      "Particuliere tuin, speelaanleidingen vallen buiten WAS. Aanleg gestart.",
  },
  {
    id: "demo-proj-zonnebloem",
    klantId: "demo-klant-zonnebloem",
    naam: "Groene buitenruimte De Zonnebloem",
    fase: "oplevering_beheer",
    status: "actief",
    locatieadres: "Tulpstraat 45, Arnhem",
    oppervlakteM2: 410,
    budgetIndicatie: 22000,
    volgendeActie: "Jaartelling biodiversiteit uitvoeren",
    volgendeActieDatum: dagen(20),
    samenvatting:
      "Opgeleverd vorig jaar; nu beheerfase met jaarlijkse biodiversiteitstelling en onderhoudsagenda.",
  },
  {
    id: "demo-proj-oud",
    klantId: "demo-klant-regenboog",
    naam: "Tijdelijke moestuinbakken (pilot)",
    fase: "oplevering_beheer",
    status: "afgerond",
    locatieadres: "Schoolstraat 12, Utrecht",
    oppervlakteM2: 40,
    budgetIndicatie: 2500,
    volgendeActie: null,
    volgendeActieDatum: null,
    samenvatting: "Kleine pilot met moestuinbakken, afgerond en geëvalueerd.",
  },
] as const;

// Wensen per project (bron + prioriteit).
export const demoWensen = [
  { projectId: "demo-proj-regenboog", bron: "kinderen", tekst: "Een waterpomp waarmee we kunnen modderen", prioriteit: "moet", verwerkt: true },
  { projectId: "demo-proj-regenboog", bron: "team", tekst: "Buitenlokaal / zitplek voor een hele klas", prioriteit: "graag", verwerkt: false },
  { projectId: "demo-proj-regenboog", bron: "ouders", tekst: "Genoeg schaduw voor warme dagen", prioriteit: "graag", verwerkt: false },
  { projectId: "demo-proj-boshoeve", bron: "kinderen", tekst: "Een hut om je in te verstoppen", prioriteit: "moet", verwerkt: false },
  { projectId: "demo-proj-boshoeve", bron: "schouw", tekst: "Natte plek weghalen bij de ingang", prioriteit: "misschien", verwerkt: false },
  { projectId: "demo-proj-jansen", bron: "opdrachtgever", tekst: "Klimboom of boomstammen", prioriteit: "moet", verwerkt: true },
] as const;

// Taken (deels project-gebonden, deels los; sommige verlopen voor het dashboard).
export const demoTaken = [
  { id: "demo-taak-1", projectId: "demo-proj-regenboog", titel: "Offerte definitief maken", categorie: "offerte", deadline: dagen(4), afgerond: false },
  { id: "demo-taak-2", projectId: "demo-proj-regenboog", titel: "Subsidieaanvraag Utrecht indienen", categorie: "subsidie", deadline: dagen(-3), afgerond: false },
  { id: "demo-taak-3", projectId: "demo-proj-boshoeve", titel: "Schetsontwerp uitwerken", categorie: "algemeen", deadline: dagen(9), afgerond: false },
  { id: "demo-taak-4", projectId: "demo-proj-jansen", titel: "Beplanting bestellen bij kwekerij", categorie: "algemeen", deadline: dagen(1), afgerond: false },
  { id: "demo-taak-5", projectId: "demo-proj-zonnebloem", titel: "Wilgen knotten (winterbeurt)", categorie: "beheer", deadline: dagen(150), afgerond: false },
  { id: "demo-taak-6", projectId: null, titel: "Nieuwsbrief scholen versturen", categorie: "acquisitie", deadline: dagen(7), afgerond: false },
  { id: "demo-taak-7", projectId: "demo-proj-regenboog", titel: "Locatiefoto's maken", categorie: "algemeen", deadline: dagen(-10), afgerond: true },
] as const;

// Subsidieaanvragen gekoppeld aan geseede regelingen.
export const demoAanvragen = [
  { id: "demo-aanvraag-1", projectId: "demo-proj-regenboog", subsidieId: "sub-utrecht-vouchers", status: "in_voorbereiding", bedragAangevraagd: 15000, bedragToegekend: null, deadline: dagen(6), notities: "Vouchers groene schoolpleinen; budget 2026 mogelijk vol, checken." },
  { id: "demo-aanvraag-2", projectId: "demo-proj-regenboog", subsidieId: "sub-jantje-beton", status: "kansrijk", bedragAangevraagd: 10000, bedragToegekend: null, deadline: null, notities: "Gemeente Utrecht legt gelijk bedrag bij." },
  { id: "demo-aanvraag-3", projectId: "demo-proj-tilburg", subsidieId: "sub-brabant-schoolplein-toekomst", status: "scan", bedragAangevraagd: null, bedragToegekend: null, deadline: dagen(40), notities: "Cofinanciering Noord-Brabant, nog beoordelen." },
  { id: "demo-aanvraag-4", projectId: "demo-proj-zonnebloem", subsidieId: "sub-postcodeloterij-buurtfonds", status: "toegekend", bedragAangevraagd: 5000, bedragToegekend: 4200, deadline: null, notities: "Toegekend; verantwoording volgt na de jaartelling." },
] as const;

// Ontwerp met canvas-JSON (verwijst naar geseede element-id's).
export const demoOntwerp = {
  id: "demo-ontwerp-regenboog",
  projectId: "demo-proj-regenboog",
  naam: "Schetsontwerp De Regenboog",
  versie: 2,
  canvas: {
    terrein: { breedteM: 30, diepteM: 22 },
    raster: 1 as const,
    elementen: [
      { id: "c-1", elementId: "el-klimtoestel", x: 7, y: 6, rotatie: 0, schaal: 1 },
      { id: "c-2", elementId: "el-zandbak", x: 15, y: 5, rotatie: 0, schaal: 1 },
      { id: "c-3", elementId: "el-waterpomp", x: 20, y: 6, rotatie: 0, schaal: 1 },
      { id: "c-4", elementId: "el-speelheuvel", x: 8, y: 15, rotatie: 0, schaal: 1 },
      { id: "c-5", elementId: "el-wilgentunnel", x: 16, y: 17, rotatie: 90, schaal: 1 },
      { id: "c-6", elementId: "el-moestuinbak", x: 25, y: 15, rotatie: 0, schaal: 1 },
      { id: "c-7", elementId: "el-moestuinbak", x: 25, y: 18, rotatie: 0, schaal: 1 },
      { id: "c-8", elementId: "el-vlindertuin", x: 4, y: 20, rotatie: 0, schaal: 1 },
    ],
    // Beplanting op het canvas (Fase 3b): gespreide soorten voor een
    // doorlopende bloeiboog en zichtbare seizoensweergave in dev.
    beplanting: [
      { id: "cb-1", plantId: "pl-hazelaar", x: 3, y: 3 },
      { id: "cb-2", plantId: "pl-boerenkrokus", x: 5, y: 3 },
      { id: "cb-3", plantId: "pl-sleedoorn", x: 11, y: 3 },
      { id: "cb-4", plantId: "pl-pinksterbloem", x: 13, y: 3 },
      { id: "cb-5", plantId: "pl-slangenkruid", x: 22, y: 10 },
      { id: "cb-6", plantId: "pl-knoopkruid", x: 23, y: 11 },
      { id: "cb-7", plantId: "pl-wilde-marjolein", x: 24, y: 12 },
      { id: "cb-8", plantId: "pl-beemdkroon", x: 22, y: 12 },
      { id: "cb-9", plantId: "pl-struikhei", x: 6, y: 19 },
      { id: "cb-10", plantId: "pl-klimop", x: 2, y: 12 },
      { id: "cb-11", plantId: "pl-grote-kattenstaart", x: 20, y: 9 },
    ],
  },
  // Beplanting koppelen (voedt inheems-percentage in de DB-lijst).
  planten: [
    { plantId: "pl-sleedoorn", aantal: 8 },
    { plantId: "pl-meidoorn", aantal: 6 },
    { plantId: "pl-wilde-marjolein", aantal: 20 },
    { plantId: "pl-hazelaar", aantal: 4 },
  ],
} as const;

// Offerte met regels (JSONB) en vaste rolafbakeningstekst wordt in de seed
// zelf uit lib/domain gehaald; hier alleen de regels + totalen-basis.
export const demoOfferte = {
  id: "demo-offerte-regenboog",
  projectId: "demo-proj-regenboog",
  offertenummer: "OFF-2026-001",
  status: "verzonden",
  regels: [
    { omschrijving: "Klimtoestel (gecertificeerd)", aantal: 1, stuksprijs: 4500, btwPct: 21 },
    { omschrijving: "Zandbak met rand", aantal: 1, stuksprijs: 600, btwPct: 21 },
    { omschrijving: "Waterpomp met geul", aantal: 1, stuksprijs: 900, btwPct: 21 },
    { omschrijving: "Speelheuvel met tunnel", aantal: 1, stuksprijs: 1500, btwPct: 21 },
    { omschrijving: "Moestuinbak (hoog)", aantal: 2, stuksprijs: 250, btwPct: 21 },
    { omschrijving: "Inheemse beplanting (pakket)", aantal: 1, stuksprijs: 1800, btwPct: 21 },
    { omschrijving: "Aanleg en grondwerk", aantal: 1, stuksprijs: 6500, btwPct: 21 },
  ],
} as const;

// Metingen: een nulmeting en een jaartelling, zodat de grafiek een trend toont.
export const demoMetingen = [
  {
    id: "demo-meting-nul",
    projectId: "demo-proj-zonnebloem",
    datum: new Date("2025-06-10T00:00:00Z"),
    type: "nulmeting",
    waarnemingen: [
      { soortgroep: "Vogels", aantal: 4 },
      { soortgroep: "Vlinders", aantal: 3 },
      { soortgroep: "Bijen & hommels", aantal: 5 },
      { soortgroep: "Plantensoorten", aantal: 12 },
    ],
    notities: "Nulmeting kort na oplevering.",
  },
  {
    id: "demo-meting-jaar1",
    projectId: "demo-proj-zonnebloem",
    datum: new Date("2026-06-12T00:00:00Z"),
    type: "jaartelling",
    waarnemingen: [
      { soortgroep: "Vogels", aantal: 7 },
      { soortgroep: "Vlinders", aantal: 6 },
      { soortgroep: "Bijen & hommels", aantal: 11 },
      { soortgroep: "Plantensoorten", aantal: 18 },
    ],
    notities: "Eerste jaartelling; duidelijke toename door de kinderen geteld.",
  },
] as const;

// Educatiepakket gekoppeld aan een demo-project.
export const demoPakketKoppeling = {
  pakketId: "ep-seizoensprogramma",
  projectId: "demo-proj-zonnebloem",
} as const;
