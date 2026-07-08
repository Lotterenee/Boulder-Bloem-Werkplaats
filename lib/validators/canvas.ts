import { z } from "zod";

/**
 * Vorm van Ontwerp.canvas (JSONB). Het raster is altijd 1 meter.
 * Elke geplaatste element-instantie heeft een eigen `id` (voor selectie)
 * en verwijst via `elementId` naar de elementbibliotheek.
 */
export const canvasSchema = z.object({
  terrein: z.object({
    breedteM: z.number().positive().max(500),
    diepteM: z.number().positive().max(500),
  }),
  raster: z.literal(1),
  elementen: z.array(
    z.object({
      id: z.string(),
      elementId: z.string(),
      x: z.number(),
      y: z.number(),
      rotatie: z.number(),
      schaal: z.number().positive(),
    })
  ),
});

export type CanvasData = z.infer<typeof canvasSchema>;

export const LEEG_CANVAS: CanvasData = {
  terrein: { breedteM: 20, diepteM: 15 },
  raster: 1,
  elementen: [],
};
