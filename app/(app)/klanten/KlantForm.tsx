import type { Klant } from "@prisma/client";
import { KLANT_TYPE_LABELS } from "@/lib/labels";
import { Veld, Button } from "@/components/ui";

export default function KlantForm({
  action,
  klant,
}: {
  action: (fd: FormData) => Promise<void>;
  klant?: Klant;
}) {
  return (
    <form action={action} className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <Veld label="Organisatie *">
        <input
          name="organisatie"
          required
          defaultValue={klant?.organisatie}
          className="input"
        />
      </Veld>
      <Veld label="Type *">
        <select name="type" required defaultValue={klant?.type ?? "school"} className="input">
          {Object.entries(KLANT_TYPE_LABELS).map(([waarde, label]) => (
            <option key={waarde} value={waarde}>
              {label}
            </option>
          ))}
        </select>
      </Veld>
      <Veld label="Contactpersoon">
        <input name="contactpersoon" defaultValue={klant?.contactpersoon ?? ""} className="input" />
      </Veld>
      <Veld label="E-mail">
        <input name="email" type="email" defaultValue={klant?.email ?? ""} className="input" />
      </Veld>
      <Veld label="Telefoon">
        <input name="telefoon" defaultValue={klant?.telefoon ?? ""} className="input" />
      </Veld>
      <Veld label="Adres">
        <input name="adres" defaultValue={klant?.adres ?? ""} className="input" />
      </Veld>
      <Veld label="Plaats">
        <input name="plaats" defaultValue={klant?.plaats ?? ""} className="input" />
      </Veld>
      <Veld label="Gemeente * (voor de subsidieradar)">
        <input name="gemeente" required defaultValue={klant?.gemeente} className="input" />
      </Veld>
      <Veld label="Notities" className="sm:col-span-2">
        <textarea name="notities" rows={3} defaultValue={klant?.notities ?? ""} className="input" />
      </Veld>
      <div className="sm:col-span-2">
        <Button>{klant ? "Wijzigingen opslaan" : "Klant aanmaken"}</Button>
      </div>
    </form>
  );
}
