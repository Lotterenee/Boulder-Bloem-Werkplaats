# Fase 5 - Offertes & bibliotheken

## Doel
Offertes genereren vanuit ontwerp + educatiepakket met btw (21%); plantenbibliotheek
gekoppeld aan ontwerpen; partners-CRM.

## User stories
- **US-5.1** *Als Lotte wil ik een offerte genereren met regels uit het ontwerp
  (materialen/prijs) en/of een educatiepakket, met totaal excl./incl. btw (21%).*
- **US-5.2** *Als Lotte wil ik een vaste rolafbakeningstekst in de offerte (leverancier keurt
  toestellen; opdrachtgever beheert na oplevering).*
- **US-5.3** *Als Lotte wil ik planten aan een ontwerp koppelen (OntwerpPlant), zodat het
  inheems-percentage klopt.*
- **US-5.4** *Als Lotte wil ik partners beheren (groenaannemer, toestelleverancier, kwekerij,
  keuringsinstantie) met tarieven en notities.*

## Acceptatiecriteria offerte
- `totaalIncl = totaalExcl * 1.21` (per regel btw mogelijk; standaard 21%).
- Uniek `offertenummer`; status concept→verzonden→geaccepteerd/afgewezen.
- Rolafbakeningstekst automatisch ingevoegd (bewerkbaar).

## Routes
- `/projecten/[id]` → tab "Offerte"; `/bibliotheek/planten`; `/bibliotheek/partners`.

## Databasewijzigingen
- `Offerte`, `Plant`, `OntwerpPlant`, `Partner`. Migratie `0005_offerte_biblio`.

## Definition of Done
- [ ] Offerte genereerbaar uit ontwerp/pakket met correcte btw.
- [ ] Rolafbakeningstekst aanwezig.
- [ ] Planten koppelbaar; inheems-% zichtbaar in studio.
- [ ] Partners-CRM werkt.

## Risico's
- btw-percentage kan wijzigen → als constante in `lib/domain/btw.ts`.
