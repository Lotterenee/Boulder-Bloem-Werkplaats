"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  Stage,
  Layer,
  Rect,
  Line,
  Circle,
  Group,
  Text,
  Transformer,
} from "react-konva";
import type Konva from "konva";
import { saveCanvas, saveAlsNieuweVersie } from "@/lib/actions/ontwerpen";
import type { CanvasData } from "@/lib/validators/canvas";
import {
  type BibliotheekElement,
  CATEGORIE_KLEUREN,
  SCHAAL,
  vrijeZoneRadiusM,
} from "./types";
import { coachChecks } from "./coach";
import {
  SJABLONEN,
  laadSjabloon,
  wizardOntwerp,
  nieuwId,
  type WizardOpties,
} from "./sjablonen";

const CATEGORIE_LABELS: Record<string, string> = {
  klimmen: "Klimmen",
  water: "Water",
  groen: "Groen",
  rust: "Rust",
  moestuin: "Moestuin",
  pad: "Pad",
  terrein: "Terrein",
};

function euro(n: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(n);
}

function snap(meters: number): number {
  return Math.round(meters * 2) / 2; // op een half-meter raster
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}

type Props = {
  ontwerp: { id: string; naam: string; versie: number; canvas: CanvasData };
  bibliotheek: BibliotheekElement[];
  plantStats: { totaal: number; inheemsPct: number };
};

export default function Studio({ ontwerp, bibliotheek, plantStats }: Props) {
  const [canvas, setCanvas] = useState<CanvasData>(ontwerp.canvas);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [verleden, setVerleden] = useState<CanvasData[]>([]);
  const [toekomst, setToekomst] = useState<CanvasData[]>([]);
  const [opgeslagen, setOpgeslagen] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizard, setWizard] = useState<WizardOpties>({
    leeftijd: "basisschool",
    budget: 8000,
    metWater: true,
  });
  const [sjabloonKeuze, setSjabloonKeuze] = useState("");
  const [bezig, startTransition] = useTransition();

  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);

  const bibMap = useMemo(
    () => new Map(bibliotheek.map((b) => [b.id, b])),
    [bibliotheek]
  );

  function muteer(update: (prev: CanvasData) => CanvasData) {
    setCanvas((prev) => {
      setVerleden((v) => [...v.slice(-49), prev]);
      setToekomst([]);
      setOpgeslagen(false);
      return update(prev);
    });
  }

  function undo() {
    setVerleden((v) => {
      if (v.length === 0) return v;
      const vorige = v[v.length - 1];
      setCanvas((huidig) => {
        setToekomst((t) => [...t, huidig]);
        return vorige;
      });
      setOpgeslagen(false);
      return v.slice(0, -1);
    });
  }

  function redo() {
    setToekomst((t) => {
      if (t.length === 0) return t;
      const volgende = t[t.length - 1];
      setCanvas((huidig) => {
        setVerleden((v) => [...v, huidig]);
        return volgende;
      });
      setOpgeslagen(false);
      return t.slice(0, -1);
    });
  }

  // Transformer aan de selectie koppelen
  useEffect(() => {
    const stage = stageRef.current;
    const tr = trRef.current;
    if (!stage || !tr) return;
    const node = selectedId ? stage.findOne(`#${selectedId}`) : null;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedId, canvas]);

  // Toetsenbord: verwijderen + undo/redo
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const doel = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(doel.tagName)) return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        muteer((prev) => ({
          ...prev,
          elementen: prev.elementen.filter((el) => el.id !== selectedId),
        }));
        setSelectedId(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  function voegToe(elementId: string) {
    const offset = (canvas.elementen.length % 5) * 0.7;
    muteer((prev) => ({
      ...prev,
      elementen: [
        ...prev.elementen,
        {
          id: nieuwId(),
          elementId,
          x: snap(prev.terrein.breedteM / 2 + offset),
          y: snap(prev.terrein.diepteM / 2 + offset),
          rotatie: 0,
          schaal: 1,
        },
      ],
    }));
  }

  function opslaan() {
    startTransition(async () => {
      await saveCanvas(ontwerp.id, JSON.stringify(canvas));
      setOpgeslagen(true);
    });
  }

  function nieuweVersie() {
    startTransition(async () => {
      await saveAlsNieuweVersie(ontwerp.id, JSON.stringify(canvas));
    });
  }

  function exportPng() {
    setSelectedId(null);
    setTimeout(() => {
      const uri = stageRef.current?.toDataURL({ pixelRatio: 2 });
      if (!uri) return;
      const a = document.createElement("a");
      a.href = uri;
      a.download = `${ontwerp.naam.replace(/\s+/g, "-").toLowerCase()}-v${ontwerp.versie}.png`;
      a.click();
    }, 100);
  }

  // Materialenlijst + WAS-telling
  const materialen = useMemo(() => {
    const per = new Map<string, number>();
    for (const el of canvas.elementen) {
      per.set(el.elementId, (per.get(el.elementId) ?? 0) + 1);
    }
    const rijen = [...per.entries()]
      .map(([elementId, aantal]) => {
        const b = bibMap.get(elementId);
        return b
          ? { naam: b.naam, soort: b.soort, aantal, prijs: b.prijs, subtotaal: aantal * b.prijs }
          : { naam: "Onbekend element", soort: "speelaanleiding" as const, aantal, prijs: 0, subtotaal: 0 };
      })
      .sort((a, b) => a.naam.localeCompare(b.naam));
    const totaal = rijen.reduce((acc, r) => acc + r.subtotaal, 0);
    const toestellen = canvas.elementen.filter(
      (el) => bibMap.get(el.elementId)?.soort === "speeltoestel"
    ).length;
    return { rijen, totaal, toestellen, aanleidingen: canvas.elementen.length - toestellen };
  }, [canvas.elementen, bibMap]);

  const meldingen = useMemo(
    () => coachChecks(canvas, bibMap, plantStats),
    [canvas, bibMap, plantStats]
  );

  const perCategorie = useMemo(() => {
    const groepen = new Map<string, BibliotheekElement[]>();
    for (const b of bibliotheek) {
      const lijst = groepen.get(b.categorie) ?? [];
      lijst.push(b);
      groepen.set(b.categorie, lijst);
    }
    return [...groepen.entries()];
  }, [bibliotheek]);

  const stageB = canvas.terrein.breedteM * SCHAAL;
  const stageH = canvas.terrein.diepteM * SCHAAL;

  const knop =
    "rounded-lg border border-sage px-3 py-1.5 text-xs font-semibold text-moss-deep transition hover:bg-sage-light disabled:opacity-40";

  return (
    <div>
      {/* Werkbalk */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={opslaan} disabled={bezig || opgeslagen}
          className="rounded-lg bg-clay px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-clay-deep disabled:opacity-50">
          {bezig ? "Bezig..." : opgeslagen ? "Opgeslagen ✓" : "Opslaan"}
        </button>
        <button type="button" onClick={nieuweVersie} disabled={bezig} className={knop}>
          Opslaan als v{ontwerp.versie + 1}
        </button>
        <button type="button" onClick={exportPng} className={knop}>
          PNG exporteren
        </button>
        <span className="mx-1 h-5 w-px bg-sage" aria-hidden />
        <button type="button" onClick={undo} disabled={verleden.length === 0} className={knop} title="Ongedaan maken (Ctrl+Z)">
          ↩ Ongedaan
        </button>
        <button type="button" onClick={redo} disabled={toekomst.length === 0} className={knop} title="Opnieuw (Ctrl+Y)">
          ↪ Opnieuw
        </button>
        {selectedId && (
          <button
            type="button"
            className={knop}
            onClick={() => {
              muteer((prev) => ({
                ...prev,
                elementen: prev.elementen.filter((el) => el.id !== selectedId),
              }));
              setSelectedId(null);
            }}
          >
            ✕ Verwijder selectie
          </button>
        )}
        <span className="mx-1 h-5 w-px bg-sage" aria-hidden />
        <label className="text-xs font-semibold text-ink-soft">
          Terrein
          <input
            type="number" min={2} max={500} value={canvas.terrein.breedteM}
            onChange={(e) =>
              muteer((prev) => ({
                ...prev,
                terrein: { ...prev.terrein, breedteM: clamp(Number(e.target.value) || 2, 2, 500) },
              }))
            }
            className="input ml-1 inline-block w-16 px-2 py-1"
            aria-label="Terreinbreedte in meters"
          />
          {" x "}
          <input
            type="number" min={2} max={500} value={canvas.terrein.diepteM}
            onChange={(e) =>
              muteer((prev) => ({
                ...prev,
                terrein: { ...prev.terrein, diepteM: clamp(Number(e.target.value) || 2, 2, 500) },
              }))
            }
            className="input inline-block w-16 px-2 py-1"
            aria-label="Terreindiepte in meters"
          />{" "}
          m (raster 1 m)
        </label>
        <span className="mx-1 h-5 w-px bg-sage" aria-hidden />
        <select
          value={sjabloonKeuze}
          onChange={(e) => setSjabloonKeuze(e.target.value)}
          className="input inline-block w-auto px-2 py-1 text-xs"
          aria-label="Sjabloon kiezen"
        >
          <option value="">Sjabloon...</option>
          {SJABLONEN.map((s, i) => (
            <option key={s.naam} value={String(i)} title={s.beschrijving}>
              {s.naam}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={knop}
          disabled={sjabloonKeuze === ""}
          onClick={() => {
            const s = SJABLONEN[Number(sjabloonKeuze)];
            if (!s) return;
            if (
              canvas.elementen.length > 0 &&
              !confirm("Sjabloon laden vervangt het huidige canvas. Doorgaan?")
            )
              return;
            muteer(() => laadSjabloon(s, bibliotheek));
            setSelectedId(null);
          }}
        >
          Laden
        </button>
        <button type="button" className={knop} onClick={() => setWizardOpen((v) => !v)}>
          ✨ Ontwerphulp
        </button>
      </div>

      {wizardOpen && (
        <div className="mb-3 flex flex-wrap items-end gap-3 rounded-xl border border-sage/60 bg-paper p-4">
          <label className="block text-xs font-semibold">
            Leeftijdsgroep
            <select
              value={wizard.leeftijd}
              onChange={(e) => setWizard((w) => ({ ...w, leeftijd: e.target.value as WizardOpties["leeftijd"] }))}
              className="input mt-1"
            >
              <option value="peuters">Peuters (0 tot 4)</option>
              <option value="basisschool">Basisschool (4 tot 12)</option>
              <option value="gemengd">Gemengd</option>
            </select>
          </label>
          <label className="block text-xs font-semibold">
            Budget (euro)
            <input
              type="number" min={0} step={100} value={wizard.budget}
              onChange={(e) => setWizard((w) => ({ ...w, budget: Number(e.target.value) || 0 }))}
              className="input mt-1 w-28"
            />
          </label>
          <label className="flex items-center gap-2 py-2 text-xs font-semibold">
            <input
              type="checkbox" checked={wizard.metWater}
              onChange={(e) => setWizard((w) => ({ ...w, metWater: e.target.checked }))}
              className="h-4 w-4 accent-moss"
            />
            Met water
          </label>
          <button
            type="button"
            className="rounded-lg bg-clay px-4 py-2 text-sm font-semibold text-white transition hover:bg-clay-deep"
            onClick={() => {
              if (
                canvas.elementen.length > 0 &&
                !confirm("De ontwerphulp vervangt de huidige elementen. Doorgaan?")
              )
                return;
              muteer((prev) => ({
                ...prev,
                elementen: wizardOntwerp(wizard, prev.terrein, bibliotheek),
              }));
              setSelectedId(null);
              setWizardOpen(false);
            }}
          >
            Genereer startopzet
          </button>
          <p className="w-full text-xs text-ink-soft">
            Kiest binnen het budget een gevarieerde set elementen en zet ze met
            valruimte gespreid neer; daarna schuif je alles naar wens.
          </p>
        </div>
      )}

      <div className="flex gap-4">
        {/* Palet */}
        <aside className="no-print w-52 shrink-0 space-y-3 overflow-y-auto rounded-xl border border-sage/60 bg-paper p-3" style={{ maxHeight: 640 }}>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">
            Elementen (klik = plaats)
          </p>
          {perCategorie.map(([categorie, lijst]) => (
            <div key={categorie}>
              <p className="mb-1 text-xs font-bold text-moss-deep">
                {CATEGORIE_LABELS[categorie] ?? categorie}
              </p>
              <div className="space-y-1">
                {lijst.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => voegToe(b.id)}
                    className="flex w-full items-center gap-2 rounded-lg border border-sage/50 px-2 py-1.5 text-left text-xs transition hover:border-clay hover:bg-cream"
                    title={`${b.breedteM} x ${b.diepteM} m · ${euro(b.prijs)}${b.valruimteM > 0 ? ` · valruimte ${b.valruimteM} m` : ""}`}
                  >
                    <span
                      className="inline-block h-3.5 w-3.5 shrink-0 rounded"
                      style={{
                        backgroundColor: CATEGORIE_KLEUREN[b.categorie]?.fill,
                        border: `2px solid ${CATEGORIE_KLEUREN[b.categorie]?.stroke}`,
                      }}
                    />
                    <span className="min-w-0 flex-1 truncate font-semibold">{b.naam}</span>
                    {b.soort === "speeltoestel" && (
                      <span className="shrink-0 rounded bg-clay-soft px-1 text-[10px] font-bold text-clay-deep" title="Keuringsplichtig (WAS 2023)">
                        WAS
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Canvas */}
        <div className="min-w-0 flex-1 overflow-auto rounded-xl border border-sage/60 bg-paper p-2" style={{ maxHeight: 640 }}>
          <Stage
            ref={stageRef}
            width={stageB}
            height={stageH}
            onMouseDown={(e) => {
              if (e.target === e.target.getStage()) setSelectedId(null);
            }}
          >
            {/* Terrein + raster (niet interactief) */}
            <Layer listening={false}>
              <Rect x={0} y={0} width={stageB} height={stageH} fill="#F4EFE2" />
              {Array.from({ length: canvas.terrein.breedteM + 1 }, (_, i) => (
                <Line
                  key={`v${i}`}
                  points={[i * SCHAAL, 0, i * SCHAAL, stageH]}
                  stroke="#CBD6C2"
                  strokeWidth={i % 5 === 0 ? 1.2 : 0.5}
                />
              ))}
              {Array.from({ length: canvas.terrein.diepteM + 1 }, (_, i) => (
                <Line
                  key={`h${i}`}
                  points={[0, i * SCHAAL, stageB, i * SCHAAL]}
                  stroke="#CBD6C2"
                  strokeWidth={i % 5 === 0 ? 1.2 : 0.5}
                />
              ))}
              <Rect x={0} y={0} width={stageB} height={stageH} stroke="#7E8C6A" strokeWidth={2} />
            </Layer>

            {/* Valruimte-ringen */}
            <Layer listening={false}>
              {canvas.elementen.map((el) => {
                const b = bibMap.get(el.elementId);
                if (!b || b.valruimteM <= 0) return null;
                return (
                  <Circle
                    key={`ring-${el.id}`}
                    x={el.x * SCHAAL}
                    y={el.y * SCHAAL}
                    radius={vrijeZoneRadiusM(b, el.schaal) * SCHAAL}
                    fill="rgba(201, 142, 112, 0.15)"
                    stroke="#C98E70"
                    strokeWidth={1.5}
                    dash={[8, 6]}
                  />
                );
              })}
            </Layer>

            {/* Elementen */}
            <Layer>
              {canvas.elementen.map((el) => {
                const b = bibMap.get(el.elementId);
                if (!b) return null;
                const kleur = CATEGORIE_KLEUREN[b.categorie] ?? CATEGORIE_KLEUREN.groen;
                const w = b.breedteM * SCHAAL;
                const h = b.diepteM * SCHAAL;
                return (
                  <Group
                    key={el.id}
                    id={el.id}
                    x={el.x * SCHAAL}
                    y={el.y * SCHAAL}
                    rotation={el.rotatie}
                    scaleX={el.schaal}
                    scaleY={el.schaal}
                    draggable
                    onClick={() => setSelectedId(el.id)}
                    onTap={() => setSelectedId(el.id)}
                    onDragStart={() => setSelectedId(el.id)}
                    onDragEnd={(e) => {
                      const nx = snap(e.target.x() / SCHAAL);
                      const ny = snap(e.target.y() / SCHAAL);
                      muteer((prev) => ({
                        ...prev,
                        elementen: prev.elementen.map((p) =>
                          p.id === el.id ? { ...p, x: nx, y: ny } : p
                        ),
                      }));
                    }}
                    onTransformEnd={(e) => {
                      const node = e.target;
                      const schaal = clamp(node.scaleX(), 0.3, 4);
                      const rotatie = Math.round(node.rotation());
                      const nx = snap(node.x() / SCHAAL);
                      const ny = snap(node.y() / SCHAAL);
                      muteer((prev) => ({
                        ...prev,
                        elementen: prev.elementen.map((p) =>
                          p.id === el.id ? { ...p, schaal, rotatie, x: nx, y: ny } : p
                        ),
                      }));
                    }}
                  >
                    <Rect
                      width={w}
                      height={h}
                      offsetX={w / 2}
                      offsetY={h / 2}
                      cornerRadius={8}
                      fill={kleur.fill}
                      stroke={selectedId === el.id ? "#B0714F" : kleur.stroke}
                      strokeWidth={b.soort === "speeltoestel" ? 2.5 : 1.5}
                    />
                    <Text
                      text={b.naam}
                      width={w}
                      offsetX={w / 2}
                      offsetY={6}
                      align="center"
                      fontSize={11}
                      fontStyle="bold"
                      fill="#3A352F"
                      listening={false}
                    />
                  </Group>
                );
              })}
              <Transformer
                ref={trRef}
                rotateEnabled
                keepRatio
                enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
                anchorStroke="#B0714F"
                anchorFill="#FFFDF8"
                borderStroke="#B0714F"
                boundBoxFunc={(oud, nieuw) =>
                  nieuw.width < 12 || nieuw.height < 12 ? oud : nieuw
                }
              />
            </Layer>
          </Stage>
        </div>

        {/* Materialen & coach */}
        <aside className="no-print w-72 shrink-0 space-y-4 overflow-y-auto" style={{ maxHeight: 640 }}>
          <div className="rounded-xl border border-sage/60 bg-paper p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">
              Telling WAS 2023
            </p>
            <div className="flex gap-3 text-sm">
              <div className="flex-1 rounded-lg bg-water/40 p-2 text-center">
                <p className="font-heading text-2xl text-moss-deep">{materialen.aanleidingen}</p>
                <p className="text-xs">speelaanleidingen</p>
              </div>
              <div className="flex-1 rounded-lg bg-clay-soft p-2 text-center">
                <p className="font-heading text-2xl text-clay-deep">{materialen.toestellen}</p>
                <p className="text-xs">toestellen (keuring)</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-sage/60 bg-paper p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">
              Materialen & prijsindicatie
            </p>
            {materialen.rijen.length === 0 ? (
              <p className="text-sm text-ink-soft">Nog geen elementen geplaatst.</p>
            ) : (
              <>
                <ul className="divide-y divide-sage/30 text-sm">
                  {materialen.rijen.map((r) => (
                    <li key={r.naam} className="flex justify-between gap-2 py-1.5">
                      <span>
                        {r.aantal} x {r.naam}
                      </span>
                      <span className="font-semibold">{euro(r.subtotaal)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 flex justify-between border-t-2 border-moss-deep pt-2 text-sm font-bold text-moss-deep">
                  <span>Totaal (indicatie)</span>
                  <span>{euro(materialen.totaal)}</span>
                </p>
              </>
            )}
            <p className="mt-3 flex justify-between text-sm">
              <span>Beplanting inheems</span>
              <span className={`font-bold ${plantStats.inheemsPct >= 50 ? "text-moss" : "text-clay-deep"}`}>
                {plantStats.totaal === 0 ? "-" : `${plantStats.inheemsPct}%`}
              </span>
            </p>
          </div>

          <div className="rounded-xl border border-sage/60 bg-paper p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">
              Ontwerpcoach
            </p>
            <ul className="space-y-2 text-xs">
              {meldingen.map((m, i) => (
                <li
                  key={i}
                  className={`rounded-lg p-2 ${
                    m.niveau === "waarschuwing"
                      ? "bg-clay-soft text-clay-deep"
                      : m.niveau === "info"
                        ? "bg-water/40 text-moss-night"
                        : "bg-sage-light text-moss-deep"
                  }`}
                >
                  {m.niveau === "waarschuwing" ? "⚠ " : m.niveau === "info" ? "ℹ " : "✓ "}
                  {m.tekst}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Parallelle lijst voor screenreaders */}
      <ul className="sr-only" aria-label="Geplaatste elementen op het canvas">
        {canvas.elementen.map((el) => {
          const b = bibMap.get(el.elementId);
          return (
            <li key={el.id}>
              {b?.naam ?? "Onbekend element"} op {el.x} bij {el.y} meter, rotatie{" "}
              {el.rotatie} graden
            </li>
          );
        })}
      </ul>
    </div>
  );
}
