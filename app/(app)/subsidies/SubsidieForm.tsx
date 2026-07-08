import type { Subsidie } from "@prisma/client";
import { SUBSIDIE_NIVEAU_LABELS, REGELING_STATUS_LABELS } from "@/lib/labels";
import { Veld, Button } from "@/components/ui";

export default function SubsidieForm({
  action,
  subsidie,
}: {
  action: (fd: FormData) => Promise<void>;
  subsidie?: Subsidie;
}) {
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <Veld label="Naam *">
        <input name="naam" required defaultValue={subsidie?.naam} className="input" />
      </Veld>
      <Veld label="Verstrekker *">
        <input name="verstrekker" required defaultValue={subsidie?.verstrekker} className="input" />
      </Veld>
      <Veld label="Niveau">
        <select name="niveau" defaultValue={subsidie?.niveau ?? "fonds"} className="input">
          {Object.entries(SUBSIDIE_NIVEAU_LABELS).map(([w, l]) => (
            <option key={w} value={w}>
              {l}
            </option>
          ))}
        </select>
      </Veld>
      <Veld label="Regio (leeg = landelijk)">
        <input name="regio" defaultValue={subsidie?.regio ?? ""} className="input" />
      </Veld>
      <Veld label="Doelgroep">
        <input name="doelgroep" defaultValue={subsidie?.doelgroep ?? ""} className="input" />
      </Veld>
      <Veld label="Max bedrag (euro)">
        <input
          name="maxBedrag"
          type="number"
          min="0"
          step="0.01"
          defaultValue={subsidie?.maxBedrag?.toString() ?? ""}
          className="input"
        />
      </Veld>
      <Veld label="Percentage / cofinanciering">
        <input name="percentage" defaultValue={subsidie?.percentage ?? ""} className="input" />
      </Veld>
      <Veld label="Deadline">
        <input
          name="deadline"
          type="date"
          defaultValue={subsidie?.deadline?.toISOString().slice(0, 10) ?? ""}
          className="input"
        />
      </Veld>
      <div className="flex items-end gap-4">
        <label className="flex items-center gap-2 py-2 text-sm font-semibold">
          <input
            type="checkbox"
            name="doorlopend"
            defaultChecked={subsidie?.doorlopend}
            className="h-4 w-4 accent-moss"
          />
          Doorlopend aan te vragen
        </label>
      </div>
      <Veld label="Status regeling">
        <select name="status" defaultValue={subsidie?.status ?? "open"} className="input">
          {Object.entries(REGELING_STATUS_LABELS).map(([w, l]) => (
            <option key={w} value={w}>
              {l}
            </option>
          ))}
        </select>
      </Veld>
      <Veld label="Bronlink" className="sm:col-span-2">
        <input name="bronlink" type="url" defaultValue={subsidie?.bronlink ?? ""} className="input" />
      </Veld>
      <Veld label="Voorwaarden" className="sm:col-span-2">
        <textarea name="voorwaarden" rows={3} defaultValue={subsidie?.voorwaarden ?? ""} className="input" />
      </Veld>
      <div className="sm:col-span-2">
        <Button>{subsidie ? "Wijzigingen opslaan" : "Regeling toevoegen"}</Button>
      </div>
    </form>
  );
}
