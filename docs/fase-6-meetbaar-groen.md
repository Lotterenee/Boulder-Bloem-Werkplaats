# Fase 6 - Meetbaar groen & nazorg

## Doel
Biodiversiteitsmetingen (nulmeting/jaartelling) met grafiek per project en
verantwoordings-export; beheeragenda met terugkerende taken; publiek API-endpoint voor
het subsidiescan-formulier van de klantensite.

## User stories
- **US-6.1** *Als Lotte wil ik metingen invoeren (datum, type, waarnemingen als soort+aantal).*
- **US-6.2** *Als Lotte wil ik per project een grafiek van de ontwikkeling zien.*
- **US-6.3** *Als Lotte wil ik een verantwoordings-export (voor subsidie) genereren.*
- **US-6.4** *Als Lotte wil ik een beheeragenda met terugkerende taken.*
- **US-6.5** *Als de klantensite wil ik een subsidiescan-formulier posten naar De Kas, zodat er
  automatisch een aanvraag met status "scan" ontstaat.*

## API-endpoint (US-6.5)
- `POST /api/subsidiescan` - publiek, Zod-gevalideerd, rate-limited. Maakt (concept)Klant +
  Project + SubsidieAanvraag(status=scan). Beveilig met een gedeeld geheim (header-token).

## Routes
- `/projecten/[id]` → tabs "Metingen" (grafiek) en "Beheer" (agenda).

## Databasewijzigingen
- `Meting` (+ terugkerende taken via `Taak.categorie=beheer`). Migratie `0006_metingen`.

## Definition of Done
- [ ] Metingen invoerbaar; grafiek per project.
- [ ] Verantwoordings-export downloadbaar.
- [ ] Beheeragenda toont terugkerende taken.
- [ ] Publiek `/api/subsidiescan` maakt aanvraag; beschermd tegen misbruik.

## Risico's
- Publiek endpoint = aanvalsoppervlak → validatie, token en rate limiting verplicht.
