import type {
  ProjectFase,
  ProjectStatus,
  KlantType,
  WensBron,
  WensPrioriteit,
  TaakCategorie,
  SubsidieNiveau,
  RegelingStatus,
  AanvraagStatus,
  PakketStatus,
  OfferteStatus,
  MetingType,
  PartnerType,
  ElementCategorie,
  ElementSoort,
} from "@prisma/client";

export const FASEN: ProjectFase[] = [
  "kennismaking",
  "locatieanalyse",
  "samen_ontwerpen",
  "schetsontwerp",
  "definitief_ontwerp",
  "aanleg",
  "oplevering_beheer",
];

export const FASE_LABELS: Record<ProjectFase, string> = {
  kennismaking: "Kennismaking",
  locatieanalyse: "Locatieanalyse",
  samen_ontwerpen: "Samen ontwerpen",
  schetsontwerp: "Schetsontwerp",
  definitief_ontwerp: "Definitief ontwerp",
  aanleg: "Aanleg",
  oplevering_beheer: "Oplevering & beheer",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  actief: "Actief",
  gepauzeerd: "Gepauzeerd",
  afgerond: "Afgerond",
  verloren: "Verloren",
};

export const KLANT_TYPE_LABELS: Record<KlantType, string> = {
  school: "School",
  bso: "BSO / kinderopvang",
  particulier: "Particulier",
  recreatie: "Recreatie",
  gemeente: "Gemeente",
  anders: "Anders",
};

export const WENS_BRON_LABELS: Record<WensBron, string> = {
  kinderen: "Kinderen",
  team: "Team",
  ouders: "Ouders",
  schouw: "Schouw",
  opdrachtgever: "Opdrachtgever",
};

export const WENS_PRIORITEIT_LABELS: Record<WensPrioriteit, string> = {
  moet: "Moet",
  graag: "Graag",
  misschien: "Misschien",
};

export const TAAK_CATEGORIE_LABELS: Record<TaakCategorie, string> = {
  algemeen: "Algemeen",
  subsidie: "Subsidie",
  offerte: "Offerte",
  beheer: "Beheer",
  acquisitie: "Acquisitie",
};

export const SUBSIDIE_NIVEAU_LABELS: Record<SubsidieNiveau, string> = {
  landelijk: "Landelijk",
  provincie: "Provincie",
  gemeente: "Gemeente",
  waterschap: "Waterschap",
  fonds: "Fonds",
};

export const REGELING_STATUS_LABELS: Record<RegelingStatus, string> = {
  open: "Open",
  gesloten: "Gesloten",
  onzeker: "Onzeker",
};

export const AANVRAAG_STATUSSEN: AanvraagStatus[] = [
  "scan",
  "kansrijk",
  "in_voorbereiding",
  "ingediend",
  "toegekend",
  "afgewezen",
  "verantwoording",
  "afgerond",
];

export const AANVRAAG_STATUS_LABELS: Record<AanvraagStatus, string> = {
  scan: "Scan",
  kansrijk: "Kansrijk",
  in_voorbereiding: "In voorbereiding",
  ingediend: "Ingediend",
  toegekend: "Toegekend",
  afgewezen: "Afgewezen",
  verantwoording: "Verantwoording",
  afgerond: "Afgerond",
};

export const PAKKET_STATUS_LABELS: Record<PakketStatus, string> = {
  concept: "Concept",
  aangeboden: "Aangeboden",
  verkocht: "Verkocht",
};

export const OFFERTE_STATUS_LABELS: Record<OfferteStatus, string> = {
  concept: "Concept",
  verzonden: "Verzonden",
  geaccepteerd: "Geaccepteerd",
  afgewezen: "Afgewezen",
};

export const METING_TYPE_LABELS: Record<MetingType, string> = {
  nulmeting: "Nulmeting",
  jaartelling: "Jaartelling",
};

export const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
  groenaannemer: "Groenaannemer",
  toestelleverancier: "Toestelleverancier",
  kwekerij: "Kwekerij",
  keuringsinstantie: "Keuringsinstantie",
};

export const ELEMENT_CATEGORIE_LABELS: Record<ElementCategorie, string> = {
  klimmen: "Klimmen",
  water: "Water",
  groen: "Groen",
  rust: "Rust",
  moestuin: "Moestuin",
  pad: "Pad",
  terrein: "Terrein",
};

export const ELEMENT_SOORT_LABELS: Record<ElementSoort, string> = {
  speelaanleiding: "Speelaanleiding",
  speeltoestel: "Speeltoestel (keuringsplichtig)",
};

export function fmtEuro(bedrag: number | string | null | undefined): string {
  if (bedrag === null || bedrag === undefined) return "-";
  const n = typeof bedrag === "string" ? parseFloat(bedrag) : bedrag;
  if (Number.isNaN(n)) return "-";
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
}

export function fmtDatum(d: Date | string | null | undefined): string {
  if (!d) return "-";
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function isVerlopen(d: Date | null | undefined): boolean {
  if (!d) return false;
  return d.getTime() < Date.now();
}

/** Kleurcode voor laatstGecheckt: groen onder 3 maanden, oranje ouder. */
export function checkKleur(laatstGecheckt: Date): "groen" | "oranje" {
  const drieMaanden = 1000 * 60 * 60 * 24 * 91;
  return Date.now() - laatstGecheckt.getTime() < drieMaanden ? "groen" : "oranje";
}
