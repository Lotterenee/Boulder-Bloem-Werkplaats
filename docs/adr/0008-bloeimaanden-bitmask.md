# ADR-0008 - Bloeimaanden als bitmask + seizoenslaag in de studio

Status: Aanvaard · Datum: 2026-07-08

## Context
De ontwerpstudio moet per maand tonen wat er bloeit, gaten in de bloeiboog
berekenen en daar coach-checks op draaien (Fase 3b/3c). Bloeitijd stond alleen
als vrije tekst op `Plant`.

## Beslissing
Bloeimaanden worden een 12-bits integer-masker op `Plant` (bit 0 = januari),
met helpers in `lib/domain/bloei.ts` als enige rekenbron (met unit-tests). De
seizoensweergave is een pure view-laag in Konva: een aparte beplantingslaag
waarin de fill per plantnode per maand wisselt, zonder gecachte functie-filters.
Zone-sjablonen en plantpakketten zijn echte tabellen (geen JSONB), omdat hun
regels relationeel bevraagd worden (dekking berekenen, offerte-regels,
wizard-selectie). Beplanting op het canvas is een `beplanting`-array in de
canvas-JSONB (naast `elementen`), consistent met ADR-0004.

## Alternatieven
- Van/tot-maandvelden: faalt bij soorten met twee bloeiblokken (klimop).
- Bloei als aparte tabel PlantBloeimaand (12 rijen per plant): onnodig zwaar.
- Sjablonen in JSONB: verliest querybaarheid en referentiele integriteit naar
  Element/Plant.

## Gevolgen
(+) Triviale, snelle berekeningen (bit-AND); een waarheid voor palet, canvas,
boog en coach. (+) Sjablonen/pakketten zijn telbaar, verwijderbaar en
herbruikbaar in wizard en offerte. (-) Een bitmask is minder zelfverklarend in
de database; gecompenseerd door helpers, tests en het behouden leesbare
`bloeitijd`-tekstveld.
