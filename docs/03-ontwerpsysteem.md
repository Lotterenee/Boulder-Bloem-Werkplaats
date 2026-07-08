# 03 - Ontwerpsysteem (Boulder Bloem-huisstijl)

## Kleur-tokens (Tailwind)
Plaats in `tailwind.config.ts` onder `theme.extend.colors`:
```ts
colors: {
  cream: "#FAF6EF", paper: "#FFFDF8",
  sage: "#CBD6C2", "sage-light": "#DCE3D2",
  moss: "#7E8C6A", "moss-deep": "#49523E", "moss-night": "#3C4433",
  clay: "#C98E70", "clay-deep": "#B0714F", "clay-soft": "#F1E0D2",
  wood: "#9A7B5A", sand: "#E7D8C5", water: "#AECAC4",
  ink: "#3A352F", "ink-soft": "#6B6258",
}
```
- **Achtergrond app:** `cream`; kaarten `paper`.
- **Donkere zijbalk:** `moss-night` (#3C4433), actieve item `moss`/`sage-light`-tekst.
- **Accent/CTA:** `clay` → hover `clay-deep`. **Info/water-zones:** `water`.
- **Tekst:** `ink`; secundair `ink-soft`.

## Typografie
- **Koppen & grote getallen:** Fraunces (serif, karakter).
- **UI & body:** Nunito Sans.
- Laad via `next/font`; stel als CSS-variabelen `--font-fraunces`, `--font-nunito`.

## Kerncomponenten (`components/ui/`)
- `Sidebar` (donker, iconen + labels): Dashboard, Klanten, Projecten, Ontwerpstudio,
  Subsidies, Educatie, Bibliotheek, Instellingen.
- `Card`, `Button` (primary=clay, ghost), `Badge` (statuskleuren), `Stepper` (7 fasen),
  `KanbanColumn`, `DataTable`, `EmptyState`, `DeadlineList`, `StatCard` (Fraunces-cijfers).
- `TrafficLight` - kleurcode voor `laatstGecheckt` (groen <3 mnd, oranje ouder).

## Toegankelijkheid
- Contrast: controleer `ink` op `cream`/`paper` (voldoet WCAG AA voor body).
  `moss`-tekst op donker alleen voor grote tekst/iconen.
- Alle interactieve elementen focus-zichtbaar (`ring` in `clay`).
- Canvas krijgt een **parallelle, visueel verborgen lijst** van geplaatste elementen
  met labels (react-konva laat dit toe via React-DOM naast de stage) voor screenreaders.
- Formulieren: labels gekoppeld, foutmeldingen in tekst (niet alleen kleur).
