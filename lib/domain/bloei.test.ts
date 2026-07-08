// Lichtgewicht unit-tests voor de bloei-helpers (draait via `npm test`, tsx).
// Geen testframework nodig: assert uit node en een simpele teller.
import assert from "node:assert/strict";
import {
  maandBit,
  bloeitIn,
  maandenNaarMasker,
  maskerNaarMaanden,
  plantStatus,
  bloeiboog,
  bloeigaten,
} from "./bloei";

let ok = 0;
function test(naam: string, fn: () => void) {
  fn();
  ok++;
  console.log(`  ok - ${naam}`);
}

console.log("bloei-helpers:");

test("maandBit: jan=1, dec=2048", () => {
  assert.equal(maandBit(1), 1);
  assert.equal(maandBit(12), 2048);
});

test("bloeitIn: randgevallen januari en december", () => {
  const masker = maandenNaarMasker([1, 12]);
  assert.equal(bloeitIn(masker, 1), true);
  assert.equal(bloeitIn(masker, 12), true);
  assert.equal(bloeitIn(masker, 6), false);
});

test("masker heen en terug (klimop: sep, okt, nov)", () => {
  const masker = maandenNaarMasker([9, 10, 11]);
  assert.deepEqual(maskerNaarMaanden(masker), [9, 10, 11]);
});

test("plantStatus: vier statussen incl. wintergroen in februari", () => {
  const bloeier = { bloeimaanden: maandenNaarMasker([6, 7]), wintergroen: false };
  assert.equal(plantStatus(bloeier, 6), "bloei");
  assert.equal(plantStatus(bloeier, 5), "groen"); // mei, geen bloei, niet wintergroen
  assert.equal(plantStatus(bloeier, 1), "kaal"); // winter, niet wintergroen
  const wg = { bloeimaanden: maandenNaarMasker([8, 9]), wintergroen: true };
  assert.equal(plantStatus(wg, 2), "wintergroen"); // februari, wintergroen
  assert.equal(plantStatus(wg, 8), "bloei"); // bloei wint van wintergroen
});

test("bloeiboog telt unieke soorten per maand", () => {
  const soorten = [
    { bloeimaanden: maandenNaarMasker([6, 7]) },
    { bloeimaanden: maandenNaarMasker([6]) },
    { bloeimaanden: maandenNaarMasker([9]) },
  ];
  const boog = bloeiboog(soorten);
  assert.equal(boog[5], 2); // juni: twee soorten
  assert.equal(boog[6], 1); // juli: een soort
  assert.equal(boog[8], 1); // september: een soort
  assert.equal(boog[0], 0); // januari: geen
});

test("bloeigaten: alleen binnen maart t/m oktober", () => {
  // bloei alleen in juni -> gaten in mrt,apr,mei,jul,aug,sep,okt (niet jan/feb/nov/dec)
  const boog = bloeiboog([{ bloeimaanden: maandenNaarMasker([6]) }]);
  const gaten = bloeigaten(boog);
  assert.deepEqual(gaten, [3, 4, 5, 7, 8, 9, 10]);
  assert.ok(!gaten.includes(1));
  assert.ok(!gaten.includes(12));
});

test("bloeigaten: doorlopende dekking geeft geen gaten", () => {
  const soorten = [
    { bloeimaanden: maandenNaarMasker([3, 4, 5]) },
    { bloeimaanden: maandenNaarMasker([6, 7, 8]) },
    { bloeimaanden: maandenNaarMasker([9, 10]) },
  ];
  assert.deepEqual(bloeigaten(bloeiboog(soorten)), []);
});

console.log(`\n${ok} tests geslaagd.`);
