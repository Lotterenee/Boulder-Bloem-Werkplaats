# Fase 3b & 3c – Seizoensbloei, canvas-UX, zone-sjablonen & plantpakketten (uitbreiding op Fase 3 – Ontwerpstudio)

> **Type:** uitbreiding op de reeds gebouwde ontwerpstudio (Fase 3). Niet-brekend. Nieuwe migraties: `0008_seizoensbloei` en `0009_zones_pakketten`.
> **Visuele referentie:** `de-kas-studio-v3.html` (klikbaar prototype). Geef dit bestand aan Claude Code mee: het toont de gewenste UI-plaatsing, kleurregels en interacties 1-op-1. De 3D-preview die eerder in dit prototype zat is bewust geschrapt en komt NIET in scope.
> **Ontwerphulp blijft en wordt slimmer:** de bestaande Ontwerphulp-wizard (leeftijden/wensen/budget naar startopzet) is een kernfeature en blijft bestaan. In fase 3c gaat de wizard de nieuwe zone-sjablonen en plantpakketten als bouwstenen gebruiken (zie US-3c.5).
> **LET OP – em-dash-hook:** gebruik in alle nieuwe bestanden en-dashes ( – ) of alternatieven; de repo-hook blokkeert em-dashes (U+2014) bij elke file-write.

---

## 1. Doel

De ontwerpstudio wordt seizoensbewust: Lotte ziet bij het plantenkiezen direct wanneer iets bloeit, kan met een seizoensschuif per maand zien hoe de plek erbij staat (bloei, groen, wintergroen, kaal), krijgt een bloeiboog-balk die gaten in het bloeiseizoen zichtbaar maakt, en kan kant-en-klare plantpakketten en zone-opstellingen in een keer plaatsen. De ontwerpcoach waarschuwt bij bloeigaten, ontbrekend wintergroen en giftige soorten nabij speelzones. Daarnaast krijgt het canvas de UX-basics die het dagelijkse werk versnellen: snappen, dupliceren en ongedaan maken/opnieuw.

## 2. Scope

**In scope (3b):**
- Datamodel: bloeivelden op `Plant` (bloeimaanden-masker, wintergroen, bloeikleur, drachtwaarden).
- Palet: bloeikalender-strip per plant, filter "bloeit in [maand]" (uitgrijzen, wel plaatsbaar) en filter "wintergroen".
- Seizoensschuif (jan t/m dec) + "Hele jaar"-stand boven het canvas; canvas herkleurt beplanting per maand.
- Bloeiboog-balk in de zijbalk (12 maanden, klikbaar, gat-markering).
- Coach-checks: bloeigat, wintergroen ontbreekt, giftige soorten, plus behoud van bestaande checks.
- Canvas-UX: snappen (0,5 m, uitschakelbaar), dupliceren (knop + Ctrl+D), undo/redo (indien nog niet aanwezig uit Fase 3: toevoegen; minimaal 20 stappen).

**In scope (3c):**
- Datamodel: `ZoneSjabloon` + `ZoneSjabloonRegel` (elementen EN planten in een sjabloon), `PlantPakket` + `PlantPakketRegel`.
- Palet-tabbladen "Zones" en "Pakketten": 5 vaste zone-opstellingen en 2 doorbloei-pakketten plaatsbaar als groep.
- "Bewaar selectie als eigen sjabloon" met thumbnail (Konva `stage.toDataURL`).
- Ontwerphulp-integratie: de wizard stelt startopzetten samen uit zone-sjablonen en voegt automatisch een passend plantpakket toe.
- Doorwerking: een geplaatst plantpakket is als regel op te nemen in de offerte (Fase 5-koppeling).

**Buiten scope:**
- 3D-weergave (bewust geschrapt; hooguit een latere, optionele fase).
- Automatische koppeling met externe planten-API's (seed-data zelf beheren en versioneren).
- Smart guides tussen elementen (uitlijnhulplijnen) zijn een nice-to-have; alleen bouwen als het binnen de tijd past, anders als los ticket parkeren.

## 3. Datamodelwijzigingen

### 3.1 Prisma – migratie `0008_seizoensbloei`

```prisma
model Plant {
  // ... bestaande velden blijven ongewijzigd (naamNL, inheems, giftig, bloeitijd als vrije tekst, enz.) ...

  bloeimaanden Int     @default(0)   // 12-bits masker, bit 0 = januari ... bit 11 = december
  wintergroen  Boolean @default(false)
  bloeikleur   String?               // hex, voor canvas- en paletkleuring
  drachtNectar Int     @default(0)   // 0 t/m 5 (imker-schaal)
  drachtPollen Int     @default(0)   // 0 t/m 5
  hoogteM      Decimal? @db.Decimal(4,2) // indicatieve hoogte in meters (paletinfo)
  diameterM    Decimal? @db.Decimal(4,2) // indicatieve kroon-/poldiameter (canvasweergave)
}
```

Het bestaande vrije-tekstveld `bloeitijd` blijft staan (leesbaar in de bibliotheek); `bloeimaanden` is de rekenbron. Een masker in plaats van van/tot-velden, omdat soorten als klimop meerdere of late blokken hebben en de berekening (bit-AND per maand) triviaal wordt.

### 3.2 Prisma – migratie `0009_zones_pakketten`

```prisma
enum SjabloonRegelSoort { element plant }

model ZoneSjabloon {
  id         String              @id @default(cuid())
  naam       String
  categorie  String              // klim, water, moestuin, rust, bloemenweide, eigen
  eigen      Boolean             @default(false)
  thumbnail  String?             // data-URL van canvas-snapshot
  regels     ZoneSjabloonRegel[]
  createdAt  DateTime            @default(now())
}

model ZoneSjabloonRegel {
  id         String             @id @default(cuid())
  sjabloonId String
  sjabloon   ZoneSjabloon       @relation(fields: [sjabloonId], references: [id], onDelete: Cascade)
  soort      SjabloonRegelSoort
  refId      String             // Element.id of Plant.id, afhankelijk van soort
  relXM      Decimal            @db.Decimal(6,2) // relatieve positie t.o.v. groepsanker, meters
  relYM      Decimal            @db.Decimal(6,2)
  rotatie    Decimal            @default(0) @db.Decimal(5,1)
  schaal     Decimal            @default(1) @db.Decimal(4,2)
}

model PlantPakket {
  id     String             @id @default(cuid())
  naam   String
  doel   String?            // bv. "vlinderlint", "winterskelet + vroege dracht"
  regels PlantPakketRegel[]
}

model PlantPakketRegel {
  id       String      @id @default(cuid())
  pakketId String
  pakket   PlantPakket @relation(fields: [pakketId], references: [id], onDelete: Cascade)
  plantId  String
  plant    Plant       @relation(fields: [plantId], references: [id])
  aantal   Int         @default(1)
}
```

Belangrijk verschil met het eerdere onderzoeksvoorstel: `ZoneSjabloonRegel` verwijst via `soort` + `refId` naar element OF plant, want de vaste zone-opstellingen bevatten bewust ook beplanting (klimzone met schaduwwilg, waterzone met oeverplanten). De seizoensdekking van een pakket wordt NIET opgeslagen maar berekend uit de regels (geen dubbele waarheid).

### 3.3 Helpers (lib/domain/bloei.ts)

```ts
export const maandBit = (m: number) => 1 << (m - 1); // m = 1..12
export const bloeitIn = (masker: number, m: number) => (masker & maandBit(m)) !== 0;

// kleurstatus van een plant in een gegeven maand, voor canvas en 3D-loze weergave
export type PlantStatus = "bloei" | "groen" | "wintergroen" | "kaal";
export function plantStatus(p: {bloeimaanden: number; wintergroen: boolean}, maand: number): PlantStatus {
  if (bloeitIn(p.bloeimaanden, maand)) return "bloei";
  if (p.wintergroen) return "wintergroen";
  if (maand >= 4 && maand <= 10) return "groen";
  return "kaal";
}

// bloeiboog: per maand het aantal unieke bloeiende soorten in het ontwerp
export function bloeiboog(soorten: {bloeimaanden: number}[]): number[] { /* 12 tellers */ }

// gaten in het kernseizoen maart t/m oktober (maanden met 0 bloeiers)
export function bloeigaten(boog: number[]): number[] { /* indexen 3..10 met 0 */ }
```

Kleurregels (exact zoals het prototype): status `bloei` = `bloeikleur` met bloei-accent; `groen` = dof groen (#9BB08A); `wintergroen` = donkergroen (#5E6B4F); `kaal` = transparant met gestippelde contour. Stand "Hele jaar" toont elke plant in de eigen `bloeikleur` zonder maand-logica. Implementatie in Konva via eenvoudige `fill`-wijzigingen per node; GEEN gecachte functie-filters (performance, zie risico's).

## 4. User stories & acceptatiecriteria

### Fase 3b – Seizoensbloei & canvas-UX

- **US-3b.1** – *Als Lotte wil ik bij elke plant in het palet een bloeikalender-strip (jan t/m dec) zien, zodat ik in een oogopslag weet wanneer iets bloeit.*
  - Elke plant toont 12 segmenten; bloeimaanden zijn gevuld; de actieve maand is gemarkeerd.
  - Wintergroen en giftig zijn zichtbaar als badge (WG / gif).

- **US-3b.2** – *Als Lotte wil ik het palet kunnen filteren op "bloeit in [maand]" en "wintergroen", zodat ik gericht kies.*
  - Het maandfilter grijst niet-passende planten uit maar laat ze plaatsbaar (VegPlotter-patroon); het wintergroen-filter idem.
  - De filterlabel-maand volgt de seizoensschuif.

- **US-3b.3** – *Als Lotte wil ik met een seizoensschuif (jan t/m dec, plus "Hele jaar") het canvas per maand herkleuren, zodat ik zie hoe de plek er dat moment bij staat.*
  - Beplanting kleurt volgens de vier statussen (bloei/groen/wintergroen/kaal) uit 3.3.
  - Elementen (toestellen, aanleidingen) veranderen niet van kleur.
  - De schuif werkt zonder merkbare vertraging bij 100+ items.

- **US-3b.4** – *Als Lotte wil ik een bloeiboog-balk in de zijbalk, zodat ik gaten in het bloeiseizoen direct zie.*
  - 12 staafjes tonen per maand het aantal unieke bloeiende soorten; 0 = rood (clay-deep), 1 = oranje (clay), 2+ = groen (moss).
  - Klikken op een maand zet de seizoensschuif op die maand.
  - Onder/boven de balk staat een samenvatting: "doorlopend" of "gat: [maanden]".

- **US-3b.5** – *Als Lotte wil ik dat de ontwerpcoach seizoenschecks doet, zodat mijn beplantingsplan klopt voordat de klant het ziet.*
  - Check "bloeigat": maanden in maart t/m oktober met 0 bloeiers worden benoemd, met een suggestie (vroege dracht: wilg/sleedoorn/krokus; laat: klimop/herfstbloeiers).
  - Check "wintergroen ontbreekt": waarschuwing met suggesties (struikhei, klimop op afstand, hulst als haag).
  - Check "giftige soorten": geplaatste planten met `giftig = true` worden benoemd met het advies "buiten peuterbereik, niet naast zand- of snoepzone; taxus vermijden".
  - Bestaande checks (valruimte, waterzone/peuterzone, schaduw, inheems-percentage, WAS-telling) blijven werken.
  - Zonder beplanting toont de coach een uitnodiging in plaats van foutmeldingen.

- **US-3b.6** – *Als Lotte wil ik snappen, dupliceren en ongedaan maken, zodat ik sneller en netter ontwerp.*
  - Snappen op 0,5 m bij het loslaten van een sleepactie; toggle in de toolbar, standaard aan.
  - Dupliceren van de selectie via knop en Ctrl+D (geplaatst met kleine offset).
  - Undo/redo via knoppen en Ctrl+Z / Ctrl+Shift+Z; dekt plaatsen, verplaatsen, verwijderen, dupliceren en groepsplaatsingen; minimaal 20 stappen.

### Fase 3c – Zone-sjablonen & plantpakketten

- **US-3c.1** – *Als Lotte wil ik vijf vaste zone-opstellingen in een keer plaatsen, zodat een nieuw ontwerp vliegend start.*
  - Seed bevat: Klimzone compleet, Waterspeelzone, Moestuinhoek, Rustzone, Bloemenweide-rand (samenstelling in 5.2).
  - Plaatsen zet alle regels (elementen en planten) met behoud van relatieve posities; valruimte-ringen en coach-checks werken direct.

- **US-3c.2** – *Als Lotte wil ik mijn huidige selectie opslaan als eigen sjabloon met thumbnail, zodat ik mijn favoriete combinaties hergebruik.*
  - Het sjabloon bewaart relatieve posities/rotaties/schalen, krijgt categorie "eigen" en een thumbnail via `stage.toDataURL`.
  - Eigen sjablonen verschijnen in het Zones-tabblad en zijn verwijderbaar.

- **US-3c.3** – *Als Lotte wil ik plantpakketten als groep toevoegen, zodat een doorlopende bloeiboog een klik is.*
  - Seed bevat "Vlinderlint voorjaar–herfst" en "Winterskelet + vroege dracht" (samenstelling in 5.3).
  - Elk pakket toont in het palet een dekking-balkje (12 maanden, berekend uit de regels).
  - Toevoegen plaatst de planten in een nette groep; de bloeiboog-balk en coach updaten direct.

- **US-3c.4** – *Als Lotte wil ik een geplaatst pakket als offerte-regel kunnen opnemen, zodat beplanting ook commercieel klopt.*
  - Vanuit het ontwerp is "zet pakket in offerte" beschikbaar; de regel bevat pakketnaam, aantallen en prijs (som van plantprijzen), conform het bestaande offerte-JSONB.

- **US-3c.5** – *Als Lotte wil ik dat de Ontwerphulp-wizard de sjablonen en pakketten gebruikt, zodat een gegenereerde startopzet meteen seizoensbewust is.*
  - De wizard blijft de bestaande vragen stellen (leeftijden, wensen, budget) en krijgt er een vraag bij: "Moet de plek er in de winter ook groen uitzien?".
  - De gegenereerde startopzet is samengesteld uit zone-sjablonen (passend bij de gekozen wensen) plus minimaal een plantpakket, gekozen zodat de bloeiboog maart t/m oktober dekt; bij "winter: ja" wordt het winterskelet-pakket toegevoegd.
  - Na genereren staan er geen onopgeloste coach-waarschuwingen over bloeigat of wintergroen (giftig-advies mag wel blijven staan als informatief).

## 5. Seed-data

### 5.1 Planten – bloeivelden (bijwerken van bestaande + nieuwe soorten)

Alle soorten inheems; maanden als lijst (om te zetten naar bitmask). Prijzen indicatief per stuk.

| Plant | Type | Bloei (mnd) | Bloeikleur | Wintergroen | Giftig | Dracht N/P | Hoogte | Opmerking |
|---|---|---|---|---|---|---|---|---|
| Schietwilg | boom | 3,4 | #E7D77C | nee | nee | 5/5 | 6 m | vroege dracht, hommelkoninginnen |
| Hazelaar | struik | 2,3 | #E4D48A | nee | nee | 1/5 | 4 m | katjes al in februari |
| Sleedoorn | struik | 3,4 | #F2EDE2 | nee | nee | 4/3 | 3 m | waardplant, vogels |
| Meidoorn | struik | 5 | #F4EFE4 | nee | nee | 4/3 | 4 m | vogelbosje |
| Boerenkrokus (bol) | bol | 2,3 | #A98FD0 | nee | nee | 3/4 | 0,15 m | per 25 planten |
| Pinksterbloem | vast | 4,5 | #D3BFE3 | nee | nee | 3/2 | 0,4 m | waardplant oranjetipje |
| Slangenkruid | vast | 6,7,8 | #6E93CF | nee | nee | 5/4 | 0,8 m | topper wilde bijen |
| Knoopkruid | vast | 6,7,8,9 | #B96FA0 | nee | nee | 5/4 | 0,7 m | vlinders |
| Beemdkroon | vast | 7,8,9 | #9F98CC | nee | nee | 4/3 | 0,7 m | knautiabij |
| Wilde marjolein | vast | 7,8,9 | #D194B0 | nee | nee | 5/3 | 0,5 m | nectarkampioen |
| Grote kattenstaart | vast (oever) | 6,7,8 | #B473A6 | nee | nee | 4/3 | 1 m | waterzone |
| Struikhei | dwergstruik | 8,9 | #B07FC2 | JA | nee | 4/3 | 0,4 m | niet-giftig wintergroen |
| Klimop | klimplant | 9,10,11 | #C7CE8F | JA | JA (licht) | 5/4 | 3 m | late dracht; op afstand van speelzones |
| Hulst | struik | 5,6 | #F1ECE0 | JA | JA (bessen) | 3/2 | 3 m | haag buiten grijpbereik peuters |

Bloeitijden zijn indicatief (verschillen per jaar/streek); dat voorbehoud hoort in de bibliotheek-UI als note.

### 5.2 Zone-sjablonen (5, categorie vast)

Relatieve posities in meters t.o.v. het groepsanker; exacte waarden staan in het prototype (`ZONES`-array in `de-kas-studio-v3.html`), hier de samenstelling:

1. **Klimzone compleet** – klimtoestel, boomstammenparcours, 1x schietwilg (schaduw).
2. **Waterspeelzone** – waterpomp + geul, stapstenen, 3x grote kattenstaart (oever).
3. **Moestuinhoek** – 2x moestuinbak, stapstenen (pad), 3x wilde marjolein (rand).
4. **Rustzone** – wilgenhut, 1x meidoorn, pinksterbloem + beemdkroon + knoopkruid (bloemrand).
5. **Bloemenweide-rand** – strook van 6 m: pinksterbloem, slangenkruid, knoopkruid, beemdkroon, wilde marjolein, struikhei.

### 5.3 Plantpakketten (2)

1. **Vlinderlint voorjaar–herfst** – pinksterbloem x3, knoopkruid x4, beemdkroon x3, wilde marjolein x4, klimop x1. Dekking: apr t/m nov.
2. **Winterskelet + vroege dracht** – hazelaar x1, schietwilg x1, boerenkrokus x4 (= 100 bollen), struikhei x3, hulst x1. Dekking: feb t/m jun + aug/sep, plus wintergroen.

Seed idempotent conform het bestaande patroon (deleteMany/upsert per bibliotheektabel).

## 6. Schermen & UI-plaatsing

Alles binnen de bestaande route `/ontwerpstudio/[ontwerpId]`, plaatsing conform prototype:
- **Toolbar:** snappen-toggle, seizoensschuif met maandnaam en "Hele jaar"-knop, dupliceer-knop; undo/redo-knoppen in de kopbalk.
- **Palet:** vier tabbladen – Elementen / Planten / Zones / Pakketten.
- **Zijbalk:** tellers (aanleidingen / toestellen / plantsoorten), bloeiboog-balk, materialen- en beplantingslijst met totaal; tabbladen Ontwerp / Coach / Selectie.
- **Selectie-paneel:** toont voor een plant de bloeikalender-strip, type, wintergroen en het giftig-advies.
- **Ontwerphulp-knop** blijft op de bestaande plek; alleen de inhoud van de wizard wijzigt (US-3c.5).

## 7. Definition of Done

- [ ] Migraties `0008_seizoensbloei` en `0009_zones_pakketten` toegevoegd en draaien automatisch bij Railway-deploy.
- [ ] Bloeihelpers (`lib/domain/bloei.ts`) met unit-tests op masker, status, bloeiboog en gat-detectie.
- [ ] Palet toont bloeikalender-strips, WG/gif-badges en beide filters (uitgrijzen, wel plaatsbaar).
- [ ] Seizoensschuif + "Hele jaar" herkleuren het canvas volgens de vier statussen; soepel bij 100+ items (geen gecachte Konva-functie-filters).
- [ ] Bloeiboog-balk klikbaar met gat-samenvatting.
- [ ] Coach: bloeigat-, wintergroen- en giftig-checks werken; bestaande checks onaangetast.
- [ ] Snappen (toggle), dupliceren (Ctrl+D) en undo/redo (20+ stappen) werken.
- [ ] 5 zone-sjablonen en 2 plantpakketten geseed en plaatsbaar als groep; dekking-balkje per pakket klopt met de regels.
- [ ] "Bewaar selectie als eigen sjabloon" met thumbnail werkt; eigen sjablonen verwijderbaar.
- [ ] Ontwerphulp genereert startopzetten uit sjablonen + pakket(ten); wintervraag toegevoegd; resultaat zonder bloeigat-/wintergroen-waarschuwing.
- [ ] Pakket als offerte-regel opneembaar.
- [ ] ERD in `docs/02-datamodel.md` bijgewerkt (incl. de fase-4b-modellen `Printblad`/`les` als die er nog niet in staan).
- [ ] Geen em-dashes in nieuwe bestanden (hook draait schoon).

## 8. Testplan

- **Unit:** maandBit/bloeitIn randgevallen (jan, dec); plantStatus voor de vier statussen incl. wintergroen in februari; bloeiboog met dubbele soorten (uniek tellen); bloeigaten alleen binnen maart t/m okt.
- **Seed-test:** twee keer seeden geeft geen duplicaten; pakket-dekking berekend uit regels komt overeen met 5.3.
- **Handmatig:** (1) leeg ontwerp, plaats "Vlinderlint", schuif jan t/m dec en zie de kleuren en de boog veranderen; (2) verwijder de vroege bloeiers en controleer de bloeigat-melding met suggestie; (3) plaats hulst en controleer het giftig-advies; (4) wizard met "winter: ja" levert een opzet zonder bloeigat-/wintergroen-waarschuwing; (5) eigen sjabloon opslaan, herladen, opnieuw plaatsen; (6) undo/redo over een groepsplaatsing heen.
- **Performance:** 120 items plaatsen, seizoensschuif snel heen en weer; geen merkbare hapering.

## 9. Risico's & aandachtspunten

- **Konva-performance:** herkleuren via `fill` per node, nooit via gecachte functie-filters; herteken alleen de plantenlaag bij een maandwissel (aparte Layer).
- **Datakwaliteit bloeitijden:** indicatief; toon dat voorbehoud in de bibliotheek en behandel de seed als startpunt dat Lotte bijwerkt.
- **Giftig wintergroen:** de enige niet-giftige wintergroene soort in de seed is struikhei; de coach moet hulst/klimop dus expliciet blijven flaggen en taxus wordt bewust NIET geseed.
- **Wizard-regressie:** de bestaande wizard-flows mogen niet breken; bouw de sjabloon-/pakketkeuze als extra stap achter de bestaande vragen en test de oude paden mee.
- **Undo/redo en groepen:** een zone- of pakketplaatsing is EEN historiestap, niet tien losse.
- **Scope-bewaking:** geen 3D, geen smart guides als het uitloopt, geen externe planten-API's.

---

## ADR-0008 – Bloeimaanden als bitmask + seizoenslaag in de studio

**Status:** Voorgesteld · **Datum:** 2026-07-08

**Context.** De studio moet per maand tonen wat er bloeit, gaten in de bloeiboog berekenen en daar coach-checks op draaien. Bloeitijd stond alleen als vrije tekst op `Plant`.

**Beslissing.** Bloeimaanden worden een 12-bits integer-masker op `Plant` (bit 0 = januari), met helpers in `lib/domain/bloei.ts` als enige rekenbron. De seizoensweergave is een pure view-laag in Konva (fill-wissel per plantnode op een eigen Layer), zonder gecachte functie-filters. Zone-sjablonen en plantpakketten zijn echte tabellen (geen JSONB), omdat hun regels relationeel bevraagd worden (dekking berekenen, offerte-regels, wizard-selectie).

**Alternatieven.** Van/tot-maandvelden (faalt bij soorten met twee bloeiblokken zoals klimop); bloei als aparte tabel PlantBloeimaand (12 rijen per plant, onnodig zwaar); sjablonen in JSONB (verliest querybaarheid en refererende integriteit naar Element/Plant).

**Gevolgen.** (+) Triviale en snelle berekeningen (bit-AND), een waarheid voor palet, canvas, boog en coach. (+) Sjablonen/pakketten zijn telbaar, verwijderbaar en herbruikbaar in wizard en offerte. (–) Bitmask is minder zelfverklarend in de database; gecompenseerd door helpers, tests en het behouden leesbare `bloeitijd`-tekstveld.
