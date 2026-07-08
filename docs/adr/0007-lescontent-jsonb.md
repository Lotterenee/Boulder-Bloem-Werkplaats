# ADR-0007 - Lescontent als JSONB + printbladen als blokmodel

Status: Aanvaard · Datum: 2026-07-08

## Context
Fase 4 leverde eenvoudige educatieactiviteiten. De lesbibliotheek (Fase 4b)
voegt rijke, semi-gestructureerde lesuitwerkingen en gevarieerde printbladen
(tabellen, posters, checklists) toe die per les sterk verschillen en
regelmatig zullen wijzigen.

## Beslissing
De lesuitwerking komt als een `les`-JSONB op `EducatieActiviteit` (Zod als
contract, `lib/validators/les.ts`), consistent met ADR-0004. Printbladen
krijgen een eigen tabel `Printblad` (telbaar, ordenbaar via `volgorde`, los
printbaar); hun inhoud is een kleine, gevalideerde blokkenset (`tekst`,
`stappen`, `checklist`, `poster`, `tabel`, `kader`) met een `html`-escape-hatch
voor uitzonderingen.

## Alternatieven
- Alles als losse kolommen op EducatieActiviteit: veel migratie-oppervlak,
  star bij nieuwe secties.
- Printbladen ook in JSONB op de activiteit: verliest volgorde/telbaarheid en
  de losse print-actie.
- Printblad-inhoud als vrije HTML-blob: snelst, maar minder onderhoudbaar en
  review-baar; nu beperkt tot het `html`-blok.

## Gevolgen
(+) Consistent met bestaande JSONB-keuzes, snelle iteratie, leesbare seed per
les. (+) Printbladen blijven eersteklas objecten. (-) Geen DB-constraints op
de JSON: Zod-validatie verplicht aan de rand (ook bij het seeden). (-) Het
`html`-blok rendert onbewerkte HTML via `dangerouslySetInnerHTML`; aanvaardbaar
bij een app met een enkele, vertrouwde gebruiker en spaarzaam gebruik (alleen
grillige vellen zoals bordjes).
