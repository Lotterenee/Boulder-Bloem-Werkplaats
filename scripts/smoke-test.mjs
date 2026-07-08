// Smoke test voor De Kas: doorloopt alle kernflows met Playwright.
// Vereist: draaiende app (SMOKE_BASE, standaard http://127.0.0.1:3100) met
// verse geseede database, en Chromium (CHROMIUM_PATH).
// Draaien: node scripts/smoke-test.mjs
import { chromium } from "playwright-core";

const BASE = process.env.SMOKE_BASE ?? "http://127.0.0.1:3100";
const SHOTS = process.env.SMOKE_SHOTS ?? ".";
let stap = 0;
function ok(naam) {
  stap++;
  console.log(`OK ${stap}. ${naam}`);
}
function faal(naam, extra) {
  console.error(`FAIL ${stap + 1}. ${naam}${extra ? ": " + extra : ""}`);
  process.exitCode = 1;
}

const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(15000);

try {
  // 1. Uitgelogd -> redirect naar login
  await page.goto(`${BASE}/dashboard`);
  await page.waitForURL(/\/login/);
  ok("Uitgelogd naar /dashboard wordt /login");

  // 2. Fout wachtwoord -> foutmelding
  await page.fill('input[name="email"]', "lotte@boulderbloem.nl");
  await page.fill('input[name="password"]', "verkeerd-wachtwoord");
  await page.click('button[type="submit"]');
  await page.waitForSelector('[role="alert"]');
  ok("Fout wachtwoord toont foutmelding");

  // 3. Goed wachtwoord -> dashboard (vers formulier: React reset velden na actie)
  await page.goto(`${BASE}/login`);
  await page.fill('input[name="email"]', "lotte@boulderbloem.nl");
  await page.fill('input[name="password"]', "kas-groeit-2026");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/);
  await page.waitForSelector("text=Projecten per fase");
  ok("Inloggen lukt, dashboard zichtbaar");

  // 4. Klant aanmaken
  await page.goto(`${BASE}/klanten/nieuw`);
  await page.fill('input[name="organisatie"]', "OBS De Regenboog");
  await page.selectOption('select[name="type"]', "school");
  await page.fill('input[name="contactpersoon"]', "Juf Anke");
  await page.fill('input[name="gemeente"]', "Utrecht");
  await page.click('button:has-text("Klant aanmaken")');
  await page.waitForURL(/\/klanten\/(?!nieuw)[a-z0-9]+/);
  ok("Klant aangemaakt (gemeente verplicht veld aanwezig)");

  // 5. Project aanmaken vanaf klantpagina
  await page.click("text=+ Nieuw project");
  await page.waitForURL(/\/projecten\/nieuw/);
  await page.fill('input[name="naam"]', "Groen schoolplein Regenboog");
  await page.fill('input[name="oppervlakteM2"]', "450");
  await page.fill('input[name="budgetIndicatie"]', "25000");
  await page.fill('input[name="volgendeActie"]', "Schouw inplannen");
  await page.fill('input[name="volgendeActieDatum"]', "2026-07-15");
  await page.click('button:has-text("Project aanmaken")');
  await page.waitForURL(/\/projecten\/(?!nieuw)[a-z0-9]+$/);
  const projectUrl = page.url();
  ok("Project aangemaakt en gekoppeld aan klant");

  // 6. Stepper: fase verzetten
  await page.click('button[title="Zet fase naar: Locatieanalyse"]');
  await page.waitForSelector('button[aria-current="step"]:has-text("Locatieanalyse")');
  ok("Stepper verzet fase naar locatieanalyse");

  // 7. Wens toevoegen
  await page.goto(`${projectUrl}?tab=wensen`);
  await page.fill('textarea[name="tekst"]', "Waterpomp met modderkeuken");
  await page.selectOption('select[name="bron"]', "kinderen");
  await page.selectOption('select[name="prioriteit"]', "moet");
  await page.click('button:has-text("Wens toevoegen")');
  await page.waitForSelector("text=Waterpomp met modderkeuken");
  ok("Wens toegevoegd met bron en prioriteit");

  // 8. Taak toevoegen
  await page.goto(`${projectUrl}?tab=taken`);
  await page.fill('input[name="titel"]', "Offerte voorbereiden");
  await page.selectOption('select[name="categorie"]', "offerte");
  await page.fill('input[name="deadline"]', "2026-07-20");
  await page.click('button:has-text("Taak toevoegen")');
  await page.waitForSelector("text=Offerte voorbereiden");
  ok("Taak met deadline toegevoegd");

  // 9. Subsidieradar toont geseede regelingen met kleurcode
  await page.goto(`${BASE}/subsidies`);
  await page.waitForSelector("text=Geld voor een Speelplek");
  const rijen = await page.locator("tbody tr").count();
  if (rijen < 10) faal("Subsidieradar", `slechts ${rijen} regelingen`);
  else ok(`Subsidieradar toont ${rijen} geseede regelingen`);
  await page.selectOption('select[name="niveau"]', "provincie");
  await page.click('button:has-text("Filter")');
  await page.waitForSelector("text=Vouchers groene schoolpleinen");
  ok("Filter op niveau=provincie werkt");

  // 10. Aanvraag koppelen op de project-tab
  await page.goto(`${projectUrl}?tab=subsidies`);
  await page.selectOption('select[name="subsidieId"]', { index: 1 });
  await page.click('button:has-text("Start aanvraag")');
  await page.waitForSelector('select[name="status"]');
  await page.selectOption('select[name="status"]', "kansrijk");
  await page.fill('input[name="bedragAangevraagd"]', "10000");
  await page.click('button:has-text("Opslaan")');
  await page.waitForFunction(() => {
    const sel = document.querySelector('select[name="status"]');
    return sel && sel.value === "kansrijk";
  });
  ok("Aanvraag gekoppeld en status naar kansrijk verzet (persistent)");

  // 11. Ontwerp aanmaken -> studio
  await page.goto(`${projectUrl}?tab=ontwerp`);
  await page.fill('input[name="naam"]', "Schetsontwerp");
  await page.click('button:has-text("Open in studio")');
  await page.waitForURL(/\/ontwerpstudio\/[a-z0-9]+/);
  const studioUrl = page.url();
  await page.waitForSelector(".konvajs-content canvas");
  ok("Studio geopend, Konva-canvas rendert");

  // 12. Element plaatsen -> zijbalk telt mee
  await page.click('button:has-text("Klimtoestel (gecertificeerd)")');
  await page.waitForSelector("text=1 x Klimtoestel (gecertificeerd)");
  await page.click('button:has-text("Zandbak met rand")');
  await page.waitForSelector("text=1 x Zandbak met rand");
  const toestellen = await page
    .locator("div.rounded-lg.bg-clay-soft p.font-heading")
    .first()
    .textContent();
  if (toestellen?.trim() !== "1") faal("WAS-telling", `toestellen=${toestellen}`);
  else ok("WAS-telling: 1 keuringsplichtig toestel, materialen + prijs in zijbalk");

  // 13. Opslaan en herladen (JSONB persistentie)
  await page.click('button:has-text("Opslaan"):not([disabled])');
  await page.waitForSelector('button:has-text("Opgeslagen ✓")');
  await page.goto(studioUrl);
  await page.waitForSelector("text=1 x Klimtoestel (gecertificeerd)");
  ok("Canvas opgeslagen als JSONB en herladen");

  // 14. Plant koppelen -> inheems-percentage
  await page.selectOption('select[name="plantId"]', { index: 1 });
  await page.fill('input[name="aantal"]', "10");
  await page.click('button:has-text("Toevoegen")');
  await page.waitForSelector("text=Inheems");
  ok("Plant gekoppeld aan ontwerp (inheems-percentage actief)");

  await page.screenshot({ path: `${SHOTS}/studio.png`, fullPage: false });

  // 15. Offerte genereren vanuit ontwerp
  await page.goto(`${projectUrl}?tab=offerte`);
  await page.selectOption('select[name="ontwerpId"]', { index: 1 });
  await page.click('button:has-text("Genereer offerte")');
  await page.waitForURL(/\/offertes\/[a-z0-9]+/);
  await page.waitForSelector("text=Totaal incl. btw");
  const inclTekst = await page
    .locator("div.flex.justify-between.border-t-2 span")
    .nth(1)
    .textContent();
  ok(`Offerte gegenereerd met btw-totalen (incl: ${inclTekst?.trim()})`);

  // 16. Meting invoeren -> grafiek + tabel
  await page.goto(`${projectUrl}?tab=metingen`);
  await page.fill('input[name="datum"]', "2026-07-01");
  await page.selectOption('select[name="type"]', "nulmeting");
  await page.fill('input[aria-label="Aantal 1"]', "7");
  await page.click('button:has-text("Meting opslaan")');
  await page.waitForSelector('svg[role="img"]');
  ok("Meting ingevoerd, grafiek en tabel zichtbaar");

  // 17. Beheertaak jaarlijks herhalen
  await page.goto(`${projectUrl}?tab=beheer`);
  await page.fill('input[name="titel"]', "Wilgen knotten");
  await page.fill('input[name="deadline"]', "2027-01-15");
  await page.fill('input[name="herhaalJaren"]', "2");
  await page.click('button:has-text("Inplannen")');
  await page.waitForSelector("text=Wilgen knotten (2029)");
  ok("Beheeragenda met terugkerende taken (2027 t/m 2029)");

  // 18. Educatie: pakket koppelen
  await page.goto(`${projectUrl}?tab=educatie`);
  await page.click('form button:has-text("Koppel")');
  await page.waitForSelector("main a[href^='/educatie/pakketten/']");
  ok("Bestaand educatiepakket aan project gekoppeld");

  // 18b. Lesbibliotheek: overzicht, lesdetail, printweergave (Fase 4b)
  await page.goto(`${BASE}/educatie/lesbibliotheek`);
  await page.waitForSelector("text=De grote soortentelling");
  const lesRijen = await page.locator("tbody tr").count();
  if (lesRijen !== 10) faal("Lesbibliotheek-overzicht", `${lesRijen} lessen i.p.v. 10`);
  else ok("Lesbibliotheek toont 10 uitgewerkte lessen");

  await page.click('a:has-text("De grote soortentelling")');
  await page.waitForSelector("text=Zeg bijvoorbeeld:");
  await page.waitForSelector("text=Telprotocol");
  await page.waitForSelector("text=Verzamelblad soortentelling");
  ok("Lesdetail: draaiboek met voorbeeldzinnen en beide printbladen zichtbaar");

  const lesUrl = page.url();
  await page.goto(`${lesUrl}/print`);
  await page.waitForSelector("text=Afronding & mee terug");
  const zijbalkAanwezig = await page.locator('nav[aria-label="Hoofdnavigatie"]').count();
  if (zijbalkAanwezig > 0) faal("Printweergave", "zijbalk aanwezig in printroute");
  else ok("Printweergave zonder app-navigatie werkt");
  await page.goto(lesUrl);

  // 19. Dashboard toont alles
  await page.goto(`${BASE}/dashboard`);
  await page.waitForSelector("text=Groen schoolplein Regenboog");
  await page.waitForSelector("text=Offerte voorbereiden");
  await page.screenshot({ path: `${SHOTS}/dashboard.png`, fullPage: true });
  ok("Dashboard: kanban-kaart, deadline en subsidie-aanvraag zichtbaar");

  // 20. Verantwoordings-export
  const dl = await page.request.get(
    `${projectUrl.replace("/projecten/", "/api/projecten/")}/verantwoording`
  );
  const csv = await dl.text();
  if (!dl.ok() || !csv.includes("Biodiversiteitsmetingen"))
    faal("Verantwoordings-export", `status ${dl.status()}`);
  else ok("Verantwoordings-export (CSV) downloadbaar");

  // 21. Uitloggen
  await page.click('button:has-text("Uitloggen")');
  await page.waitForURL(/\/login/);
  ok("Uitloggen werkt");
} catch (e) {
  faal("Onverwachte fout", e.message);
  await page.screenshot({ path: `${SHOTS}/fout.png` });
} finally {
  await browser.close();
}

// 22. Publiek subsidiescan-endpoint (buiten de browser om)
const zonderToken = await fetch(`${BASE}/api/subsidiescan`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({}),
});
if (zonderToken.status !== 401) faal("Subsidiescan zonder token", `status ${zonderToken.status}`);
else ok("Subsidiescan zonder token geeft 401");

const metToken = await fetch(`${BASE}/api/subsidiescan`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Subsidiescan-Token": "lokale-dev-token",
  },
  body: JSON.stringify({
    organisatie: "BSO Het Bos",
    type: "bso",
    email: "info@bsohetbos.nl",
    gemeente: "Amersfoort",
    bericht: "Wij willen ons buitenterrein vergroenen.",
  }),
});
const scanData = await metToken.json();
if (metToken.status !== 201 || !scanData.ok)
  faal("Subsidiescan met token", `status ${metToken.status} ${JSON.stringify(scanData)}`);
else ok(`Subsidiescan maakt klant + project + ${scanData.regelingen} scan-aanvragen aan`);

console.log(process.exitCode ? "\nSMOKE TEST GEFAALD" : "\nALLE SMOKE TESTS GESLAAGD");
