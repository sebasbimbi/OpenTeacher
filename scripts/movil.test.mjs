/**
 * Verifica la PWA en viewport movil, por defecto CONTRA PRODUCCION.
 *
 *   npm run test:movil                              # contra opened-phi.vercel.app
 *   URL_APP=http://localhost:3001/ npm run test:movil
 *
 * Apunta a produccion a proposito: getUserMedia exige contexto seguro y
 * localhost lo cumple por excepcion, asi que probar solo en localhost no
 * dice nada sobre si el microfono va a funcionar en el telefono de alguien.
 *
 * Lo que se prueba no es que la interfaz "se vea bien" sino que el
 * microfono GRABE de verdad con un toque, en 390px, sobre https.
 */

import { chromium, devices } from "playwright";
import assert from "node:assert/strict";

const URL_APP = process.env.URL_APP ?? "https://opened-phi.vercel.app/";
const origin = new URL(URL_APP).origin;
const res = [];

const nav = await chromium.launch({
  args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"],
});

// Perfil movil real: touch, sin mouse, DPR 3, 390x844.
const ctx = await nav.newContext({
  ...devices["iPhone 13"],
  // Chromium no expone el UA de Safari, pero lo que probamos es el viewport,
  // el touch y getUserMedia, no el user agent.
  isMobile: true,
  hasTouch: true,
});
await ctx.grantPermissions(["microphone"], { origin });
const p = await ctx.newPage();
await p.goto(URL_APP, { waitUntil: "networkidle" });

// 1. Contexto seguro: sin esto getUserMedia ni existe.
const seguro = await p.evaluate(() => ({
  isSecureContext: window.isSecureContext,
  protocolo: location.protocol,
  tieneGUM: typeof navigator.mediaDevices?.getUserMedia === "function",
  ancho: window.innerWidth,
  alto: window.innerHeight,
  dpr: devicePixelRatio,
}));
assert.equal(seguro.isSecureContext, true);
assert.equal(seguro.tieneGUM, true);
res.push(`PASS  contexto seguro en movil  |  ${seguro.protocolo} ${seguro.ancho}x${seguro.alto} dpr${seguro.dpr}, getUserMedia disponible`);

// 2. La barra de escribir esta VISIBLE dentro del viewport, no debajo del fold.
const barra = await p.locator("form").boundingBox();
assert.ok(barra.y + barra.height <= seguro.alto + 1,
  `la barra termina en ${barra.y + barra.height} y el viewport mide ${seguro.alto}`);
res.push(`PASS  barra de escribir dentro del fold  |  termina en ${Math.round(barra.y + barra.height)} de ${seguro.alto}`);

// 3. La pantalla arranca SOLO con el saludo, sin nota semilla muerta.
assert.equal(await p.locator("ol > li").count(), 1);
assert.equal(await p.locator('button[aria-label="Reproducir nota de voz"]').count(), 0,
  "quedo un boton de play sin audio detras");
res.push("PASS  arranca solo con el saludo  |  sin play deshabilitado");

// 4. LO QUE IMPORTA: grabar de verdad, con TOQUE, en movil contra produccion.
const mic = p.getByRole("button", { name: /Grabar nota de voz|Terminar y enviar/ });
await mic.tap();
await p.waitForSelector("text=/Grabando 0:0/", { timeout: 8000 });
await p.waitForTimeout(2400);
await mic.tap();

await p.waitForSelector("text=Transcribiendo...", { timeout: 8000 });
await p.waitForSelector("text=/dos chicos de cuarto/", { timeout: 20000 });
await p.waitForSelector("text=/Anotado, profe/", { timeout: 12000 });

const audio = await p.evaluate(() => {
  const a = [...document.querySelectorAll("audio")].pop();
  return a ? { src: a.src.slice(0, 5), duracion: a.duration } : null;
});
const dur = await p.locator('button[aria-label="Reproducir nota de voz"]').last()
  .locator("xpath=following-sibling::span[2]").innerText();

assert.ok(audio && audio.src === "blob:", "no se creo el blob del audio grabado");
assert.match(dur, /^0:0[23]$/);
res.push(`PASS  microfono GRABA de verdad en movil contra prod  |  duracion ${dur}, blob creado, transcrito y respondido`);


// 5. Modo standalone (como queda instalada en la pantalla de inicio).
const ctx2 = await nav.newContext({ ...devices["iPhone 13"], isMobile: true, hasTouch: true });
await ctx2.grantPermissions(["microphone"], { origin });
const p2 = await ctx2.newPage();
await p2.addInitScript(() => {
  // Emula el display-mode de una PWA instalada.
  const real = window.matchMedia;
  window.matchMedia = (q) =>
    q.includes("display-mode: standalone") ? { matches: true, media: q, addEventListener() {}, removeEventListener() {} } : real(q);
});
await p2.goto(URL_APP, { waitUntil: "networkidle" });
const barra2 = await p2.locator("form").boundingBox();
const alto2 = await p2.evaluate(() => window.innerHeight);
assert.ok(barra2.y + barra2.height <= alto2 + 1);
res.push("PASS  standalone: barra sigue dentro del fold");

await nav.close();
console.log("\n" + res.join("\n") + "\n");
