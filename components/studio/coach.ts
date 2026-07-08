import type { CanvasData } from "@/lib/validators/canvas";
import {
  type BibliotheekElement,
  type BibliotheekPlant,
  footprintRadiusM,
  vrijeZoneRadiusM,
} from "./types";
import { bloeiboog, bloeigaten, MAANDEN } from "@/lib/domain/bloei";

export type CoachMelding = {
  niveau: "waarschuwing" | "info" | "ok";
  tekst: string;
};

function afstand(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Live ontwerpcoach. Bestaande checks (valruimte, terreingrens, water/zand,
 * inheems-percentage, WAS-telling) plus de seizoenschecks uit Fase 3b
 * (bloeigat, wintergroen ontbreekt, giftige soorten). Alles afgeleid van wat
 * er op het canvas staat.
 */
export function coachChecks(
  canvas: CanvasData,
  bib: Map<string, BibliotheekElement>,
  plantBib: Map<string, BibliotheekPlant>
): CoachMelding[] {
  const meldingen: CoachMelding[] = [];
  const geplaatst = canvas.elementen
    .map((el) => ({ el, bib: bib.get(el.elementId) }))
    .filter((x): x is { el: CanvasData["elementen"][number]; bib: BibliotheekElement } =>
      Boolean(x.bib)
    );

  const beplanting = canvas.beplanting
    .map((b) => ({ b, plant: plantBib.get(b.plantId) }))
    .filter((x): x is { b: CanvasData["beplanting"][number]; plant: BibliotheekPlant } =>
      Boolean(x.plant)
    );

  // 1. Valruimte-overlap
  for (const a of geplaatst) {
    if (a.bib.valruimteM <= 0) continue;
    for (const b of geplaatst) {
      if (a.el.id === b.el.id) continue;
      const minAfstand =
        vrijeZoneRadiusM(a.bib, a.el.schaal) + footprintRadiusM(b.bib, b.el.schaal);
      if (afstand(a.el, b.el) < minAfstand) {
        meldingen.push({
          niveau: "waarschuwing",
          tekst: `Valruimte van "${a.bib.naam}" overlapt met "${b.bib.naam}". Schuif ze uit elkaar.`,
        });
      }
    }
  }

  // 2. Binnen het terrein
  for (const { el, bib: b } of geplaatst) {
    const r = footprintRadiusM(b, el.schaal);
    if (
      el.x - r < 0 ||
      el.y - r < 0 ||
      el.x + r > canvas.terrein.breedteM ||
      el.y + r > canvas.terrein.diepteM
    ) {
      meldingen.push({
        niveau: "waarschuwing",
        tekst: `"${b.naam}" steekt (deels) buiten het terrein.`,
      });
    }
  }

  // 3. Water dicht bij zand
  const waterElementen = geplaatst.filter((x) => x.bib.categorie === "water");
  const zandElementen = geplaatst.filter((x) => x.bib.naam.toLowerCase().includes("zand"));
  for (const w of waterElementen) {
    for (const z of zandElementen) {
      if (afstand(w.el, z.el) < 4) {
        meldingen.push({
          niveau: "info",
          tekst: `Water ("${w.bib.naam}") ligt dicht bij de zandzone: denk aan afwatering en schaduw.`,
        });
      }
    }
  }

  // 4. Beplanting: inheems-percentage, bloeigat, wintergroen, giftig
  if (beplanting.length === 0) {
    meldingen.push({
      niveau: "info",
      tekst: "Nog geen beplanting op het plein. Plaats planten, een bloemenweide-zone of een plantpakket voor een doorlopende bloeiboog.",
    });
  } else {
    const totaal = beplanting.length;
    const inheems = beplanting.filter((x) => x.plant.inheems).length;
    const inheemsPct = Math.round((inheems / totaal) * 100);
    if (inheemsPct < 50) {
      meldingen.push({
        niveau: "waarschuwing",
        tekst: `Inheems-percentage is ${inheemsPct}%: veel regelingen vragen minimaal 50%.`,
      });
    }

    // Bloeigat: unieke soorten voor de boog.
    const uniekeSoorten = new Map<string, { bloeimaanden: number }>();
    for (const x of beplanting) uniekeSoorten.set(x.plant.id, x.plant);
    const boog = bloeiboog([...uniekeSoorten.values()]);
    const gaten = bloeigaten(boog);
    if (gaten.length > 0) {
      const vroeg = gaten.some((m) => m <= 5);
      const suggestie = vroeg
        ? "voeg vroege dracht toe (wilg, sleedoorn, boerenkrokus)"
        : "voeg late bloeiers toe (klimop, struikhei, herfstbloeiers)";
      meldingen.push({
        niveau: "waarschuwing",
        tekst: `Bloeigat in ${gaten.map((m) => MAANDEN[m - 1]).join(", ")}: ${suggestie}.`,
      });
    }

    // Wintergroen ontbreekt
    const heeftWintergroen = beplanting.some((x) => x.plant.wintergroen);
    if (!heeftWintergroen) {
      meldingen.push({
        niveau: "waarschuwing",
        tekst: "Geen wintergroen: overweeg struikhei, klimop (op afstand) of hulst als haag voor structuur in de winter.",
      });
    }

    // Giftige soorten
    const giftig = [...new Set(beplanting.filter((x) => x.plant.giftig).map((x) => x.plant.naamNL))];
    if (giftig.length > 0) {
      meldingen.push({
        niveau: "info",
        tekst: `Giftige soorten (${giftig.join(", ")}): buiten peuterbereik houden, niet naast zand- of snoepzone. Taxus vermijden.`,
      });
    }
  }

  // 5. Keuringsplicht
  const toestellen = geplaatst.filter((x) => x.bib.soort === "speeltoestel");
  if (toestellen.length > 0) {
    meldingen.push({
      niveau: "info",
      tekst: `${toestellen.length} keuringsplichtig(e) toestel(len) (WAS 2023): plan de ingebruiknamekeuring door een AKI via de leverancier.`,
    });
  }

  if (meldingen.length === 0) {
    meldingen.push({ niveau: "ok", tekst: "Geen aandachtspunten: het ontwerp ziet er goed uit." });
  }
  return meldingen;
}