import { createKlant } from "@/lib/actions/klanten";
import { PageHeader, Card } from "@/components/ui";
import KlantForm from "../KlantForm";

export default function NieuweKlantPage() {
  return (
    <>
      <PageHeader titel="Nieuwe klant" />
      <Card className="max-w-3xl">
        <KlantForm action={createKlant} />
      </Card>
    </>
  );
}
