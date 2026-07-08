import type { CanvasData } from "@/lib/validators/canvas";
import {
  type BibliotheekElement,
  footprintRadiusM,
  vrijeZoneRadiusM,
} from "./types";

export type CoachMelding = {
  niveau: "waarschuwing" | "info" | "ok";
  tekst: string;
};

function afstand(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Live ontwerpcoach. Checks:
 * 1. valruimte rond toestellen vrij van andere elementen;
 * 2. elementen binnen het terrein;
 * 3. water dicht bij zand (afwatering/schaduw-aandachtspunt);
 * 4. inheems-percentage van de beplanting (subsidie-eis, vaak >= 50%);
 * 5. herinnering AKI-keuring bij keuringsplichtige toestellen.
 */
export function coachChecks(
  canvas: CanvasData,
  bib: Map<string, BibliotheekElement>,
  planten: { totaal: number; inheemsPct: number }
): CoachMelding[] {
  const meldingen: CoachMelding[] = [];
  const geplaatst = canvas.elementen
    .map((el) => ({ el, bib: bib.get(el.elementId) }))
    .filter((x): x is { el: CanvasData["elementen"][number]; bib: BibliotheekElement } =>
      Boolean(x.bib)
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
  const zandElementen = geplaatst.filter((x) =>
    x.bib.naam.toLowerCase().includes("zand")
  );
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

  // 4. Inheems-percentage
  if (planten.totaal === 0) {
    meldingen.push({
      niveau: "info",
      tekst: "Nog geen beplanting gekoppeld; het inheems-percentage telt mee voor veel subsidies.",
    });
  } else if (planten.inheemsPct < 50) {
    meldingen.push({
      niveau: "waarschuwing",
      tekst: `Inheems-percentage is ${planten.inheemsPct}%: veel regelingen vragen minimaal 50%.`,
    });
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
