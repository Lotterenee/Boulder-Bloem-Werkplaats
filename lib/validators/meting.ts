import { z } from "zod";

export const waarnemingenSchema = z.array(
  z.object({
    soortgroep: z.string().min(1),
    aantal: z.number().int().nonnegative(),
  })
);

export type Waarneming = z.infer<typeof waarnemingenSchema>[number];
