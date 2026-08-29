/**
 * Verifica los tres estados de FichaNorma EN EL DOM, no a ojo.
 *
 *   npm run test:ficha                             # contra localhost:3001
 *   URL_APP=https://opened-phi.vercel.app/ npm run test:ficha
 *
 * Corre contra /ficha-prueba, el banco de prueba, porque app/page.tsx es del
 * otro carril. Lo que se defiende aca es lo que nos hunde si falla:
 *  - los tres estados existen y se distinguen,
 *  - el numero de protocolo que se pinta es el de la tabla, no otro,
 *  - la ficha de la docente agredida NO inventa un numero,
 *  - el sello "por contrastar" se VE cuando la fila lo lleva,
 *  - la tarjeta entra en una pantalla de proyector sin scroll horizontal.
 */

import { chromium } from "playwright";
import assert from "node:assert/strict";

const BASE = process.env.URL_APP ?? "http://localhost:3001/";
const URL_FICHA = new URL("/ficha-prueba", BASE).href;
const res = [];

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1280, height: 800 } });
const p = await ctx.newPage();

const errores = [];
p.on("console", (m) => m.type() === "error" && errores.push(m.text()));

await p.goto(URL_FICHA, { waitUntil: "networkidle" });
await p.waitForSelector("[data-estado]");

// ------------------------------------------------- 1. los tres estados existen
const estados = await p.$$eval("[data-estado]", (nodos) =>
  nodos.map((n) => n.getAttribute("data-estado")),
);
for (const estado of ["protocolo", "informativa", "sin_norma"]) {
  assert.ok(estados.includes(estado), `falta el estado "${estado}" en el DOM: ${estados}`);
}
res.push(`PASS  los tres estados renderizan (${estados.join(", ")})`);

// ------------------------------- 2. el digito que se pinta es el de la tabla
const arma = p.locator('[data-clave="protocolo_03"]');
await arma.waitFor();
const texto = await arma.innerText();
assert.match(texto, /Violencia con uso de armas/);
assert.match(texto, /\b03\b/, "no se ve el numero de protocolo");
assert.match(texto, /20 días hábiles/, "el plazo del protocolo del arma es de 20, no de 30");
assert.match(texto, /Hasta 24 horas de la intervención/, "falta el hito de la UGEL");
assert.match(texto, /Protocolo 03/, "falta la cita al pie");
assert.match(texto, /PDF p\. 22, folio 19/, "la tarjeta debe decir donde auditar el dato");
res.push("PASS  protocolo 03 pinta numero, plazo, hito y fuente auditable");

// ------------------ 3. la ficha de la docente agredida no se inventa un numero
const docente = p.locator('[data-clave="docente_agredido"]');
await docente.waitFor();
const textoDocente = await docente.innerText();
assert.equal(await docente.getAttribute("data-estado"), "informativa");
assert.match(textoDocente, /Norma aplicable, sin protocolo/i);
assert.match(textoDocente, /numeral 4\.3/, "debe citar el numeral que sostiene el producto");
assert.match(textoDocente, /Reglamento Interno/);
assert.doesNotMatch(
  textoDocente,
  /Protocolo\s*\d/,
  "la ficha de la docente NO tiene protocolo, y ese vacio es el argumento",
);
assert.doesNotMatch(textoDocente, /Plazo de atención/, "este caso no tiene plazo de cierre");
res.push("PASS  la docente agredida cita 4.3 y no inventa numero ni plazo");

// --------------------------------------------- 4. la ficha sin norma no asusta
const sinNorma = p.locator('[data-clave="sin_protocolo"]');
await sinNorma.waitFor();
const textoSin = await sinNorma.innerText();
assert.match(textoSin, /Sin protocolo aplicable/i);
assert.match(textoSin, /numeral 4\.2/);
assert.doesNotMatch(textoSin, /Protocolo\s*\d/);
res.push("PASS  el conflicto de convivencia se muestra como lo que es");

// ------------------------------------------------- 5. el sello se ve, no se esconde
const sellos = await p.$$eval("[data-sello]", (nodos) =>
  nodos.map((n) => [n.getAttribute("data-sello"), n.innerText.trim()]),
);
assert.ok(
  sellos.some(([s, t]) => s === "publicado" && /Verificado en fuente/.test(t)),
  "falta el sello de verificado",
);
assert.ok(
  sellos.some(([s, t]) => s === "por-contrastar" && /Por contrastar/.test(t)),
  "el sello 'por contrastar' tiene que VERSE, no esconderse",
);
res.push("PASS  los dos sellos se pintan con su texto");

// --------------------------------- 6. proyector: sin scroll horizontal, legible
const desborde = await p.evaluate(
  () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
);
assert.equal(desborde, false, "la pagina scrollea en horizontal, en proyector eso se ve roto");

const tamanos = await p.evaluate(() =>
  [...document.querySelectorAll("[data-estado] li, [data-estado] h3")].map((n) =>
    parseFloat(getComputedStyle(n).fontSize),
  ),
);
const minimo = Math.min(...tamanos);
assert.ok(minimo >= 14, `hay texto de ${minimo}px en la ruta o el titulo, ilegible a 5 metros`);
res.push(`PASS  sin desborde horizontal y el texto clave no baja de ${minimo}px`);

// ------------------------------------------------------------- 7. consola limpia
assert.deepEqual(errores, [], `la consola tiro errores: ${errores.join(" | ")}`);
res.push("PASS  consola sin errores");

await nav.close();
console.log(res.join("\n"));
console.log(`\nficha: ${res.length} comprobaciones OK`);
