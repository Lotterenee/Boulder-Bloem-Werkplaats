# Fase 3 - Ontwerpstudio v1

## Doel
Canvas op schaal (1m-raster), elementen uit bibliotheek slepen/roteren/schalen, opslaan
als versies (JSONB), PNG-export, live materialen-zijbalk met prijs en telling
speelaanleidingen vs. keuringsplichtige toestellen, automatische valruimte-ringen,
ontwerphulp-wizard, sjablonen en ontwerpcoach met live checks.

## Technische aanpak (onderbouwd)
- **Bibliotheek: Konva.js via `react-konva`** (ADR-0003). Redenen: officiële React-binding
  (scene = functie van React-state), `Transformer` voor roteren/schalen out-of-the-box,
  multi-layer performance (statische raster-laag apart van interactieve laag),
  `stage.toDataURL()` voor PNG, en eenvoudige JSON-persistentie.
- **State:** React-state (of Zustand) als *bron van waarheid*; de Konva-scene wordt eruit
  afgeleid. Dit maakt **undo/redo** simpel via een history-stack van state-snapshots.
- **Opslaan:** serialiseer de state naar `Ontwerp.canvas` (JSONB), gevalideerd met Zod.
  Nieuwe versie = kopie met `versie+1`.
- **PNG-export:** `stageRef.current.toDataURL({pixelRatio:2})` → download-link. Let op:
  externe afbeeldingen moeten same-origin zijn (anders security-error).
- **Valruimte-ringen:** render een half-transparante cirkel (`Element.valruimteM`) op een
  aparte laag rond elk toestel; coach checkt overlap.

## Canvas-JSONB vorm (Zod)
```ts
{ terrein: { breedteM: number, diepteM: number },
  raster: 1,
  elementen: [{ elementId: string, x: number, y: number, rotatie: number, schaal: number }] }
```

## User stories
- **US-3.1** *Als Lotte wil ik het terrein op schaal instellen met een 1m-raster.*
- **US-3.2** *Als Lotte wil ik elementen uit de bibliotheek op het canvas slepen, roteren en
  schalen.*
- **US-3.3** *Als Lotte wil ik het ontwerp opslaan als genummerde versie (JSONB).*
- **US-3.4** *Als Lotte wil ik een PNG exporteren om te delen.*
- **US-3.5** *Als Lotte wil ik in een live zijbalk de materialenlijst, prijsindicatie en de
  telling speelaanleidingen vs. keuringsplichtige toestellen zien.*
- **US-3.6** *Als Lotte wil ik automatische valruimte-ringen rond toestellen.*
- **US-3.7** *Als Lotte wil ik een Ontwerphulp-wizard (leeftijden/wensen/budget → startopzet).*
- **US-3.8** *Als Lotte wil ik sjablonen kunnen laden.*
- **US-3.9** *Als Lotte wil ik een ontwerpcoach met live checks:* valruimte vrij; waterzone
  niet naast peuterzone; schaduw bij zandzone; inheems-percentage voor subsidie-eis.

## Routes
- `/ontwerpstudio/[ontwerpId]`. Nieuw ontwerp via project-tab "Ontwerp".

## Databasewijzigingen
- Modellen `Ontwerp`, `Element` (+ `OntwerpPlant` voorbereid voor Fase 5). Migratie `0003_ontwerp`.

## Definition of Done
- [ ] Slepen/roteren/schalen werkt op 1m-raster.
- [ ] Opslaan als versie + herladen uit JSONB.
- [ ] PNG-export werkt.
- [ ] Zijbalk: materialen, prijs, telling WAS-soort (live).
- [ ] Valruimte-ringen zichtbaar; coach-checks geven waarschuwingen.
- [ ] Wizard genereert een startopzet; minstens 1 sjabloon laadbaar.
- [ ] Vervolg in Fase 3b/3c: seizoensbloei, canvas-UX (snappen, dupliceren,
      undo/redo), zone-sjablonen en plantpakketten (zie
      fase-3b-3c-seizoensbloei-zones.md).

## Testplan
- Unit: valruimte-overlapdetectie, inheems-% berekening, prijs-som.
- Handmatig: plaats toestel → ring verschijnt → coach waarschuwt bij overlap.

## Risico's
- Complexiteit van het canvas is de grootste in het project; bouw incrementeel
  (eerst plaatsen/opslaan, dan coach, dan wizard).
