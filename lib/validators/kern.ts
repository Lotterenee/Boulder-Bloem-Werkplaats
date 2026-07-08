import { z } from "zod";

export const klantSchema = z.object({
  organisatie: z.string().min(1, "Organisatie is verplicht"),
  type: z.enum(["school", "bso", "particulier", "recreatie", "gemeente", "anders"]),
  contactpersoon: z.string().nullable(),
  email: z.string().email().nullable().or(z.literal(null)),
  telefoon: z.string().nullable(),
  adres: z.string().nullable(),
  plaats: z.string().nullable(),
  // Gemeente is verplicht: de subsidieradar filtert hierop.
  gemeente: z.string().min(1, "Gemeente is verplicht"),
  notities: z.string().nullable(),
});

export const projectSchema = z.object({
  klantId: z.string().min(1, "Kies een klant"),
  naam: z.string().min(1, "Naam is verplicht"),
  fase: z.enum([
    "kennismaking",
    "locatieanalyse",
    "samen_ontwerpen",
    "schetsontwerp",
    "definitief_ontwerp",
    "aanleg",
    "oplevering_beheer",
  ]),
  status: z.enum(["actief", "gepauzeerd", "afgerond", "verloren"]),
  locatieadres: z.string().nullable(),
  oppervlakteM2: z.number().int().positive().nullable(),
  budgetIndicatie: z.number().nonnegative().nullable(),
  volgendeActie: z.string().nullable(),
  volgendeActieDatum: z.date().nullable(),
  samenvatting: z.string().nullable(),
});

export const wensSchema = z.object({
  projectId: z.string().min(1),
  bron: z.enum(["kinderen", "team", "ouders", "schouw", "opdrachtgever"]),
  tekst: z.string().min(1, "Omschrijf de wens"),
  prioriteit: z.enum(["moet", "graag", "misschien"]),
});

export const taakSchema = z.object({
  projectId: z.string().nullable(),
  titel: z.string().min(1, "Titel is verplicht"),
  categorie: z.enum(["algemeen", "subsidie", "offerte", "beheer", "acquisitie"]),
  deadline: z.date().nullable(),
});
