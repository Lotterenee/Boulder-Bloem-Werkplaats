import { createSubsidie } from "@/lib/actions/subsidies";
import { PageHeader, Card } from "@/components/ui";
import SubsidieForm from "../SubsidieForm";

export default function NieuweSubsidiePage() {
  return (
    <>
      <PageHeader
        titel="Nieuwe regeling"
        sub="De datum 'laatst gecheckt' wordt op vandaag gezet."
      />
      <Card className="max-w-3xl">
        <SubsidieForm action={createSubsidie} />
      </Card>
    </>
  );
}
