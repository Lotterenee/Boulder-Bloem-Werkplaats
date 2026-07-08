# 00 - Visie & context

## Wat is De Kas?
De Kas is het "achterkantoor" van Boulder Bloem: een privé, ingelogde webapplicatie
waarin Lotte haar hele werkproces beheert - van eerste kennismaking met een school
tot de jaarlijkse biodiversiteitstelling na oplevering.

De naam verwijst naar een kweekkas: projecten groeien hier op door 7 fasen.

## Voor wie?
- **Primaire (enige) gebruiker:** Lotte - eigenaar/ontwerper, data-analytisch onderlegd,
  geen professionele developer.
- **Indirecte "gebruiker":** de publieke Boulder Bloem-klantensite, die via één
  API-endpoint subsidiescan-aanvragen naar De Kas stuurt (Fase 6).

## Kernprincipes
1. **Project is de ruggengraat.** Klant, wensen, ontwerp, subsidie, educatie, offerte,
   meting en taken hangen allemaal aan een Project.
2. **Nabouwbaarheid boven cleverness.** Voorspelbare structuur, expliciete keuzes
   (ADR's), weinig magie. Een vreemde moet de app kunnen herbouwen met alleen deze docs.
3. **Onderhoudbaar door één persoon + AI.** Kleine, leesbare modules; conventies boven
   configuratie; TypeScript-types als contract.
4. **Ecologie & wetgeving zitten in het model.** Inheems-percentage, valruimte, en het
   WAS 2023-onderscheid speelaanleiding vs. speeltoestel zijn eersteklas concepten.
5. **Eerlijk over onzekerheid.** Subsidiebedragen en kerndoelen wijzigen; de app toont
   altijd "laatst gecheckt" en dwingt geen schijnzekerheid af.

## Scope-grenzen
- Geen multi-user / rechten­systeem (één gebruiker).
- Geen facturatie/boekhouding (offerte stopt bij PDF/overzicht).
- Geen realtime samenwerking op het canvas.
