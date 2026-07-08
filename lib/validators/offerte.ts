import { z } from "zod";

export const offerteRegelSchema = z.object({
  omschrijving: z.string().min(1),
  aantal: z.number().nonnegative(),
  stuksprijs: z.number(),
  btwPct: z.number().min(0).max(100),
});

export const offerteRegelsSchema = z.array(offerteRegelSchema);

export type OfferteRegelInput = z.infer<typeof offerteRegelSchema>;
