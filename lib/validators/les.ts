import { z } from "zod";

/**
 * Rijke lesuitwerking op EducatieActiviteit.les (JSONB, ADR-0007).
 * Het bestaande veld `doelen` blijft de korte samenvatting; de volledige
 * school/BSO-framing leeft hier.
 */
export const LesSchema = z.object({
  nummer: z.number().int().positive().optional(), // werkboek-volgorde
  kort: z.string(), // cursieve intro/tagline
  doelenSchool: z.string(),
  doelenBso: z.string(),
  voorbereiding: z.array(z.string()), // checklist-items
  draaiboek: z.array(
    z.object({
      tijd: z.string(), // bv. "0-10"
      onderdeel: z.string(),
      instructie: z.string(),
      voorbeeldzin: z.string().optional(), // getoond als: Zeg bijvoorbeeld: "..."
    })
  ),
  differentiatieJong: z.string(),
  differentiatieOud: z.string(),
  veiligheid: z.string(),
  regenBackup: z.string(),
  afronding: z.string(),
  variant: z.string().optional(), // bv. moestuinles: verzorg-/oogstvariant
});
export type Les = z.infer<typeof LesSchema>;

// ---- Printbladen: kleine set bloktypes, met een html-escape-hatch ----

const Cel = z.object({
  tekst: z.string().optional(),
  invul: z.boolean().optional(), // toon een invul-lijn
  turf: z.boolean().optional(), // leeg turf-/schrijfvak
});
export type PrintbladCel = z.infer<typeof Cel>;

export const BlokSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("tekst"), inhoud: z.string() }), // {invul} in de tekst wordt een invul-lijn
  z.object({ type: z.literal("stappen"), items: z.array(z.string()) }),
  z.object({ type: z.literal("checklist"), items: z.array(z.string()) }),
  z.object({ type: z.literal("poster"), regels: z.array(z.string()), slot: z.string().optional() }),
  z.object({ type: z.literal("tabel"), koppen: z.array(z.string()), rijen: z.array(z.array(Cel)) }),
  z.object({ type: z.literal("kader"), titel: z.string().optional(), inhoud: z.string() }),
  z.object({ type: z.literal("html"), html: z.string() }), // escape-hatch voor eigenzinnige vellen
]);
export type PrintbladBlok = z.infer<typeof BlokSchema>;

export const PrintbladInhoudSchema = z.object({
  tag: z.string(), // bv. "Printblad · 1 per duo"
  blokken: z.array(BlokSchema),
});
export type PrintbladInhoud = z.infer<typeof PrintbladInhoudSchema>;
