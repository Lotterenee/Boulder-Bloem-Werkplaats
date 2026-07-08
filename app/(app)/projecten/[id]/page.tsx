import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PROJECT_STATUS_LABELS } from "@/lib/labels";
import { PageHeader, Badge } from "@/components/ui";
import Stepper from "./Stepper";
import OverzichtTab from "./tabs/OverzichtTab";
import WensenTab from "./tabs/WensenTab";
import TakenTab from "./tabs/TakenTab";
import SubsidiesTab from "./tabs/SubsidiesTab";
import OntwerpTab from "./tabs/OntwerpTab";
import EducatieTab from "./tabs/EducatieTab";
import OfferteTab from "./tabs/OfferteTab";
import MetingenTab from "./tabs/MetingenTab";
import BeheerTab from "./tabs/BeheerTab";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "overzicht", label: "Overzicht" },
  { key: "wensen", label: "Wensen" },
  { key: "taken", label: "Taken" },
  { key: "subsidies", label: "Subsidies" },
  { key: "ontwerp", label: "Ontwerp" },
  { key: "educatie", label: "Educatie" },
  { key: "offerte", label: "Offerte" },
  { key: "metingen", label: "Metingen" },
  { key: "beheer", label: "Beheer" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ id }, { tab }] = await Promise.all([params, searchParams]);
  const project = await prisma.project.findUnique({
    where: { id },
    include: { klant: true },
  });
  if (!project) notFound();

  const actieveTab: TabKey = TABS.some((t) => t.key === tab)
    ? (tab as TabKey)
    : "overzicht";

  return (
    <>
      <PageHeader
        titel={project.naam}
        sub={`${project.klant.organisatie} · ${project.klant.gemeente}`}
      >
        <Badge tint={project.status === "actief" ? "moss" : "grijs"}>
          {PROJECT_STATUS_LABELS[project.status]}
        </Badge>
      </PageHeader>

      <Stepper projectId={project.id} huidigeFase={project.fase} />

      <nav
        className="mb-6 flex flex-wrap gap-1 border-b border-sage/60"
        aria-label="Projectonderdelen"
      >
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/projecten/${project.id}?tab=${t.key}`}
            aria-current={actieveTab === t.key ? "page" : undefined}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
              actieveTab === t.key
                ? "border border-b-0 border-sage/60 bg-paper text-moss-deep"
                : "text-ink-soft hover:text-moss-deep"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {actieveTab === "overzicht" && <OverzichtTab project={project} />}
      {actieveTab === "wensen" && <WensenTab projectId={project.id} />}
      {actieveTab === "taken" && <TakenTab projectId={project.id} />}
      {actieveTab === "subsidies" && (
        <SubsidiesTab projectId={project.id} gemeente={project.klant.gemeente} />
      )}
      {actieveTab === "ontwerp" && <OntwerpTab projectId={project.id} />}
      {actieveTab === "educatie" && <EducatieTab projectId={project.id} />}
      {actieveTab === "offerte" && <OfferteTab projectId={project.id} />}
      {actieveTab === "metingen" && <MetingenTab projectId={project.id} />}
      {actieveTab === "beheer" && <BeheerTab projectId={project.id} />}
    </>
  );
}
