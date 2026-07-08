# Fase 4b – Lesbibliotheek (uitbreiding op Fase 4 – Educatie)

> **Type:** uitbreiding op een reeds gebouwde fase. Niet-brekend. Nieuwe migratie: `0007_lesbibliotheek`.
> **Bronbestand voor de seed:** `lesbibliotheek-boulder-bloem.html` (het werkboek dat we samen bouwden). Geef dit bestand aan Claude Code mee als contentbron; de lesinhoud staat er 1-op-1 in en hoeft niet opnieuw geschreven te worden.
> **LET OP – em-dash-hook:** het werkboek-HTML gebruikt em-dashes (`-`, U+2014). De repo-hook blokkeert die bij elke file-write. Laat Claude Code bij het maken van het seed-bestand alle em-dashes vervangen door en-dashes (` – `) of een alternatief, anders faalt de write.

---

## 1. Doel

Elke `EducatieActiviteit` wordt van een losse regel (titel, leeftijd, prijs) een **volledige lesuitwerking**: draaiboek met tijden en voorbeeldzinnen, doelen voor school en BSO, voorbereiding, differentiatie, veiligheid, regen-plan-B en afronding – plus de **printbladen** (telkaarten, werkbladen, posters) die bij de les horen. Samen vormen de tien uitgewerkte activiteiten de **Lesbibliotheek**: een werkboek in De Kas waarin Lotte een les opzoekt, leest en als losse PDF print voor op het plein.

Dit is de lescontent die in Fase 4 als seed werd genoemd, nu volledig uitgewerkt.

## 2. Scope

**In scope:**
- Datamodel uitbreiden: rijke lesinhoud op `EducatieActiviteit` (JSONB) + een `Printblad`-tabel.
- Lesbibliotheek-overzicht (alle uitgewerkte lessen) en een leesbare lesdetailweergave.
- Eén losse les printen (alleen die les + haar printbladen, zonder app-navigatie).
- Seed: de tien lessen + twaalf printbladen uit het werkboek-HTML.

**Buiten scope:**
- Bewerken van printbladen via een rijke editor (voorlopig via seed/DB; velden-CRUD mag simpel).
- Koppeling les ↔ ontwerp of les ↔ subsidie (blijft zoals in de bestaande fasen).
- Meertaligheid, versiebeheer van lessen (het werkboek is "versie 1"; herzien = seed bijwerken).

## 3. Datamodelwijziging

### 3.1 Prisma

Voeg toe aan het bestaande model en maak één nieuw model:

```prisma
model EducatieActiviteit {
  // ... bestaande velden blijven ongewijzigd ...
  // titel, omschrijving, leeftijdVan, leeftijdTot, seizoen,
  // duurMinuten, doelen (blijft: korte samenvatting), benodigdheden, prijs, pakketten

  les         Json?        // rijke lesuitwerking (zie Zod hieronder); null = nog niet uitgewerkt
  printbladen Printblad[]
}

model Printblad {
  id           String @id @default(cuid())
  activiteitId String
  activiteit   EducatieActiviteit @relation(fields: [activiteitId], references: [id], onDelete: Cascade)
  titel        String
  soort        String   // "telkaart" | "werkblad" | "poster" | "protocol" | "bouwkaart" | ...
  volgorde     Int      @default(0)
  inhoud       Json     // { tag, blokken[] } (zie Zod hieronder)
  @@index([activiteitId])
}
```

**Waarom deze vorm** (consistent met ADR-0004): de lesuitwerking is semi-gestructureerd, verandert regelmatig en wordt nooit relationeel bevraagd → JSONB met Zod als contract. Printbladen zijn wél aparte entiteiten (je telt ze, ordent ze met `volgorde`, en print ze los) → een eigen tabel; hun eigen inhoud is weer semi-gestructureerd → JSONB. Zie ook ADR-0007 onderaan.

Het bestaande veld `doelen` blijft bestaan als optionele één-regel-samenvatting; de volledige school/BSO-framing komt in `les.doelenSchool` / `les.doelenBso`. Zo is de wijziging niet-brekend.

### 3.2 Zod-schema's

Plaats in `lib/validators/les.ts`:

```ts
import { z } from "zod";

export const LesSchema = z.object({
  kort: z.string(),                       // cursieve intro/tagline
  doelenSchool: z.string(),
  doelenBso: z.string(),
  voorbereiding: z.array(z.string()),     // checklist-items
  draaiboek: z.array(z.object({
    tijd: z.string(),                     // bv. "0-10"
    onderdeel: z.string(),                // korte titel
    instructie: z.string(),               // "zo doe je het"
    voorbeeldzin: z.string().optional(),  // wordt getoond als: Zeg bijvoorbeeld: "..."
  })),
  differentiatieJong: z.string(),
  differentiatieOud: z.string(),
  veiligheid: z.string(),
  regenBackup: z.string(),
  afronding: z.string(),
  variant: z.string().optional(),         // bv. moestuinles: verzorg-/oogstvariant
});
export type Les = z.infer<typeof LesSchema>;

// -- printbladen: kleine set bloktypes, met een html-escape-hatch --
const Cel = z.object({
  tekst: z.string().optional(),
  invul: z.boolean().optional(),          // toon een invul-lijn
  turf:  z.boolean().optional(),          // leeg turf-/schrijfvak
});
export const BlokSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("tekst"),     inhoud: z.string() }),  // {invul} in de tekst -> invul-lijn
  z.object({ type: z.literal("stappen"),   items: z.array(z.string()) }),   // genummerde lijst
  z.object({ type: z.literal("checklist"), items: z.array(z.string()) }),
  z.object({ type: z.literal("poster"),    regels: z.array(z.string()), slot: z.string().optional() }),
  z.object({ type: z.literal("tabel"),     koppen: z.array(z.string()),
             rijen: z.array(z.array(Cel)) }),
  z.object({ type: z.literal("kader"),     titel: z.string().optional(), inhoud: z.string() }),
  z.object({ type: z.literal("html"),      html: z.string() }),   // escape-hatch voor eigenzinnige vellen
]);
export const PrintbladInhoudSchema = z.object({
  tag: z.string(),                        // bv. "Printblad · 1 per duo"
  blokken: z.array(BlokSchema),
});
export type PrintbladInhoud = z.infer<typeof PrintbladInhoudSchema>;
```

**Rendering-conventies:** in een `tekst`-blok wordt het token `{invul}` een invul-lijn. In een `tabel`-cel geeft `turf:true` een leeg schrijfvak (met optioneel een grijze hint via `tekst`), en `invul:true` een invul-lijn. Het `html`-blok is bedoeld voor de paar vellen die te grillig zijn voor de blokken (bordjes, niveaukaarten); zie risico's.

### 3.3 Migratie

`npx prisma migrate dev --name lesbibliotheek` → committen als `0007_lesbibliotheek`. Voegt `les` (JSONB, nullable) toe aan `EducatieActiviteit` en maakt de tabel `Printblad`. Op Railway draait dit automatisch via de bestaande pre-deploy (`prisma migrate deploy`).

## 4. User stories & acceptatiecriteria

- **US-4b.1** – *Als Lotte wil ik per activiteit een volledige lesuitwerking vastleggen (kort, doelen school/BSO, voorbereiding, draaiboek met voorbeeldzinnen, differentiatie, veiligheid, plan B, afronding), zodat de activiteit een echte lesinstructie is.*
  - Een activiteit met `les != null` toont alle secties in vaste volgorde.
  - Draaiboekregels tonen tijd, onderdeel, instructie; een aanwezige `voorbeeldzin` verschijnt als *Zeg bijvoorbeeld: "…"*.
  - Ontbreekt `les`, dan toont de activiteit alleen de basisvelden (niet-brekend).

- **US-4b.2** – *Als Lotte wil ik bij een activiteit printbladen (telkaarten, werkbladen, posters) beheren in een vaste volgorde, zodat het lesmateriaal bij de les hoort.*
  - Printbladen worden getoond op `volgorde` oplopend.
  - Elk printblad rendert zijn blokken (tekst, stappen, checklist, poster, tabel, kader, html).
  - `turf`-cellen en `{invul}`-tokens renderen als schrijfvakken/lijnen.

- **US-4b.3** – *Als Lotte wil ik een lesbibliotheek-overzicht van alle uitgewerkte lessen zien (nummer, titel, leeftijd, seizoen, duur, prijs, aantal printbladen), zodat ik snel de juiste les vind.*
  - Overzicht toont alleen activiteiten met `les != null`.
  - Aantal printbladen per les klopt met de database.

- **US-4b.4** – *Als Lotte wil ik een lesdetailpagina die de hele werkinstructie leesbaar toont met de printbladen eronder.*
  - De pagina toont de les en daaronder alle printbladen als omkaderde vellen.

- **US-4b.5** – *Als Lotte wil ik één losse les printen – alleen die les plus haar printbladen, zonder zijbalk of app-navigatie – zodat ik een nette les-PDF voor op het plein krijg.*
  - Print bevat de lesinhoud + alle printbladen van die les, elk printblad op een eigen pagina.
  - Geen zijbalk, topbar of andere lessen in de print.

- **US-4b.6** *(optioneel, nice-to-have)* – *Als Lotte wil ik de lesbibliotheek koppelen aan een pakket, zodat de activiteiten in een EducatiePakket doorklikken naar hun lesuitwerking.*
  - Vanuit een pakketregel is de bijbehorende lesdetailpagina bereikbaar.

## 5. Schermen & routes

Herbruik het bestaande activiteit-concept (een les *is* een activiteit) om dubbeling te voorkomen:

- `/educatie/lesbibliotheek` – **overzicht**: tabel van alle activiteiten met `les != null` (nummer/volgorde, titel, leeftijd, seizoen, duur, prijs, aantal printbladen). Rij → lesdetail.
- `/educatie/activiteiten/[id]` – **lesdetail**: bestaande activiteit-detailpagina uitbreiden zodat, als er een `les` is, de volledige werkinstructie + printbladen tonen. Knop "Print deze les".
- `/educatie/activiteiten/[id]/print` – **printweergave** (aanbevolen): minimale pagina zonder app-schil, print-geoptimaliseerde CSS, roept `window.print()` aan; elk printblad `break-before: page`.

Voeg in het bestaande Educatie-menu een ingang **Lesbibliotheek** toe (naast Activiteiten en Pakketten). In het prototype staat dit als tweede tab in het Educatie-scherm; sub-routes zoals hierboven zijn in de echte app robuuster dan tab-state.

## 6. Print (losse les als PDF)

Twee werkende aanpakken; **aanbevolen = A** (robuuster in Next dan body-class-toggling):

**A. Dedicated printroute.** `/educatie/activiteiten/[id]/print` rendert alleen de les + printbladen met een eigen print-stylesheet en triggert `window.print()` na mount. Voordeel: geen risico dat app-chrome meelekt, en de URL is deelbaar/herbruikbaar.

**B. Print-CSS + client-toggle** (zoals in het prototype): een knop zet een klasse op `body`, en `@media print` verbergt alles behalve de gekozen les:
```css
@media print {
  body.print-een *{ visibility:hidden }
  body.print-een .les.print-doel, body.print-een .les.print-doel *{ visibility:visible }
  body.print-een .les.print-doel{ position:absolute; left:0; top:0; width:100% }
  .vel{ page-break-before:always }
}
```

**Acceptatie (beide):** print toont uitsluitend de les + haar printbladen, elk printblad op een eigen pagina, geen navigatie.

## 7. Seed-data

### 7.1 Veldmapping – van werkboek-HTML naar seed

Elke `<section class="les" id="les-N">` in `lesbibliotheek-boulder-bloem.html` wordt één `EducatieActiviteit` met een `les`-object en 1–2 `Printblad`-records. Mapping:

| In de HTML | Wordt in de seed |
|---|---|
| `.kort` | `les.kort` |
| eerste `.doel-kaart` ("School") | `les.doelenSchool` |
| tweede `.doel-kaart` ("BSO / opvang") | `les.doelenBso` |
| "Voorbereiding" → `.checklist li` | `les.voorbereiding[]` |
| "Draaiboek" → `.draaiboek` rij: kolom 1 / 2 / 3 | `draaiboek[].tijd` / `.onderdeel` / `.instructie` |
| `.zeg`-span binnen een draaiboekrij | `draaiboek[].voorbeeldzin` (zónder de prefix "Zeg bijvoorbeeld: ") |
| "Differentiatie" → `.duo` blok 1 / blok 2 | `les.differentiatieJong` / `les.differentiatieOud` |
| "Veiligheid" → `.veilig` | `les.veiligheid` |
| "Bij regen" → `.regen` | `les.regenBackup` |
| "Afronding & mee terug" | `les.afronding` |
| `.kader` (varianten, bv. les 3) | `les.variant` |
| elke `.vel` | één `Printblad`: `.vel-kop h4` → `titel`; `.vel-kop .tag` → `inhoud.tag`; binnenblokken (`table`, `ol`, `.poster-regel`, `.groot`-checklist, `.niveau`, `.kader`) → `inhoud.blokken[]`. Leid `soort` af uit de titel; zet `volgorde` op de leesvolgorde. |

**Aantal printbladen (ter controle, totaal 12):** les 1–8 elk 1, les 9 heeft 2 (telprotocol + verzamelblad), les 10 heeft 2 (klimmersregels-poster + parcourskaarten).

**Overige activiteitvelden** (leeftijdVan/Tot, seizoen, duurMinuten, prijs) staan in de `.chips` bovenaan elke les en in het bestaande `docs/seed-data/educatie-activiteiten.md`.

### 7.2 Volledig voorbeeld – "De grote soortentelling" (les 9)

Dit is de vlaggenschiples; gebruik hem als sjabloon voor de andere negen. (En-dashes gebruikt i.v.m. de hook.)

```ts
// prisma/seed-data/educatie/les-09-soortentelling.ts
export const soortentelling = {
  titel: "De grote soortentelling",
  leeftijdVan: 6, leeftijdTot: 12, seizoen: "mei-jun", duurMinuten: 90, prijs: 120,
  doelen: "Systematisch waarnemen, turven en vergelijken over jaren – data verzameld door de kinderen zelf.",
  les: {
    kort: "Het meetmoment van het jaar – en de les waarmee de school haar subsidieverantwoording letterlijk zelf verzamelt. Kinderen tellen als echte veldbiologen volgens een vast protocol, zodat de cijfers eerlijk te vergelijken zijn met vorig jaar. De totalen gaan in De Kas en worden de groeigrafiek van het plein.",
    doelenSchool: "Natuur & techniek + rekenen: systematisch waarnemen, turven, totalen en vergelijken over jaren (data-geletterdheid in het echt).",
    doelenBso: "Sociale competentie: samen een serieuze taak volbrengen; trots – 'wij bewijzen dat ons plein leeft'.",
    voorbereiding: [
      "Telprotocol en verzamelblad geprint; per team een telkaart van les 1, klembord en potlood",
      "De 4 vaste telpunten gecheckt – dezelfde plekken als vorig jaar (staan in het beheerplan / in De Kas); paaltje of foto per punt",
      "Zoekkaarten insecten en planten mee; loeppotjes; stopwatch of telefoon voor de 10-minutenblokken",
      "Datum gekozen: droog, >15 graden, tussen 10 en 14 uur – zelfde soort omstandigheden als vorig jaar",
      "De cijfers van vorig jaar opgezocht (nulmeting/jaartelling in De Kas) – nog niet verklappen!",
    ],
    draaiboek: [
      { tijd: "0-10", onderdeel: "Kring: de eerlijke-data-les",
        instructie: "Leg uit waarom onderzoekers saai-precies zijn.",
        voorbeeldzin: "Als we dit jaar op een zonnige dag tellen en volgend jaar in de regen, wie wint er dan – het plein of het weer? Daarom tellen we elk jaar op dezelfde plekken, op dezelfde manier, even lang. Alleen dan zie je of het plein echt groeit." },
      { tijd: "10-20", onderdeel: "Teams & protocol",
        instructie: "Verdeel in 4 telteams; elk team krijgt het protocol, een telkaart en een soortgroep-focus (insecten op bloemen, kruipers op/onder hout, planten in bloei, vogels). Loop het protocol stap voor stap door." },
      { tijd: "20-70", onderdeel: "De telling: 4 x 10 minuten",
        instructie: "Alle teams tellen tegelijk, elk op een eigen telpunt; na 10 minuten (stopwatch!) schuiven ze door. De begeleider bewaakt de tijd en helpt determineren, maar telt niet mee – de data zijn van de kinderen.",
        voorbeeldzin: "Weet je de naam niet? Beschrijf hem dan zo goed dat we hem thuis kunnen opzoeken – 'oranje vlinder met zwarte stippen' is ook een waarneming." },
      { tijd: "70-85", onderdeel: "Verzamelblad invullen",
        instructie: "Terug in de kring: elk team leest zijn turven voor, een kind is de boekhouder en vult het verzamelblad in. Tel samen de totalen: hoeveel soorten in elke groep?" },
      { tijd: "85-90", onderdeel: "De onthulling",
        instructie: "Nu pas: vergelijk met vorig jaar.",
        voorbeeldzin: "Vorig jaar telden jullie voorgangers 12 soorten insecten. En dit jaar? Zeventien! Dat betekent: jullie plein wordt elk jaar meer een thuis." },
    ],
    differentiatieJong: "6-8 jaar: tellen in soortgroepen ('iets met vleugels', 'een bloem die open is'); een ouder kind of begeleider schrijft.",
    differentiatieOud: "9-12 jaar: op soortnaam met de zoekkaart; laat de boekhouders zelf het staafdiagram van de jaren tekenen.",
    veiligheid: "Zelfde afspraken als de insectenexpeditie: kijken met het loeppotje, niet pakken met blote handen bij bijen en wespen. Telpunt bij het water? Dan gelden de poelregels van les 7 (gehurkt, armlengte afstand, begeleider erbij).",
    regenBackup: "Verzetten – een telling in de regen is geen eerlijke vergelijking (dat is precies de les!). Prik meteen een nieuwe datum binnen twee weken.",
    afronding: "Het ingevulde verzamelblad gaat mee voor invoer in De Kas (meting: jaartelling); de klas krijgt de bijgewerkte groeigrafiek terug als poster. Meteen het bewijsstuk voor de subsidieverantwoording – gemeten door de kinderen zelf.",
  },
  printbladen: [
    {
      titel: "Telprotocol – zo tellen wij eerlijk", soort: "protocol", volgorde: 1,
      inhoud: {
        tag: "Printblad 1/2 · 1 per telteam",
        blokken: [
          { type: "tekst", inhoud: "Datum: {invul}  Tijd: {invul}  Weer: (zon / half bewolkt / bewolkt)  Temperatuur: {invul} graden. Telteam: {invul}  Onze soortgroep: {invul}" },
          { type: "stappen", items: [
            "We tellen op de 4 vaste telpunten – elk jaar precies dezelfde.",
            "Op elk punt tellen we precies 10 minuten (stopwatch aan!).",
            "We blijven binnen het telpunt – niet achter een vlinder aan het hele plein over.",
            "Elke soort telt een keer per telpunt, ook als je er tien ziet: turf het aantal erbij.",
            "Naam niet zeker? Beschrijf het beestje of de plant zo precies mogelijk.",
            "Na het rondje: alles overnemen op het verzamelblad.",
          ]},
          { type: "tabel",
            koppen: ["Telpunt", "Vaste plek (omschrijf zo dat het volgend jaar terug te vinden is)", "Geteld"],
            rijen: [
              [{ tekst: "1" }, { turf: true, tekst: "bijv. bloemenweide, hoek bij het hek" }, { turf: true }],
              [{ tekst: "2" }, { turf: true, tekst: "bijv. takkenril + stapelmuur" },        { turf: true }],
              [{ tekst: "3" }, { turf: true, tekst: "bijv. wilgentunnel + kruidenrand" },     { turf: true }],
              [{ tekst: "4" }, { turf: true, tekst: "bijv. poel / waterzone (poelregels!)" }, { turf: true }],
            ]},
        ],
      },
    },
    {
      titel: "Verzamelblad soortentelling", soort: "werkblad", volgorde: 2,
      inhoud: {
        tag: "Printblad 2/2 · 1 per klas – dit blad gaat in De Kas",
        blokken: [
          { type: "tekst", inhoud: "School/locatie: {invul}  Groep: {invul}  Datum: {invul}  Telling nr: {invul}" },
          { type: "tabel",
            koppen: ["Telpunt", "Soortgroep", "Soort – of zo goed mogelijke omschrijving", "Aantal"],
            rijen: Array.from({ length: 12 }, () => [{ turf: true }, { turf: true }, { turf: true }, { turf: true }]) },
          { type: "tekst", inhoud: "Totalen – aantal verschillende soorten. Insecten & kleine beestjes: {invul}   Planten in bloei: {invul}   Vogels: {invul}" },
          { type: "tekst", inhoud: "Bijzonderste waarneming van dit jaar: {invul}. Ingevoerd in De Kas op: {invul} door: {invul}" },
        ],
      },
    },
  ],
} as const;
```

### 7.3 De overige negen lessen

Volg exact dezelfde vorm, met de inhoud uit `lesbibliotheek-boulder-bloem.html` (mapping in 7.1). Volgorde en nummer-kleuren staan in de inhoudsopgave van dat bestand:

1. Insectenexpeditie met de loep (apr-sep, 60 min, EUR 95) – 1 printblad (telkaart insecten)
2. Wilgen knotten & vlechten (nov-feb, 120 min, EUR 165) – 1 printblad (veiligheidskaart + rouleerschema)
3. Van zaadje tot soep – moestuinles (mrt-okt, 90 min, EUR 120) – 1 printblad (zaaiplan + waterschema); heeft een `variant`
4. Hooidag: de bloemenweide maaien (aug-sep, 90 min, EUR 120) – 1 printblad (taakkaart + bordje)
5. Bouw een insectenhotel (sep-okt, 120 min, EUR 165) – 1 printblad (bouwkaart)
6. Wintervogels: voeren & tellen (dec-feb, 60 min, EUR 95) – 1 printblad (telposter)
7. Waterdiertjes scheppen (apr-sep, 75 min, EUR 120) – 1 printblad (determineerkaart)
8. Zaadbommen & de weide inzaaien (mrt-apr, 60 min, EUR 95) – 1 printblad (receptkaart)
9. De grote soortentelling (mei-jun, 90 min, EUR 120) – 2 printbladen *(voorbeeld hierboven)*
10. Leren vallen en opstaan (hele jaar, 60 min, EUR 95) – 2 printbladen (klimmersregels-poster + parcourskaarten); de poster is een `poster`-blok, de niveaukaarten mogen `kader`- of `html`-blokken zijn

**Seed idempotent maken** (conform het bestaande seed-patroon): eerst `printbladen` en de betreffende `EducatieActiviteit`-records verwijderen/upserten, dan opnieuw invoeren, zodat `npx prisma db seed` herhaalbaar blijft.

## 8. Definition of Done

- [ ] Migratie `0007_lesbibliotheek` toegevoegd; `les` (JSONB) op `EducatieActiviteit` en tabel `Printblad` bestaan; draait automatisch bij Railway-deploy.
- [ ] `LesSchema` en `PrintbladInhoudSchema` valideren de seed en de invoer aan de rand.
- [ ] `/educatie/lesbibliotheek` toont de tien lessen met leeftijd, seizoen, duur, prijs en aantal printbladen.
- [ ] Lesdetail toont alle secties in vaste volgorde; voorbeeldzinnen verschijnen als *Zeg bijvoorbeeld: "…"*; printbladen renderen met turf-vakken en invul-lijnen.
- [ ] "Print deze les" levert een schone PDF: alleen die les + haar printbladen, elk printblad op een eigen pagina, zonder app-navigatie.
- [ ] Seed geladen: 10 activiteiten met `les`, 12 printbladen in totaal; aantallen kloppen met 7.3.
- [ ] Geen em-dashes in de nieuwe bestanden (hook draait schoon).
- [ ] Fase-4-DoD aangevuld: "Lesbibliotheek: 10 uitgewerkte lessen + 12 printbladen als lescontent bij de activiteiten."

## 9. Testplan

- **Unit:** `LesSchema` accepteert het volledige voorbeeld en weigert een draaiboekregel zonder `tijd`. `PrintbladInhoudSchema` accepteert alle bloktypes; een `tabel`-rij met verkeerde celvorm faalt.
- **Seed-test:** `db seed` twee keer draaien geeft geen duplicaten (idempotent); tel `Printblad`-records = 12.
- **Handmatig:** overzicht → lesdetail (soortentelling) → controleer draaiboek + beide printbladen → "Print deze les" → PDF bevat alleen deze les, verzamelblad op een eigen pagina, geen zijbalk.
- **Rendering:** `{invul}` in een tekstblok en `turf:true` in een cel renderen als schrijfruimte; een `poster`-blok toont grote regels.

## 10. Risico's & aandachtspunten

- **Em-dash-hook (belangrijkste valkuil):** het bron-HTML zit vol em-dashes. Converteer ze in het seed-bestand naar en-dashes/alternatieven, anders blokkeert de write. Doe dit ook in eventuele copy-paste uit het werkboek.
- **`html`-blok en XSS:** het `html`-blok rendert onbewerkte HTML (`dangerouslySetInnerHTML`). Acceptabel omdat De Kas één gebruiker heeft en alle content door Lotte zelf is geschreven; gebruik het spaarzaam (alleen voor de grillige vellen zoals bordjes/niveaukaarten) en houd de gewone lessen op de gestructureerde blokken.
- **Print-CSS verschilt per browser:** test de printweergave in minstens Chrome en Firefox; forceer paginabreuk per printblad met `break-before: page` en zet een redelijke marge.
- **Grote seed:** tien volledige lessen is veel tekst. Splits per les in een eigen bestand onder `prisma/seed-data/educatie/` en importeer ze in het seed-script; dat houdt het leesbaar en review-baar.
- **`doelen` vs `les.doelenSchool/Bso`:** laat het oude `doelen`-veld staan als korte samenvatting; de rijke doelen leven in `les`. Niet migreren/hernoemen (voorkomt breuk).

---

## ADR-0007 – Lescontent als JSONB + printbladen als blokmodel

**Status:** Voorgesteld · **Datum:** 2026-07-08

**Context.** Fase 4 leverde eenvoudige educatieactiviteiten. De lesbibliotheek voegt rijke, semi-gestructureerde lesuitwerkingen en gevarieerde printbladen (tabellen, posters, checklists) toe die per les sterk verschillen en regelmatig zullen wijzigen.

**Beslissing.** De lesuitwerking komt als één `les`-JSONB op `EducatieActiviteit` (Zod als contract), consistent met ADR-0004. Printbladen krijgen een eigen tabel `Printblad` (want telbaar, ordenbaar, los printbaar); hun inhoud is een kleine, gevalideerde **blokkenset** (`tekst`, `stappen`, `checklist`, `poster`, `tabel`, `kader`) met een `html`-escape-hatch voor uitzonderingen.

**Alternatieven.**
- *Alles als losse kolommen op EducatieActiviteit* – veel migratie-oppervlak, star bij nieuwe secties.
- *Printbladen ook in JSONB op de activiteit* – verliest `volgorde`/telbaarheid en de losse print-actie.
- *Printblad-inhoud als vrije HTML-blob* – snelst, maar minder onderhoudbaar en review-baar; nu beperkt tot het `html`-blok.

**Gevolgen.** (+) Consistent met bestaande JSONB-keuzes, snelle iteratie, leesbare seed per les. (+) Printbladen blijven eersteklas objecten. (−) Geen DB-constraints op de JSON → Zod-validatie verplicht. (−) Het `html`-blok vraagt bewuste, spaarzame inzet vanwege `dangerouslySetInnerHTML` (aanvaardbaar bij één, vertrouwde gebruiker).
