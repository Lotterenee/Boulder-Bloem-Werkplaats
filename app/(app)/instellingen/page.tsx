import { auth } from "@/lib/auth";
import { PageHeader, Card } from "@/components/ui";
import WachtwoordForm from "./WachtwoordForm";

export default async function InstellingenPage() {
  const session = await auth();

  return (
    <>
      <PageHeader
        titel="Instellingen"
        sub="Accountgegevens en wachtwoord"
      />
      <div className="grid max-w-3xl gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-lg text-moss-deep">Account</h2>
          <p className="text-sm text-ink-soft">Ingelogd als</p>
          <p className="font-semibold">{session?.user?.email}</p>
        </Card>
        <Card>
          <h2 className="mb-3 text-lg text-moss-deep">Wachtwoord wijzigen</h2>
          <WachtwoordForm />
        </Card>
      </div>
    </>
  );
}
