import type { ProjectFase } from "@prisma/client";
import { FASEN, FASE_LABELS } from "@/lib/labels";
import { setProjectFase } from "@/lib/actions/projecten";

/** De 7 projectfasen als klikbare stepper: klik zet Project.fase. */
export default function Stepper({
  projectId,
  huidigeFase,
}: {
  projectId: string;
  huidigeFase: ProjectFase;
}) {
  const huidigeIndex = FASEN.indexOf(huidigeFase);

  return (
    <ol
      className="mb-6 flex flex-wrap items-center gap-y-2 overflow-x-auto"
      aria-label="Projectfase"
    >
      {FASEN.map((fase, i) => {
        const actief = fase === huidigeFase;
        const geweest = i < huidigeIndex;
        const actie = setProjectFase.bind(null, projectId, fase);
        return (
          <li key={fase} className="flex items-center">
            {i > 0 && (
              <span
                aria-hidden
                className={`mx-1 h-px w-4 sm:w-6 ${geweest || actief ? "bg-moss" : "bg-sage"}`}
              />
            )}
            <form action={actie}>
              <button
                type="submit"
                aria-current={actief ? "step" : undefined}
                title={`Zet fase naar: ${FASE_LABELS[fase]}`}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  actief
                    ? "bg-moss text-white"
                    : geweest
                      ? "bg-sage-light text-moss-deep hover:bg-sage"
                      : "bg-paper text-ink-soft hover:bg-sage-light"
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                    actief
                      ? "bg-white text-moss"
                      : geweest
                        ? "bg-moss text-white"
                        : "bg-sage-light text-ink-soft"
                  }`}
                >
                  {geweest ? "✓" : i + 1}
                </span>
                {FASE_LABELS[fase]}
              </button>
            </form>
          </li>
        );
      })}
    </ol>
  );
}
