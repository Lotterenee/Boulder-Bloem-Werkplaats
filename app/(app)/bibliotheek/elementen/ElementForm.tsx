import type { Element } from "@prisma/client";
import { ELEMENT_CATEGORIE_LABELS, ELEMENT_SOORT_LABELS } from "@/lib/labels";
import { Veld, Button } from "@/components/ui";

export default function ElementForm({
  action,
  element,
}: {
  action: (fd: FormData) => Promise<void>;
  element?: Element;
}) {
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <Veld label="Naam *" className="sm:col-span-2">
        <input name="naam" required defaultValue={element?.naam} className="input" />
      </Veld>
      <Veld label="Categorie">
        <select name="categorie" defaultValue={element?.categorie ?? "groen"} className="input">
          {Object.entries(ELEMENT_CATEGORIE_LABELS).map(([w, l]) => (
            <option key={w} value={w}>
              {l}
            </option>
          ))}
        </select>
      </Veld>
      <Veld label="Soort (WAS 2023)">
        <select name="soort" defaultValue={element?.soort ?? "speelaanleiding"} className="input">
          {Object.entries(ELEMENT_SOORT_LABELS).map(([w, l]) => (
            <option key={w} value={w}>
              {l}
            </option>
          ))}
        </select>
      </Veld>
      <Veld label="Breedte (m)">
        <input
          name="standaardBreedteM"
          type="number"
          min="0.1"
          step="0.1"
          defaultValue={element?.standaardBreedteM?.toString() ?? ""}
          className="input"
        />
      </Veld>
      <Veld label="Diepte (m)">
        <input
          name="standaardDiepteM"
          type="number"
          min="0.1"
          step="0.1"
          defaultValue={element?.standaardDiepteM?.toString() ?? ""}
          className="input"
        />
      </Veld>
      <Veld label="Valruimte-straal (m)">
        <input
          name="valruimteM"
          type="number"
          min="0"
          step="0.1"
          defaultValue={element?.valruimteM?.toString() ?? ""}
          className="input"
        />
      </Veld>
      <Veld label="Indicatieprijs (euro)">
        <input
          name="indicatieprijs"
          type="number"
          min="0"
          step="0.01"
          defaultValue={element?.indicatieprijs?.toString() ?? ""}
          className="input"
        />
      </Veld>
      <div className="sm:col-span-2">
        <Button>{element ? "Wijzigingen opslaan" : "Element toevoegen"}</Button>
      </div>
    </form>
  );
}
