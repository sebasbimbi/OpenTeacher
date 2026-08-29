/**
 * Verifica la PUERTA DE CONSENTIMIENTO de /aula.
 *
 *   npm run test:aula                              # contra localhost:3001
 *   URL_APP=https://opened-phi.vercel.app/ npm run test:aula
 *
 * Criterio de listo: no debe existir NINGUNA forma de llegar a grabar sin
 * pasar por la puerta. Se comprueba en el DOM, no a ojo: un boton oculto
 * por CSS seguiria siendo alcanzable por teclado o por script.
 */

import { chromium } from "playwright";
import assert from "node:assert/strict";

const BASE = process.env.URL_APP ?? "http://localhost:3001/";
const URL_AULA = new URL("/aula", BASE).href;
const res = [];

const nav = await chromium.launch();
const ctx = await nav.newContext();
const p = await ctx.newPage();

// ---------------------------------------------- 1. sin consentimiento, sin grabar
await p.goto(URL_AULA, { waitUntil: "networkidle" });
await p.waitForSelector("text=Registro del permiso");

const grabarAntes = await p.evaluate(() =>
  [...document.querySelectorAll("button, input, a")]
    .map((el) => (el.textContent || el.getAttribute("aria-label") || "").trim())
    .filter((t) => /grabar la clase|iniciar grabacion|empezar a grabar|subir audio/i.test(t)),
);
assert.deepEqual(grabarAntes, [], `hay controles de grabacion antes del permiso: ${grabarAntes}`);
assert.equal(await p.locator("text=Permiso registrado").count(), 0);
res.push("PASS  sin permiso no existe ningun control de grabacion en el DOM");

// -------------------------------------- 2. incompleto sigue sin abrir la puerta
await p.getByLabel("Institucion educativa").fill("IE 1234 Jose Carlos Mariategui");
await p.getByLabel("Aula").fill("4to B");
await p.getByLabel("Quien autoriza").fill("Directora Carmen Rojas");
// A proposito: NO marco las tres casillas.
await p.getByRole("button", { name: /Registrar el permiso/ }).click();
await p.waitForSelector('[role="alert"]:not(#__next-route-announcer__)');
const aviso = await p.locator('[role="alert"]:not(#__next-route-announcer__)').innerText();
assert.match(aviso, /autorizacion del colegio/);
assert.equal(await p.locator("text=Permiso registrado").count(), 0, "abrio la puerta sin las casillas");
res.push("PASS  con datos pero sin las tres casillas la puerta NO abre, y dice que falta");

// ------------------------------------------------ 3. completo abre la consola
for (const t of [
  /La direccion del colegio autorizo/,
  /Las familias fueron informadas/,
  /avisar en voz alta a los estudiantes/,
]) {
  await p.locator("label", { hasText: t }).locator('input[type="checkbox"]').check();
}
await p.getByRole("button", { name: /Registrar el permiso/ }).click();
await p.waitForSelector("text=Permiso registrado", { timeout: 5000 });
assert.equal(await p.locator("text=IE 1234 Jose Carlos Mariategui").count() > 0, true);
res.push("PASS  con el registro completo aparece la consola con el permiso a la vista");

// -------------------------------------------- 4. sobrevive a recargar la pagina
await p.reload({ waitUntil: "networkidle" });
await p.waitForSelector("text=Permiso registrado", { timeout: 5000 });
res.push("PASS  el permiso sobrevive a recargar");

// ------------------------------------- 5. borrar deja todo cerrado otra vez
await p.getByRole("button", { name: /Borrar la sesion/ }).click();
await p.waitForSelector("text=Registro del permiso", { timeout: 5000 });
assert.equal(await p.locator("text=Permiso registrado").count(), 0);
await p.reload({ waitUntil: "networkidle" });
await p.waitForSelector("text=Registro del permiso");
assert.equal(await p.locator("text=Permiso registrado").count(), 0, "el permiso revivio al recargar");
res.push("PASS  borrar cierra la puerta y no revive al recargar");

// ------------------------- 6. el simulador de WhatsApp quedo intacto
await p.goto(BASE, { waitUntil: "networkidle" });
assert.equal(await p.locator("ol > li").count(), 1);
await p.getByRole("button", { name: "Grabar nota de voz" }).waitFor({ timeout: 5000 });
res.push("PASS  el simulador de WhatsApp sigue intacto");

await nav.close();
console.log("\n" + res.join("\n") + "\n");
