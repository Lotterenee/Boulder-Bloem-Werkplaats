import type { Plant } from "@prisma/client";
import { Veld, Button } from "@/components/ui";

export default function PlantForm({
  action,
  plant,
}: {
  action: (fd: FormData) => Promise<void>;
  plant?: Plant;
}) {
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <Veld label="Nederlandse naam *">
        <input name="naamNL" required defaultValue={plant?.naamNL} className="input" />
      </Veld>
      <Veld label="Wetenschappelijke naam">
        <input
          name="naamWetenschappelijk"
          defaultValue={plant?.naamWetenschappelijk ?? ""}
          className="input"
        />
      </Veld>
      <Veld label="Categorie">
        <input
          name="categorie"
          placeholder="boom, struik, kruid..."
          defaultValue={plant?.categorie ?? ""}
          className="input"
        />
      </Veld>
      <Veld label="Waardplant voor">
        <input name="waardplantVoor" defaultValue={plant?.waardplantVoor ?? ""} className="input" />
      </Veld>
      <Veld label="Bloeitijd">
        <input name="bloeitijd" defaultValue={plant?.bloeitijd ?? ""} className="input" />
      </Veld>
      <Veld label="Licht">
        <input name="licht" defaultValue={plant?.licht ?? ""} className="input" />
      </Veld>
      <Veld label="Bodem">
        <input name="bodem" defaultValue={plant?.bodem ?? ""} className="input" />
      </Veld>
      <div className="flex items-end gap-4">
        <label className="flex items-center gap-2 py-2 text-sm font-semibold">
          <input
            type="checkbox"
            name="inheems"
            defaultChecked={plant?.inheems}
            className="h-4 w-4 accent-moss"
          />
          Inheems
        </label>
        <label className="flex items-center gap-2 py-2 text-sm font-semibold text-clay-deep">
          <input
            type="checkbox"
            name="giftig"
            defaultChecked={plant?.giftig}
            className="h-4 w-4 accent-clay"
          />
          Giftig
        </label>
      </div>
      <div className="sm:col-span-2">
        <Button>{plant ? "Wijzigingen opslaan" : "Plant toevoegen"}</Button>
      </div>
    </form>
  );
}
