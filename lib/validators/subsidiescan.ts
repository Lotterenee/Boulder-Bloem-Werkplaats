import { z } from "zod";

/** Payload van het subsidiescan-formulier op de publieke Boulder Bloem-site. */
export const subsidiescanSchema = z.object({
  organisatie: z.string().min(1).max(200),
  type: z
    .enum(["school", "bso", "particulier", "recreatie", "gemeente", "anders"])
    .default("anders"),
  contactpersoon: z.string().max(200).optional(),
  email: z.string().email().max(200),
  telefoon: z.string().max(50).optional(),
  gemeente: z.string().min(1).max(100),
  plaats: z.string().max(100).optional(),
  bericht: z.string().max(2000).optional(),
});
