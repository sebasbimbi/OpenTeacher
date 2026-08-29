/**
 * EL CASO QUE SE PROYECTA, de punta a punta.
 *
 *   npm run test:escena
 *   URL_APP=https://opened-phi.vercel.app/ npm run test:escena
 *
 * Todo lo demas puede fallar y sobrevivimos. Este camino no.
 */

import { chromium } from "playwright";
import assert from "node:assert/strict";

const BASE = process.env.URL_APP ?? "http://localhost:3001/";
const RELATO =
  "Profe, hoy un alumno de segundo me empujo y me grito delante de todo el salon cuando le llame la atencion. Me quede temblando y no supe que hacer.";
const res = [];

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1280, height: 800 } });
const p = await ctx.newPage();
const errores = [];
p.on("pageerror", (e) => errores.push(String(e)));
p.on("console", (m) => m.type() === "error" && errores.push(m.text()));

await p.goto(BASE, { waitUntil: "networkidle" });
await p.getByLabel("Mensaje").fill(RELATO);
await p.getByRole("button", { name: "Enviar mensaje" }).click();
await p.waitForSelector("[data-clave]", { timeout: 60000 });
await p.locator('[aria-label*="escribiendo"]').waitFor({ state: "detached", timeout: 40000 }).catch(() => {});
await p.waitForTimeout(1200);

// --- 1. La clave del caso.
const clave = await p.locator("[data-clave]").last().getAttribute("data-clave");
assert.equal(clave, "docente_agredido", `la tarjeta salio con la clave ${clave}`);
res.push("PASS  la agresion hacia la docente cae en docente_agredido");

// --- 2. El vacio se VE: guion largo donde iria el numero.
const ficha = await p.locator("[data-clave]").last().innerText();
assert.match(ficha, /[—–]/, "la tarjeta no pinta el guion largo del vacio normativo");
assert.match(ficha, /S[ií]seVe/i);
assert.equal(/\bProtocolo\s*0[1-7]\b/.test(ficha), false, "le asigno un protocolo que no le corresponde");
res.push("PASS  la tarjeta pinta el guion largo del vacio, sin inventar protocolo");

// --- 3. Cero digitos de norma en la PROSA DEL AGENTE de este turno.
const prosa = await p.evaluate(() =>
  [...document.querySelectorAll('ol > li:not([aria-label*="escribiendo"])')]
    .map((li) => {
      const c = li.cloneNode(true);
      c.querySelectorAll("[data-clave]").forEach((f) => f.remove());
      return c.textContent ?? "";
    })
    .join("\n"),
);
const digitos = prosa.match(/\b(29719|29733|29988|383-2025|004-2018|0800[\s-]?\d+|\b1\d{2}\b|art\.?\s*\d+|\d+\s*d[ií]as)\b/gi);
assert.equal(digitos, null, `el agente escribio digitos: ${digitos}`);
res.push("PASS  cero digitos de norma en la prosa del agente en ESTE turno");

// --- 4. El cuaderno cierra el circulo y su hoja abre.
await p.getByRole("button", { name: /Cuaderno de aula/ }).click();
await p.waitForSelector('[data-overlay="cuaderno"]', { timeout: 10000 });
res.push("PASS  la burbuja del cuaderno abre el overlay");

// --- 5. Sin errores de consola en todo el camino.
assert.deepEqual(errores, [], `errores en consola: ${errores.join(" | ")}`);
res.push("PASS  cero errores de consola en todo el camino");

await nav.close();
console.log("\n" + res.join("\n") + "\n");
