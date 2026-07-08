# ADR-0003 - Konva.js/react-konva voor de ontwerpstudio
Status: Aanvaard · 2026-07-07
## Context
2D drag-and-drop op schaal, roteren/schalen, valruimte-ringen, PNG-export, versies.
## Beslissing
Konva.js via react-konva.
## Alternatieven
- **Fabric.js:** sterk in beeld­bewerking, geen officiële React-binding.
- **tldraw:** complete whiteboard-app; te veel/te weinig controle.
- **Pure SVG/DOM:** schaalt slecht bij veel elementen + ringen.
## Reden
Officiële React-binding (scene = state), `Transformer` voor rotatie/schaal,
multi-layer performance, `toDataURL()` PNG, JSON-serialisatie voor JSONB.
## Gevolgen
+ Minste maatwerk voor de eisen. − Canvas-op-canvas (geen echte SVG-export).
