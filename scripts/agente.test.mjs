/**
 * Verifica el agente de contencion en el chat: dos burbujas, y que el chat
 * NUNCA se quede mudo.
 *
 *   npm run test:agente
 *   URL_APP=https://opened-phi.vercel.app/ npm run test:agente
 */

import { chromium } from "playwright";
import assert from "node:assert/strict";

const BASE = process.env.URL_APP ?? "http://localhost:3001/";
const res = [];
const nav = await chromium.launch();
const ctx = await nav.newContext();
const p = await ctx.newPage();
await p.goto(BASE, { waitUntil: "networkidle" });

// El indicador de "escribiendo" tambien es un <li>: se excluye o cuenta como
// una burbuja vacia y desalinea todo el conteo.
const burbujas = () => p.locator('ol > li:not([aria-label*="escribiendo"])');

// -------------------------------------------- 1. dos burbujas, en orden
const antes = await burbujas().count();
await p.getByLabel("Mensaje").fill(
  "Profe hoy dos chicos de cuarto se agarraron a golpes en el recreo, los separe y los mande a direccion, me quede mal el resto del dia",
);
await p.getByRole("button", { name: "Enviar mensaje" }).click();

await p.waitForFunction(
  (n) =>
    document.querySelectorAll('ol > li:not([aria-label*="escribiendo"])').length >= n + 3,
  antes,
  { timeout: 45000 },
);
// Y se espera a que el indicador desaparezca, para no leer a media escritura.
await p.locator('[aria-label*="escribiendo"]').waitFor({ state: "detached", timeout: 20000 });
const textos = await burbujas().allInnerTexts();
const b1 = textos[textos.length - 2];
const b2 = textos[textos.length - 1];
assert.ok(b1.length > 20, "la primera burbuja vino vacia");
assert.ok(b2.length > 20, "la segunda burbuja vino vacia");
res.push(`PASS  dos burbujas del agente (${b1.length} y ${b2.length} chars)`);

// ----------- 2. NINGUN digito de norma, plazo ni telefono en lo que se pinta
const todo = textos.join("\n");
const prohibidos = todo.match(/\b(29719|29733|29988|004-2018|0800[\s-]?\d+|\b1\d{2}\b|art\.?\s*\d+|\d+\s*d[ií]as h[aá]biles)\b/gi);
assert.equal(prohibidos, null, `el modelo escribio digitos prohibidos: ${prohibidos}`);
res.push("PASS  cero digitos de ley, plazo o telefono en pantalla");

// ------------------------------------- 3. sin guiones largos ni emojis
assert.equal(/[—–]/.test(todo), false, "salio un guion largo");
assert.equal(/\p{Extended_Pictographic}/u.test(todo), false, "salio un emoji");
res.push("PASS  sin guiones largos ni emojis");

// ------------- 4. el chat NO se queda mudo si la ruta del agente revienta
await p.route("**/api/responder", (r) => r.abort());
const antes2 = await burbujas().count();
await p.getByLabel("Mensaje").fill("Y ahora que hago con el padre que viene manana");
await p.getByRole("button", { name: "Enviar mensaje" }).click();
await p.waitForFunction(
  (n) =>
    document.querySelectorAll('ol > li:not([aria-label*="escribiendo"])').length >= n + 2,
  antes2,
  { timeout: 20000 },
);
const ultimo = (await burbujas().allInnerTexts()).at(-1);
assert.ok(ultimo.length > 20, "con la ruta caida el chat se quedo mudo");
res.push("PASS  con la ruta del agente caida el chat responde igual, no se queda mudo");

await nav.close();
console.log("\n" + res.join("\n") + "\n");
