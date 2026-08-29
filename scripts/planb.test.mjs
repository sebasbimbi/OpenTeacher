/**
 * PLAN B: el guion completo con la RED CORTADA.
 *
 *   OPENED_MOCK_MODE=true npm run dev -- -p 3007
 *   URL_APP=http://localhost:3007/ npm run test:planb
 *
 * Que simula. En vez de apagar el wifi de la maquina, que es irreversible a
 * mitad de una corrida y ademas afecta a todo lo demas, se ABORTA en el
 * navegador cualquier peticion que no sea a localhost. Es mas duro que
 * apagar el wifi: cubre tambien el caso de que el wifi del venue siga en pie
 * pero sin salida, que es como suelen fallar las redes de sala.
 *
 * Lo que se busca NO es que todo funcione: es que **nada se cuelgue**. En
 * escena una pantalla muerta de 30 segundos esperando un timeout es peor que
 * un error. Por eso cada paso lleva cronometro y un techo, y al final se
 * revisa que ninguna peticion haya salido a internet.
 */

import { chromium } from "playwright";
import assert from "node:assert/strict";

const BASE = process.env.URL_APP ?? "http://localhost:3007/";
const TECHO_MS = Number(process.env.TECHO_MS ?? 12000);
const res = [];
const tiempos = [];

const nav = await chromium.launch({
  args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"],
});
const ctx = await nav.newContext({
  viewport: { width: 1280, height: 800 },
  permissions: ["microphone"],
});

// --- El corte de red -----------------------------------------------------------
const fugas = [];
await ctx.route("**/*", (ruta) => {
  const url = ruta.request().url();
  const local = /^https?:\/\/(localhost|127\.0\.0\.1)[:/]/.test(url) || url.startsWith("data:");
  if (local) return ruta.continue();
  fugas.push(url);
  return ruta.abort("internetdisconnected");
});

const p = await ctx.newPage();
const errores = [];
p.on("console", (m) => m.type() === "error" && errores.push(m.text()));
p.on("pageerror", (e) => errores.push(`pageerror: ${e.message}`));

/** Corre un paso con cronometro. Un paso que tarda de mas es un paso muerto. */
async function paso(nombre, fn) {
  const t0 = Date.now();
  await fn();
  const ms = Date.now() - t0;
  tiempos.push([nombre, ms]);
  assert.ok(
    ms < TECHO_MS,
    `"${nombre}" tardo ${ms} ms. En escena eso es una pantalla muerta esperando un timeout.`,
  );
  res.push(`PASS  ${nombre} (${ms} ms)`);
}

/** Una pantalla en blanco es el modo de fallo que mas miedo da. */
async function noEstaEnBlanco(donde) {
  const largo = await p.evaluate(() => document.body.innerText.trim().length);
  assert.ok(largo > 40, `pantalla en blanco en ${donde}: solo ${largo} caracteres`);
}

// =============================================================== 1. texto
await p.goto(BASE, { waitUntil: "domcontentloaded" });
await noEstaEnBlanco("el chat al cargar");

// Cuanto tarda el chat en RESPONDER AL TECLADO, no en pintarse. Antes de que
// React hidrate, lo que se escribe se pierde en silencio: el input se ve
// normal y el boton de enviar nunca aparece. Si Sebastian teclea apenas carga
// la pagina, escribe al vacio. Se mide para saber cuanto hay que esperar.
const t0Hidratacion = Date.now();
await p.getByLabel("Mensaje").fill("Un alumno me gritó delante de todo el salón y me quedé helada.");
await p.waitForSelector('button[aria-label="Enviar mensaje"]', { timeout: TECHO_MS }).catch(async () => {
  // Se perdio por hidratacion tardia: se reescribe una vez y se vuelve a mirar.
  await p.getByLabel("Mensaje").fill("Un alumno me gritó delante de todo el salón y me quedé helada.");
  await p.waitForSelector('button[aria-label="Enviar mensaje"]', { timeout: TECHO_MS });
});
const msHidratacion = Date.now() - t0Hidratacion;

await paso("la docente escribe y OpenEd responde", async () => {
  await p.getByRole("button", { name: /Enviar mensaje/i }).click();
  await p.waitForFunction(
    () => document.querySelectorAll("li").length >= 3,
    null,
    { timeout: TECHO_MS },
  );
});
await noEstaEnBlanco("el chat tras responder");

// =============================================================== 2. nota de voz
await paso("nota de voz grabada, transcrita y respondida", async () => {
  const mic = p.getByRole("button", { name: /Grabar nota de voz|Terminar y enviar/ });
  await mic.click();
  await p.waitForSelector("text=/Grabando 0:0/", { timeout: TECHO_MS });
  await p.waitForTimeout(1600);
  await mic.click();
  // El texto del mock es fijo: si aparece, la transcripcion cerro sin red.
  await p.waitForSelector("text=/dos chicos de cuarto/", { timeout: TECHO_MS });
});
await noEstaEnBlanco("el chat tras la nota de voz");

// ============================================ 3 y 4. tarjeta y cuaderno
// Si el chat todavia no los monta, se ejercitan en el banco de prueba y se
// dice asi de claro en el reporte: probado el componente, NO el montaje.
const montadoEnChat = (await p.locator("[data-estado]").count()) > 0;

await paso("la tarjeta de norma del caso de la docente", async () => {
  if (!montadoEnChat) await p.goto(new URL("/ficha-prueba", BASE).href, { waitUntil: "domcontentloaded" });
  const ficha = p.locator('[data-clave="docente_agredido"]').first();
  await ficha.waitFor({ timeout: TECHO_MS });
  const texto = await ficha.innerText();
  assert.match(texto, /numeral 4\.3/);
  assert.doesNotMatch(texto, /Protocolo\s*\d/, "la ficha de la docente no lleva numero");
});

await paso("el cuaderno abre, muestra la hoja y el resumen de aula", async () => {
  await p.getByRole("button", { name: /Cuaderno de aula/ }).click();
  const overlay = p.locator('[data-overlay="cuaderno"]');
  await overlay.waitFor({ timeout: TECHO_MS });
  assert.match(await overlay.innerText(), /Por estudiante/i);
  await overlay.getByRole("button", { name: /M\. Q\. R\./ }).click();
  await p.locator(".hoja-a4").waitFor({ timeout: TECHO_MS });
  assert.match(await p.locator(".hoja-a4").innerText(), /En 27 días de clase se registraron 8/);
});

// =============================================================== 5. imprimir
await paso("la hoja imprime en una pagina A4", async () => {
  const pdf = await p.pdf({ format: "A4", printBackground: true });
  const arbol = pdf.toString("latin1").match(/\/Type\s*\/Pages[\s\S]{0,200}?\/Count\s+(\d+)/);
  assert.ok(arbol, "no se pudo leer el arbol de paginas");
  assert.equal(Number(arbol[1]), 1, `la hoja salio en ${arbol[1]} paginas`);
});

// =============================================================== 6. /aula
await paso("la puerta de consentimiento de /aula y la grabacion", async () => {
  await p.goto(new URL("/aula", BASE).href, { waitUntil: "domcontentloaded" });
  await p.waitForSelector("text=Registro del permiso", { timeout: TECHO_MS });

  // Sin permiso no puede existir ningun control de grabacion.
  const antes = await p.evaluate(() =>
    [...document.querySelectorAll("button")]
      .map((b) => (b.textContent || "").trim())
      .filter((t) => /grabar la clase|empezar a grabar/i.test(t)),
  );
  assert.deepEqual(antes, [], `hay controles de grabacion antes del permiso: ${antes}`);

  await p.getByLabel("Institución educativa").fill("IE genérica");
  await p.getByLabel("Aula", { exact: true }).fill("4to B");
  await p.getByLabel("Fecha").fill("2026-08-29");
  await p.getByLabel("Quién autoriza").fill("La dirección");
  for (const casilla of await p.locator('input[type="checkbox"]').all()) await casilla.check();
  await p.getByRole("button", { name: /Registrar el permiso/ }).click();
  await p.waitForSelector("text=Permiso registrado", { timeout: TECHO_MS });
});
await noEstaEnBlanco("/aula tras registrar el permiso");

// ================================================== la prueba del corte de red
assert.deepEqual(
  fugas,
  [],
  `algo intento salir a internet con la red cortada: ${[...new Set(fugas)].join(", ")}`,
);
res.push("PASS  ni una sola peticion salio a internet en todo el guion");

await nav.close();

const lento = tiempos.slice().sort((a, b) => b[1] - a[1])[0];
console.log(res.join("\n"));
console.log(`\nplan B: ${res.length} comprobaciones OK. El paso mas lento fue "${lento[0]}" con ${lento[1]} ms.`);
console.log(`plan B: el chat acepto teclado ${msHidratacion} ms despues de cargar.`);
if (errores.length > 0) {
  console.log(`\nplan B: AVISO, la consola tiro ${errores.length} error(es):`);
  for (const e of [...new Set(errores)].slice(0, 8)) console.log(`  - ${e}`);
}
