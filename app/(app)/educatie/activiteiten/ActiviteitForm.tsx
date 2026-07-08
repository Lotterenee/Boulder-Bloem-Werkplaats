import type { EducatieActiviteit } from "@prisma/client";
import { Veld, Button } from "@/components/ui";

export default function ActiviteitForm({
  action,
  activiteit,
}: {
  action: (fd: FormData) => Promise<void>;
  activiteit?: EducatieActiviteit;
}) {
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <Veld label="Titel *" className="sm:col-span-2">
        <input name="titel" required defaultValue={activiteit?.titel} className="input" />
      </Veld>
      <Veld label="Omschrijving" className="sm:col-span-2">
        <textarea
          name="omschrijving"
          rows={2}
          defaultValue={activiteit?.omschrijving ?? ""}
          className="input"
        />
      </Veld>
      <Veld label="Leeftijd van">
        <input
          name="leeftijdVan"
          type="number"
          min="0"
          defaultValue={activiteit?.leeftijdVan ?? ""}
          className="input"
        />
      </Veld>
      <Veld label="Leeftijd tot">
        <input
          name="leeftijdTot"
          type="number"
          min="0"
          defaultValue={activiteit?.leeftijdTot ?? ""}
          className="input"
        />
      </Veld>
      <Veld label="Seizoen">
        <input
          name="seizoen"
          placeholder="voorjaar, zomer, jaarrond..."
          defaultValue={activiteit?.seizoen ?? ""}
          className="input"
        />
      </Veld>
      <Veld label="Duur (minuten)">
        <input
          name="duurMinuten"
          type="number"
          min="1"
          defaultValue={activiteit?.duurMinuten ?? ""}
          className="input"
        />
      </Veld>
      <Veld label="Prijs (euro)">
        <input
          name="prijs"
          type="number"
          min="0"
          step="0.01"
          defaultValue={activiteit?.prijs?.toString() ?? ""}
          className="input"
        />
      </Veld>
      <Veld label="Doelen (vrij tekstveld)">
        <input name="doelen" defaultValue={activiteit?.doelen ?? ""} className="input" />
      </Veld>
      <Veld label="Benodigdheden" className="sm:col-span-2">
        <input
          name="benodigdheden"
          defaultValue={activiteit?.benodigdheden ?? ""}
          className="input"
        />
      </Veld>
      <div className="sm:col-span-2">
        <Button>{activiteit ? "Wijzigingen opslaan" : "Activiteit toevoegen"}</Button>
      </div>
    </form>
  );
}
