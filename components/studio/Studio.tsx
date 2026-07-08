"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  Stage, Layer, Rect, Line, Circle, Group, Text, Transformer,
} from "react-konva";
import type Konva from "konva";
import {
  saveCanvas, saveAlsNieuweVersie, createEigenSjabloon,
  deleteEigenSjabloon, pakketNaarOfferte,
} from "@/lib/actions/ontwerpen";
import type { CanvasData } from "@/lib/validators/canvas";
import {
  type BibliotheekElement, type BibliotheekPlant, type StudioZone, type StudioPakket,
  CATEGORIE_KLEUREN, SCHAAL, vrijeZoneRadiusM, plantRadiusM,
} from "./types";
import { coachChecks } from "./coach";
import {
  nieuwId, plaatsZone, plaatsPakket, pakketDekking, wizardOntwerp,
  selectieAlsRegels, type WizardOpties,
} from "./sjablonen";
import {
  plantStatus, STATUS_KLEUREN, bloeiboog, MAANDEN_VOLUIT,
} from "@/lib/domain/bloei";
import { BloeiStrip, BloeiBoog } from "./Bloeionderdelen";

function euro(n: number): string {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", minimumFractionDigits: 0 }).format(n);
}
function snap(m: number): number { return Math.round(m * 2) / 2; }
function clamp(v: number, min: number, max: number): number { return Math.min(Math.max(v, min), max); }

type Sel = { id: string; type: "element" | "plant" } | null;

type Props = {
  ontwerp: { id: string; naam: string; versie: number; canvas: CanvasData };
  bibliotheek: BibliotheekElement[];
  plantBibliotheek: BibliotheekPlant[];
  zones: StudioZone[];
  pakketten: StudioPakket[];
};

const knop =
  "rounded-lg border border-sage px-3 py-1.5 text-xs font-semibold text-moss-deep transition hover:bg-sage-light disabled:opacity-40";

export default function Studio({ ontwerp, bibliotheek, plantBibliotheek, zones, pakketten }: Props) {
  const [canvas, setCanvas] = useState<CanvasData>(ontwerp.canvas);
  const [sel, setSel] = useState<Sel>(null);
  const [verleden, setVerleden] = useState<CanvasData[]>([]);
  const [toekomst, setToekomst] = useState<CanvasData[]>([]);
  const [opgeslagen, setOpgeslagen] = useState(true);
  const [bezig, startTransition] = useTransition();

  const [maand, setMaand] = useState<number | null>(null); // null = Hele jaar
  const [snapAan, setSnapAan] = useState(true);
  const [palet, setPalet] = useState<"elementen" | "planten" | "zones" | "pakketten">("elementen");
  const [zijbalk, setZijbalk] = useState<"ontwerp" | "coach" | "selectie">("ontwerp");
  const [filterMaand, setFilterMaand] = useState(false);
  const [filterWintergroen, setFilterWintergroen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizard, setWizard] = useState<WizardOpties>({ leeftijd: "basisschool", budget: 12000, metWater: true, winterGroen: false });

  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);

  const bibMap = useMemo(() => new Map(bibliotheek.map((b) => [b.id, b])), [bibliotheek]);
  const plantMap = useMemo(() => new Map(plantBibliotheek.map((p) => [p.id, p])), [plantBibliotheek]);
  const snapM = (m: number) => (snapAan ? snap(m) : Math.round(m * 100) / 100);

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
      setCanvas((huidig) => { setToekomst((t) => [...t, huidig]); return v[v.length - 1]; });
      setOpgeslagen(false);
      return v.slice(0, -1);
    });
    setSel(null);
  }
  function redo() {
    setToekomst((t) => {
      if (t.length === 0) return t;
      setCanvas((huidig) => { setVerleden((v) => [...v, huidig]); return t[t.length - 1]; });
      setOpgeslagen(false);
      return t.slice(0, -1);
    });
    setSel(null);
  }

  // Transformer alleen voor element-selectie.
  useEffect(() => {
    const stage = stageRef.current, tr = trRef.current;
    if (!stage || !tr) return;
    const node = sel?.type === "element" ? stage.findOne(`#${sel.id}`) : null;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [sel, canvas]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const doel = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(doel.tagName)) return;
      if ((e.key === "Delete" || e.key === "Backspace") && sel) {
        e.preventDefault(); verwijderSelectie();
      }
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === "d") { e.preventDefault(); dupliceer(); }
      if ((e.ctrlKey || e.metaKey) && k === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (k === "y" || (k === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel, canvas]);

  function verwijderSelectie() {
    if (!sel) return;
    muteer((prev) =>
      sel.type === "element"
        ? { ...prev, elementen: prev.elementen.filter((e) => e.id !== sel.id) }
        : { ...prev, beplanting: prev.beplanting.filter((b) => b.id !== sel.id) }
    );
    setSel(null);
  }

  function dupliceer() {
    if (!sel) return;
    if (sel.type === "element") {
      const el = canvas.elementen.find((e) => e.id === sel.id);
      if (!el) return;
      const nid = nieuwId();
      muteer((prev) => ({ ...prev, elementen: [...prev.elementen, { ...el, id: nid, x: snapM(el.x + 1), y: snapM(el.y + 1) }] }));
      setSel({ id: nid, type: "element" });
    } else {
      const pl = canvas.beplanting.find((b) => b.id === sel.id);
      if (!pl) return;
      const nid = nieuwId();
      muteer((prev) => ({ ...prev, beplanting: [...prev.beplanting, { ...pl, id: nid, x: snapM(pl.x + 0.7), y: snapM(pl.y + 0.7) }] }));
      setSel({ id: nid, type: "plant" });
    }
  }

  function voegElement(elementId: string) {
    const offset = (canvas.elementen.length % 5) * 0.7;
    const nid = nieuwId();
    muteer((prev) => ({
      ...prev,
      elementen: [...prev.elementen, { id: nid, elementId, x: snapM(prev.terrein.breedteM / 2 + offset), y: snapM(prev.terrein.diepteM / 2 + offset), rotatie: 0, schaal: 1 }],
    }));
    setSel({ id: nid, type: "element" });
  }
  function voegPlant(plantId: string) {
    const offset = (canvas.beplanting.length % 6) * 0.6;
    const nid = nieuwId();
    muteer((prev) => ({
      ...prev,
      beplanting: [...prev.beplanting, { id: nid, plantId, x: snapM(prev.terrein.breedteM / 2 + offset), y: snapM(prev.terrein.diepteM / 2 + offset) }],
    }));
    setSel({ id: nid, type: "plant" });
  }
  function voegZone(zone: StudioZone) {
    const toev = plaatsZone(zone, Math.max(1, canvas.terrein.breedteM / 2 - 3), Math.max(1, canvas.terrein.diepteM / 2 - 3), bibMap, plantMap);
    muteer((prev) => ({ ...prev, elementen: [...prev.elementen, ...toev.elementen], beplanting: [...prev.beplanting, ...toev.beplanting] }));
    setSel(null);
  }
  function voegPakket(pakket: StudioPakket) {
    const toev = plaatsPakket(pakket, 1, Math.max(1, canvas.terrein.diepteM - 3), plantMap);
    muteer((prev) => ({ ...prev, beplanting: [...prev.beplanting, ...toev] }));
    setSel(null);
  }

  function opslaan() {
    startTransition(async () => { await saveCanvas(ontwerp.id, JSON.stringify(canvas)); setOpgeslagen(true); });
  }
  function nieuweVersie() {
    startTransition(async () => { await saveAlsNieuweVersie(ontwerp.id, JSON.stringify(canvas)); });
  }
  function exportPng() {
    setSel(null);
    setTimeout(() => {
      const uri = stageRef.current?.toDataURL({ pixelRatio: 2 });
      if (!uri) return;
      const a = document.createElement("a");
      a.href = uri; a.download = `${ontwerp.naam.replace(/\s+/g, "-").toLowerCase()}-v${ontwerp.versie}.png`;
      a.click();
    }, 100);
  }
  function bewaarAlsSjabloon() {
    const naam = prompt("Naam voor dit eigen sjabloon:", "Mijn opstelling");
    if (naam === null) return;
    const regels = selectieAlsRegels(canvas.elementen, canvas.beplanting);
    if (regels.length === 0) { alert("Plaats eerst elementen of planten."); return; }
    const thumb = stageRef.current?.toDataURL({ pixelRatio: 0.3 }) ?? null;
    startTransition(async () => { await createEigenSjabloon(ontwerp.id, naam, JSON.stringify(regels), thumb); });
  }

  // Afgeleide gegevens
  const materialen = useMemo(() => {
    const per = new Map<string, number>();
    for (const el of canvas.elementen) per.set(el.elementId, (per.get(el.elementId) ?? 0) + 1);
    const rijen = [...per.entries()].map(([elementId, aantal]) => {
      const b = bibMap.get(elementId);
      return b ? { naam: b.naam, aantal, subtotaal: aantal * b.prijs } : { naam: "Onbekend", aantal, subtotaal: 0 };
    }).sort((a, b) => a.naam.localeCompare(b.naam));
    const totaal = rijen.reduce((s, r) => s + r.subtotaal, 0);
    const toestellen = canvas.elementen.filter((el) => bibMap.get(el.elementId)?.soort === "speeltoestel").length;
    return { rijen, totaal, toestellen, aanleidingen: canvas.elementen.length - toestellen };
  }, [canvas.elementen, bibMap]);

  const plantStats = useMemo(() => {
    const soorten = new Map<string, BibliotheekPlant>();
    let inheems = 0;
    for (const b of canvas.beplanting) {
      const p = plantMap.get(b.plantId);
      if (!p) continue;
      soorten.set(p.id, p);
      if (p.inheems) inheems++;
    }
    const totaal = canvas.beplanting.length;
    const boog = bloeiboog([...soorten.values()]);
    return { totaal, soorten: soorten.size, inheemsPct: totaal ? Math.round((inheems / totaal) * 100) : 0, boog };
  }, [canvas.beplanting, plantMap]);

  const meldingen = useMemo(() => coachChecks(canvas, bibMap, plantMap), [canvas, bibMap, plantMap]);

  const perCategorie = useMemo(() => {
    const g = new Map<string, BibliotheekElement[]>();
    for (const b of bibliotheek) { const l = g.get(b.categorie) ?? []; l.push(b); g.set(b.categorie, l); }
    return [...g.entries()];
  }, [bibliotheek]);

  const geselecteerdePlant = sel?.type === "plant"
    ? plantMap.get(canvas.beplanting.find((b) => b.id === sel.id)?.plantId ?? "")
    : undefined;
  const geselecteerdElement = sel?.type === "element"
    ? bibMap.get(canvas.elementen.find((e) => e.id === sel.id)?.elementId ?? "")
    : undefined;

  const stageB = canvas.terrein.breedteM * SCHAAL;
  const stageH = canvas.terrein.diepteM * SCHAAL;
  const maandLabel = maand === null ? "Hele jaar" : MAANDEN_VOLUIT[maand - 1];

  return (
    <div>
      {/* Werkbalk */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={opslaan} disabled={bezig || opgeslagen}
          className="rounded-lg bg-clay px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-clay-deep disabled:opacity-50">
          {bezig ? "Bezig..." : opgeslagen ? "Opgeslagen ✓" : "Opslaan"}
        </button>
        <button type="button" onClick={nieuweVersie} disabled={bezig} className={knop}>Opslaan als v{ontwerp.versie + 1}</button>
        <button type="button" onClick={exportPng} className={knop}>PNG</button>
        <span className="mx-1 h-5 w-px bg-sage" aria-hidden />
        <button type="button" onClick={undo} disabled={verleden.length === 0} className={knop} title="Ongedaan maken (Ctrl+Z)">↩ Ongedaan</button>
        <button type="button" onClick={redo} disabled={toekomst.length === 0} className={knop} title="Opnieuw (Ctrl+Shift+Z)">↪ Opnieuw</button>
        <button type="button" onClick={dupliceer} disabled={!sel} className={knop} title="Dupliceer (Ctrl+D)">⧉ Dupliceer</button>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-moss-deep">
          <input type="checkbox" checked={snapAan} onChange={(e) => setSnapAan(e.target.checked)} className="h-4 w-4 accent-moss" />
          Snappen (0,5 m)
        </label>
        <span className="mx-1 h-5 w-px bg-sage" aria-hidden />
        <button type="button" onClick={bewaarAlsSjabloon} disabled={bezig} className={knop}>Bewaar als sjabloon</button>
        <button type="button" onClick={() => setWizardOpen((v) => !v)} className={knop}>✨ Ontwerphulp</button>
      </div>

      {/* Seizoensschuif */}
      <div className="mb-3 flex flex-wrap items-center gap-3 rounded-xl border border-sage/60 bg-paper px-4 py-2">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-soft">Seizoen</span>
        <button type="button" onClick={() => setMaand(null)}
          className={`rounded-lg px-3 py-1 text-xs font-semibold ${maand === null ? "bg-moss text-white" : "border border-sage text-moss-deep hover:bg-sage-light"}`}>
          Hele jaar
        </button>
        <input type="range" min={1} max={12} value={maand ?? 6} onChange={(e) => setMaand(Number(e.target.value))} className="flex-1 accent-moss" aria-label="Maand" />
        <span className="w-24 text-sm font-semibold text-moss-deep">{maandLabel}</span>
      </div>

      {wizardOpen && (
        <div className="mb-3 flex flex-wrap items-end gap-3 rounded-xl border border-sage/60 bg-paper p-4">
          <label className="block text-xs font-semibold">Leeftijd
            <select value={wizard.leeftijd} onChange={(e) => setWizard((w) => ({ ...w, leeftijd: e.target.value as WizardOpties["leeftijd"] }))} className="input mt-1">
              <option value="peuters">Peuters (0 tot 4)</option>
              <option value="basisschool">Basisschool (4 tot 12)</option>
              <option value="gemengd">Gemengd</option>
            </select>
          </label>
          <label className="block text-xs font-semibold">Budget (euro)
            <input type="number" min={0} step={500} value={wizard.budget} onChange={(e) => setWizard((w) => ({ ...w, budget: Number(e.target.value) || 0 }))} className="input mt-1 w-28" />
          </label>
          <label className="flex items-center gap-2 py-2 text-xs font-semibold">
            <input type="checkbox" checked={wizard.metWater} onChange={(e) => setWizard((w) => ({ ...w, metWater: e.target.checked }))} className="h-4 w-4 accent-moss" /> Met water
          </label>
          <label className="flex items-center gap-2 py-2 text-xs font-semibold">
            <input type="checkbox" checked={wizard.winterGroen} onChange={(e) => setWizard((w) => ({ ...w, winterGroen: e.target.checked }))} className="h-4 w-4 accent-moss" /> Ook groen in de winter
          </label>
          <button type="button" className="rounded-lg bg-clay px-4 py-2 text-sm font-semibold text-white transition hover:bg-clay-deep"
            onClick={() => {
              if (canvas.elementen.length + canvas.beplanting.length > 0 && !confirm("De ontwerphulp vervangt het huidige canvas. Doorgaan?")) return;
              const toev = wizardOntwerp(wizard, canvas.terrein, bibMap, plantMap, zones, pakketten);
              muteer((prev) => ({ ...prev, elementen: toev.elementen, beplanting: toev.beplanting }));
              setSel(null); setWizardOpen(false);
            }}>
            Genereer startopzet
          </button>
        </div>
      )}

      <div className="flex gap-4">
        {/* Palet met tabbladen */}
        <aside className="no-print w-56 shrink-0 overflow-y-auto rounded-xl border border-sage/60 bg-paper p-3" style={{ maxHeight: 640 }}>
          <div className="mb-3 flex gap-1 text-xs">
            {(["elementen", "planten", "zones", "pakketten"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setPalet(t)}
                className={`flex-1 rounded-md px-1.5 py-1 font-semibold capitalize ${palet === t ? "bg-moss text-white" : "text-ink-soft hover:bg-sage-light"}`}>
                {t === "elementen" ? "Elem." : t}
              </button>
            ))}
          </div>

          {palet === "elementen" && perCategorie.map(([categorie, lijst]) => (
            <div key={categorie} className="mb-3">
              <p className="mb-1 text-xs font-bold capitalize text-moss-deep">{categorie}</p>
              <div className="space-y-1">
                {lijst.map((b) => (
                  <button key={b.id} type="button" onClick={() => voegElement(b.id)}
                    className="flex w-full items-center gap-2 rounded-lg border border-sage/50 px-2 py-1.5 text-left text-xs transition hover:border-clay hover:bg-cream"
                    title={`${b.breedteM} x ${b.diepteM} m, ${euro(b.prijs)}`}>
                    <span className="inline-block h-3.5 w-3.5 shrink-0 rounded" style={{ backgroundColor: CATEGORIE_KLEUREN[b.categorie]?.fill, border: `2px solid ${CATEGORIE_KLEUREN[b.categorie]?.stroke}` }} />
                    <span className="min-w-0 flex-1 truncate font-semibold">{b.naam}</span>
                    {b.soort === "speeltoestel" && <span className="shrink-0 rounded bg-clay-soft px-1 text-[10px] font-bold text-clay-deep">WAS</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {palet === "planten" && (
            <div>
              <div className="mb-2 space-y-1 text-xs">
                <label className="flex items-center gap-2 font-semibold">
                  <input type="checkbox" checked={filterMaand} onChange={(e) => setFilterMaand(e.target.checked)} className="h-3.5 w-3.5 accent-moss" />
                  Bloeit in {maand === null ? "gekozen maand" : MAANDEN_VOLUIT[maand - 1]}
                </label>
                <label className="flex items-center gap-2 font-semibold">
                  <input type="checkbox" checked={filterWintergroen} onChange={(e) => setFilterWintergroen(e.target.checked)} className="h-3.5 w-3.5 accent-moss" />
                  Alleen wintergroen
                </label>
              </div>
              <div className="space-y-1">
                {plantBibliotheek.map((p) => {
                  const m = maand ?? 6;
                  const bloeitNu = (p.bloeimaanden & (1 << (m - 1))) !== 0;
                  const uitgegrijsd = (filterMaand && !bloeitNu) || (filterWintergroen && !p.wintergroen);
                  return (
                    <button key={p.id} type="button" onClick={() => voegPlant(p.id)}
                      className={`w-full rounded-lg border border-sage/50 px-2 py-1.5 text-left text-xs transition hover:border-clay hover:bg-cream ${uitgegrijsd ? "opacity-40" : ""}`}
                      title={`${p.naamNL}, ${euro(p.prijs)}`}>
                      <span className="flex items-center gap-1.5">
                        <span className="inline-block h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: p.bloeikleur }} />
                        <span className="min-w-0 flex-1 truncate font-semibold">{p.naamNL}</span>
                        {p.wintergroen && <span className="shrink-0 rounded bg-moss px-1 text-[9px] font-bold text-white">WG</span>}
                        {p.giftig && <span className="shrink-0 rounded bg-clay-deep px-1 text-[9px] font-bold text-white">gif</span>}
                      </span>
                      <span className="mt-1 block"><BloeiStrip bloeimaanden={p.bloeimaanden} bloeikleur={p.bloeikleur} actieveMaand={maand} /></span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[10px] italic text-ink-soft">Bloeitijden zijn indicatief; verschilt per jaar en streek.</p>
            </div>
          )}

          {palet === "zones" && (
            <div className="space-y-1.5">
              {zones.map((z) => (
                <div key={z.id} className="flex items-center gap-1 rounded-lg border border-sage/50 px-2 py-1.5 text-xs hover:border-clay hover:bg-cream">
                  <button type="button" onClick={() => voegZone(z)} className="min-w-0 flex-1 text-left">
                    <span className="block truncate font-semibold text-moss-deep">{z.naam}</span>
                    <span className="text-[10px] capitalize text-ink-soft">{z.categorie} · {z.regels.length} onderdelen</span>
                  </button>
                  {z.eigen && (
                    <button type="button" title="Verwijder eigen sjabloon"
                      onClick={() => startTransition(async () => { await deleteEigenSjabloon(ontwerp.id, z.id); })}
                      className="text-ink-soft hover:text-clay-deep">✕</button>
                  )}
                </div>
              ))}
              {zones.length === 0 && <p className="text-xs text-ink-soft">Nog geen zones.</p>}
            </div>
          )}

          {palet === "pakketten" && (
            <div className="space-y-2">
              {pakketten.map((pp) => {
                const dekking = pakketDekking(pp, plantMap);
                const max = Math.max(1, ...dekking);
                return (
                  <button key={pp.id} type="button" onClick={() => voegPakket(pp)}
                    className="block w-full rounded-lg border border-sage/50 px-2 py-2 text-left text-xs transition hover:border-clay hover:bg-cream">
                    <span className="block font-semibold text-moss-deep">{pp.naam}</span>
                    {pp.doel && <span className="mb-1 block text-[10px] text-ink-soft">{pp.doel}</span>}
                    <span className="flex items-end gap-px" style={{ height: 18 }}>
                      {dekking.map((n, i) => (
                        <span key={i} className="flex-1 rounded-[1px]" title={`${n} soort(en)`}
                          style={{ height: Math.max(2, (n / max) * 18), backgroundColor: n === 0 ? "#E7E1D3" : "#7E8C6A" }} />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        {/* Canvas */}
        <div className="min-w-0 flex-1 overflow-auto rounded-xl border border-sage/60 bg-paper p-2" style={{ maxHeight: 640 }}>
          <Stage ref={stageRef} width={stageB} height={stageH}
            onMouseDown={(e) => { if (e.target === e.target.getStage()) setSel(null); }}>
            {/* Terrein + raster */}
            <Layer listening={false}>
              <Rect x={0} y={0} width={stageB} height={stageH} fill="#F4EFE2" />
              {Array.from({ length: canvas.terrein.breedteM + 1 }, (_, i) => (
                <Line key={`v${i}`} points={[i * SCHAAL, 0, i * SCHAAL, stageH]} stroke="#CBD6C2" strokeWidth={i % 5 === 0 ? 1.2 : 0.5} />
              ))}
              {Array.from({ length: canvas.terrein.diepteM + 1 }, (_, i) => (
                <Line key={`h${i}`} points={[0, i * SCHAAL, stageB, i * SCHAAL]} stroke="#CBD6C2" strokeWidth={i % 5 === 0 ? 1.2 : 0.5} />
              ))}
              <Rect x={0} y={0} width={stageB} height={stageH} stroke="#7E8C6A" strokeWidth={2} />
            </Layer>

            {/* Valruimte-ringen */}
            <Layer listening={false}>
              {canvas.elementen.map((el) => {
                const b = bibMap.get(el.elementId);
                if (!b || b.valruimteM <= 0) return null;
                return <Circle key={`ring-${el.id}`} x={el.x * SCHAAL} y={el.y * SCHAAL} radius={vrijeZoneRadiusM(b, el.schaal) * SCHAAL}
                  fill="rgba(201,142,112,0.15)" stroke="#C98E70" strokeWidth={1.5} dash={[8, 6]} />;
              })}
            </Layer>

            {/* Beplantingslaag (aparte Layer voor seizoensherkleuring) */}
            <Layer>
              {canvas.beplanting.map((bp) => {
                const p = plantMap.get(bp.plantId);
                if (!p) return null;
                const r = Math.max(6, plantRadiusM(p) * SCHAAL);
                let fill = p.bloeikleur;
                let dash: number[] | undefined;
                if (maand !== null) {
                  const status = plantStatus(p, maand);
                  if (status === "bloei") fill = p.bloeikleur;
                  else if (status === "kaal") { fill = "#F4EFE2"; dash = [3, 3]; }
                  else fill = STATUS_KLEUREN[status];
                }
                return (
                  <Circle key={bp.id} id={bp.id} x={bp.x * SCHAAL} y={bp.y * SCHAAL} radius={r}
                    fill={fill} stroke={sel?.id === bp.id ? "#B0714F" : "#5E6B4F"} strokeWidth={sel?.id === bp.id ? 2.5 : 1} dash={dash}
                    draggable onClick={() => setSel({ id: bp.id, type: "plant" })} onTap={() => setSel({ id: bp.id, type: "plant" })}
                    onDragStart={() => setSel({ id: bp.id, type: "plant" })}
                    onDragEnd={(e) => {
                      const nx = snapM(e.target.x() / SCHAAL), ny = snapM(e.target.y() / SCHAAL);
                      muteer((prev) => ({ ...prev, beplanting: prev.beplanting.map((q) => q.id === bp.id ? { ...q, x: nx, y: ny } : q) }));
                    }} />
                );
              })}
            </Layer>

            {/* Elementenlaag */}
            <Layer>
              {canvas.elementen.map((el) => {
                const b = bibMap.get(el.elementId);
                if (!b) return null;
                const kleur = CATEGORIE_KLEUREN[b.categorie] ?? CATEGORIE_KLEUREN.groen;
                const w = b.breedteM * SCHAAL, h = b.diepteM * SCHAAL;
                return (
                  <Group key={el.id} id={el.id} x={el.x * SCHAAL} y={el.y * SCHAAL} rotation={el.rotatie} scaleX={el.schaal} scaleY={el.schaal}
                    draggable onClick={() => setSel({ id: el.id, type: "element" })} onTap={() => setSel({ id: el.id, type: "element" })}
                    onDragStart={() => setSel({ id: el.id, type: "element" })}
                    onDragEnd={(e) => {
                      const nx = snapM(e.target.x() / SCHAAL), ny = snapM(e.target.y() / SCHAAL);
                      muteer((prev) => ({ ...prev, elementen: prev.elementen.map((p) => p.id === el.id ? { ...p, x: nx, y: ny } : p) }));
                    }}
                    onTransformEnd={(e) => {
                      const node = e.target;
                      const schaal = clamp(node.scaleX(), 0.3, 4), rotatie = Math.round(node.rotation());
                      const nx = snapM(node.x() / SCHAAL), ny = snapM(node.y() / SCHAAL);
                      muteer((prev) => ({ ...prev, elementen: prev.elementen.map((p) => p.id === el.id ? { ...p, schaal, rotatie, x: nx, y: ny } : p) }));
                    }}>
                    <Rect width={w} height={h} offsetX={w / 2} offsetY={h / 2} cornerRadius={8} fill={kleur.fill}
                      stroke={sel?.id === el.id ? "#B0714F" : kleur.stroke} strokeWidth={b.soort === "speeltoestel" ? 2.5 : 1.5} />
                    <Text text={b.naam} width={w} offsetX={w / 2} offsetY={6} align="center" fontSize={11} fontStyle="bold" fill="#3A352F" listening={false} />
                  </Group>
                );
              })}
              <Transformer ref={trRef} rotateEnabled keepRatio enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
                anchorStroke="#B0714F" anchorFill="#FFFDF8" borderStroke="#B0714F"
                boundBoxFunc={(oud, nieuw) => (nieuw.width < 12 || nieuw.height < 12 ? oud : nieuw)} />
            </Layer>
          </Stage>
        </div>

        {/* Zijbalk met tabbladen */}
        <aside className="no-print w-72 shrink-0 space-y-3 overflow-y-auto" style={{ maxHeight: 640 }}>
          <div className="rounded-xl border border-sage/60 bg-paper p-3">
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div><p className="font-heading text-2xl text-moss-deep">{materialen.aanleidingen}</p><p className="text-[10px]">aanleidingen</p></div>
              <div><p className="font-heading text-2xl text-clay-deep">{materialen.toestellen}</p><p className="text-[10px]">toestellen</p></div>
              <div><p className="font-heading text-2xl text-moss-deep">{plantStats.soorten}</p><p className="text-[10px]">plantsoorten</p></div>
            </div>
          </div>

          <div className="flex gap-1 text-xs">
            {(["ontwerp", "coach", "selectie"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setZijbalk(t)}
                className={`flex-1 rounded-md px-2 py-1 font-semibold capitalize ${zijbalk === t ? "bg-moss text-white" : "bg-paper text-ink-soft hover:bg-sage-light"}`}>
                {t}{t === "selectie" && sel ? " ●" : ""}
              </button>
            ))}
          </div>

          {zijbalk === "ontwerp" && (
            <>
              <div className="rounded-xl border border-sage/60 bg-paper p-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">Bloeiboog</p>
                <BloeiBoog boog={plantStats.boog} actieveMaand={maand} onKiesMaand={(m) => setMaand(m)} />
              </div>
              <div className="rounded-xl border border-sage/60 bg-paper p-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">Materialen & prijs</p>
                {materialen.rijen.length === 0 ? <p className="text-sm text-ink-soft">Nog geen elementen.</p> : (
                  <>
                    <ul className="divide-y divide-sage/30 text-sm">
                      {materialen.rijen.map((r) => (
                        <li key={r.naam} className="flex justify-between gap-2 py-1"><span>{r.aantal} x {r.naam}</span><span className="font-semibold">{euro(r.subtotaal)}</span></li>
                      ))}
                    </ul>
                    <p className="mt-2 flex justify-between border-t-2 border-moss-deep pt-2 text-sm font-bold text-moss-deep"><span>Totaal (indicatie)</span><span>{euro(materialen.totaal)}</span></p>
                  </>
                )}
                <p className="mt-3 flex justify-between text-sm">
                  <span>Beplanting ({plantStats.totaal} st.) inheems</span>
                  <span className={`font-bold ${plantStats.inheemsPct >= 50 ? "text-moss" : "text-clay-deep"}`}>{plantStats.totaal === 0 ? "-" : `${plantStats.inheemsPct}%`}</span>
                </p>
              </div>
            </>
          )}

          {zijbalk === "coach" && (
            <div className="rounded-xl border border-sage/60 bg-paper p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">Ontwerpcoach</p>
              <ul className="space-y-2 text-xs">
                {meldingen.map((m, i) => (
                  <li key={i} className={`rounded-lg p-2 ${m.niveau === "waarschuwing" ? "bg-clay-soft text-clay-deep" : m.niveau === "info" ? "bg-water/40 text-moss-night" : "bg-sage-light text-moss-deep"}`}>
                    {m.niveau === "waarschuwing" ? "⚠ " : m.niveau === "info" ? "ℹ " : "✓ "}{m.tekst}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {zijbalk === "selectie" && (
            <div className="rounded-xl border border-sage/60 bg-paper p-3 text-sm">
              {!sel && <p className="text-ink-soft">Klik op een element of plant om details te zien.</p>}
              {geselecteerdElement && (
                <div className="space-y-1">
                  <p className="font-heading text-lg text-moss-deep">{geselecteerdElement.naam}</p>
                  <p className="text-xs capitalize text-ink-soft">{geselecteerdElement.categorie} · {geselecteerdElement.soort === "speeltoestel" ? "keuringsplichtig (WAS)" : "speelaanleiding"}</p>
                  <p className="text-xs">{geselecteerdElement.breedteM} x {geselecteerdElement.diepteM} m · {euro(geselecteerdElement.prijs)}</p>
                  {geselecteerdElement.valruimteM > 0 && <p className="text-xs">Valruimte: {geselecteerdElement.valruimteM} m</p>}
                </div>
              )}
              {geselecteerdePlant && (
                <div className="space-y-2">
                  <p className="font-heading text-lg text-moss-deep">{geselecteerdePlant.naamNL}</p>
                  <BloeiStrip bloeimaanden={geselecteerdePlant.bloeimaanden} bloeikleur={geselecteerdePlant.bloeikleur} actieveMaand={maand} />
                  <p className="text-xs capitalize text-ink-soft">{geselecteerdePlant.categorie} · {euro(geselecteerdePlant.prijs)}</p>
                  <div className="flex flex-wrap gap-1">
                    {geselecteerdePlant.inheems && <span className="rounded-full bg-moss px-2 py-0.5 text-[10px] font-bold text-white">inheems</span>}
                    {geselecteerdePlant.wintergroen && <span className="rounded-full bg-moss-deep px-2 py-0.5 text-[10px] font-bold text-white">wintergroen</span>}
                    {geselecteerdePlant.giftig && <span className="rounded-full bg-clay-deep px-2 py-0.5 text-[10px] font-bold text-white">giftig</span>}
                  </div>
                  {geselecteerdePlant.giftig && (
                    <p className="rounded-lg bg-clay-soft p-2 text-xs text-clay-deep">Giftig: buiten peuterbereik houden, niet naast zand- of snoepzone.</p>
                  )}
                </div>
              )}
              {sel && (
                <button type="button" onClick={verwijderSelectie} className="mt-3 text-xs font-semibold text-ink-soft hover:text-clay-deep">✕ Verwijder uit ontwerp</button>
              )}
            </div>
          )}

          {pakketten.length > 0 && (
            <div className="rounded-xl border border-sage/60 bg-paper p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">Pakket in offerte</p>
              <div className="space-y-1">
                {pakketten.map((pp) => (
                  <button key={pp.id} type="button" disabled={bezig}
                    onClick={() => startTransition(async () => { await pakketNaarOfferte(ontwerp.id, pp.id); })}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-sage/50 px-2 py-1.5 text-left text-xs transition hover:border-clay hover:bg-cream disabled:opacity-40">
                    <span className="min-w-0 flex-1 truncate">{pp.naam}</span>
                    <span className="shrink-0 text-clay-deep">+ offerte</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Parallelle lijst voor screenreaders */}
      <ul className="sr-only" aria-label="Geplaatste elementen en beplanting">
        {canvas.elementen.map((el) => {
          const b = bibMap.get(el.elementId);
          return <li key={el.id}>{b?.naam ?? "Onbekend"} op {el.x} bij {el.y} meter</li>;
        })}
        {canvas.beplanting.map((bp) => {
          const p = plantMap.get(bp.plantId);
          return <li key={bp.id}>Plant {p?.naamNL ?? "onbekend"} op {bp.x} bij {bp.y} meter</li>;
        })}
      </ul>
    </div>
  );
}
