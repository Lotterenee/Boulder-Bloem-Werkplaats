import type { Klant, Project } from "@prisma/client";
import { FASE_LABELS, PROJECT_STATUS_LABELS } from "@/lib/labels";
import { Veld, Button } from "@/components/ui";

function datumWaarde(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export default function ProjectForm({
  action,
  klanten,
  project,
  klantIdVooraf,
}: {
  action: (fd: FormData) => Promise<void>;
  klanten: Pick<Klant, "id" | "organisatie">[];
  project?: Project;
  klantIdVooraf?: string;
}) {
  return (
    <form action={action} className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <Veld label="Projectnaam *">
        <input name="naam" required defaultValue={project?.naam} className="input" />
      </Veld>
      <Veld label="Klant *">
        <select
          name="klantId"
          required
          defaultValue={project?.klantId ?? klantIdVooraf ?? ""}
          className="input"
        >
          <option value="" disabled>
            Kies een klant...
          </option>
          {klanten.map((k) => (
            <option key={k.id} value={k.id}>
              {k.organisatie}
            </option>
          ))}
        </select>
      </Veld>
      <Veld label="Fase">
        <select name="fase" defaultValue={project?.fase ?? "kennismaking"} className="input">
          {Object.entries(FASE_LABELS).map(([waarde, label]) => (
            <option key={waarde} value={waarde}>
              {label}
            </option>
          ))}
        </select>
      </Veld>
      <Veld label="Status">
        <select name="status" defaultValue={project?.status ?? "actief"} className="input">
          {Object.entries(PROJECT_STATUS_LABELS).map(([waarde, label]) => (
            <option key={waarde} value={waarde}>
              {label}
            </option>
          ))}
        </select>
      </Veld>
      <Veld label="Locatieadres">
        <input name="locatieadres" defaultValue={project?.locatieadres ?? ""} className="input" />
      </Veld>
      <Veld label="Oppervlakte (m2)">
        <input
          name="oppervlakteM2"
          type="number"
          min="1"
          defaultValue={project?.oppervlakteM2 ?? ""}
          className="input"
        />
      </Veld>
      <Veld label="Budgetindicatie (euro)">
        <input
          name="budgetIndicatie"
          type="number"
          min="0"
          step="0.01"
          defaultValue={project?.budgetIndicatie?.toString() ?? ""}
          className="input"
        />
      </Veld>
      <div className="grid grid-cols-2 gap-2 sm:col-span-1">
        <Veld label="Volgende actie">
          <input name="volgendeActie" defaultValue={project?.volgendeActie ?? ""} className="input" />
        </Veld>
        <Veld label="Actiedatum">
          <input
            name="volgendeActieDatum"
            type="date"
            defaultValue={datumWaarde(project?.volgendeActieDatum)}
            className="input"
          />
        </Veld>
      </div>
      <Veld label="Samenvatting" className="sm:col-span-2">
        <textarea
          name="samenvatting"
          rows={3}
          defaultValue={project?.samenvatting ?? ""}
          className="input"
        />
      </Veld>
      <div className="sm:col-span-2">
        <Button>{project ? "Wijzigingen opslaan" : "Project aanmaken"}</Button>
      </div>
    </form>
  );
}
