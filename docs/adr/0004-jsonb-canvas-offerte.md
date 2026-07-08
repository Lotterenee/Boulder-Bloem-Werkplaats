# ADR-0004 - JSONB voor canvas-, offerte- en meetgegevens
Status: Aanvaard · 2026-07-07
## Beslissing
`Ontwerp.canvas`, `Offerte.regels`, `Meting.waarnemingen` als JSONB, gevalideerd met Zod.
## Reden
Semi-gestructureerd, snel evoluerend, nooit relationeel bevraagd.
## Gevolgen
+ Snelle iteratie. − Geen DB-constraints → Zod-validatie verplicht aan de rand.
