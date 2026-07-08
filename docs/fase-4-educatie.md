# Fase 4 - Educatie

## Doel
Activiteitenbibliotheek + pakketten samenstellen met automatische prijsberekening.

## User stories
- **US-4.1** *Als Lotte wil ik educatieactiviteiten beheren (titel, leeftijd, seizoen, duur,
  doelen, benodigdheden, prijs).*
- **US-4.2** *Als Lotte wil ik een pakket samenstellen uit activiteiten met automatische
  totaalprijs.*
- **US-4.3** *Als Lotte wil ik een pakket koppelen aan een project en de status volgen
  (concept/aangeboden/verkocht).*

## Acceptatiecriteria
- Totaalprijs pakket = som van gekozen activiteitprijzen (herberekend bij wijziging).
- Seed bevat 10 activiteiten en 3 pakketten (lesmap+beheerkalender vanaf €750;
  openingsworkshop vanaf €250/dagdeel; seizoensprogramma €850–1100/jaar) - zie seed-data.

## Routes
- `/educatie/activiteiten`, `/educatie/pakketten`, `/educatie/pakketten/[id]`.

## Databasewijzigingen
- `EducatieActiviteit`, `EducatiePakket`, `PakketActiviteit`. Migratie `0004_educatie`.

## Definition of Done
- [ ] Activiteiten-CRUD werkt.
- [ ] Pakket samenstellen met live totaalprijs.
- [ ] Koppeling aan project + statusbeheer.
- [ ] Seed-data geladen.
- [ ] Lesbibliotheek: 10 uitgewerkte lessen + 12 printbladen als lescontent
      bij de activiteiten (zie fase-4b-lesbibliotheek.md).

## Risico's
- Kerndoelen worden landelijk herzien; `doelen` is vrije tekst → geen harde koppeling.
