import type { Partner } from "@prisma/client";
import { PARTNER_TYPE_LABELS } from "@/lib/labels";
import { Veld, Button } from "@/components/ui";

export default function PartnerForm({
  action,
  partner,
}: {
  action: (fd: FormData) => Promise<void>;
  partner?: Partner;
}) {
  return (
    <form action={action} className="space-y-3">
      <Veld label="Naam *">
        <input name="naam" required defaultValue={partner?.naam} className="input" />
      </Veld>
      <Veld label="Type">
        <select name="type" defaultValue={partner?.type ?? "groenaannemer"} className="input">
          {Object.entries(PARTNER_TYPE_LABELS).map(([w, l]) => (
            <option key={w} value={w}>
              {l}
            </option>
          ))}
        </select>
      </Veld>
      <Veld label="Contact (naam, telefoon, e-mail)">
        <input name="contact" defaultValue={partner?.contact ?? ""} className="input" />
      </Veld>
      <Veld label="Tarieven">
        <textarea name="tarieven" rows={2} defaultValue={partner?.tarieven ?? ""} className="input" />
      </Veld>
      <Veld label="Notities">
        <textarea name="notities" rows={2} defaultValue={partner?.notities ?? ""} className="input" />
      </Veld>
      <Button>{partner ? "Wijzigingen opslaan" : "Partner toevoegen"}</Button>
    </form>
  );
}
