/**
 * Verifica la grabacion larga de /aula: rotacion, persistencia y honestidad.
 *
 *   npm run test:grabacion
 *   URL_APP=https://opened-phi.vercel.app/ npm run test:grabacion
 *
 * Usa el gancho ?seg=N para rotar cada N segundos en vez de cada 5 minutos.
 * Una "clase de 12 minutos con segmentos de 5" se prueba en 12 segundos con
 * segmentos de 4, que es la MISMA maquina de estados.
 */

import { chromium } from "playwright";
import assert from "node:assert/strict";

const BASE = process.env.URL_APP ?? "http://localhost:3001/";
const res = [];

const nav = await chromium.launch({
  args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"],
});
const ctx = await nav.newContext();
await ctx.grantPermissions(["microphone"], { origin: new URL(BASE).origin });
const p = await ctx.newPage();

async function pasarLaPuerta(url) {
  await p.goto(url, { waitUntil: "networkidle" });
  if (await p.locator("text=Permiso registrado").count()) return;
  await p.getByLabel("Institución educativa").fill("IE 1234 José Carlos Mariátegui");
  await p.getByLabel("Aula").fill("4to B");
  await p.getByLabel("Quién autoriza").fill("Directora Carmen Rojas");
  for (const t of [/colegio autoriz/, /familias fueron/, /avisar en voz alta/])
    await p.locator("label", { hasText: t }).locator('input[type="checkbox"]').check();
  await p.getByRole("button", { name: /Registrar el permiso/ }).click();
  await p.waitForSelector("text=Permiso registrado");
}

// Segmentos de 4s: una clase de 12s produce 3 segmentos, misma logica que
// 5 minutos por segmento en una clase de 15.
const URL_AULA = new URL("/aula?seg=4", BASE).href;
await pasarLaPuerta(URL_AULA);

// ------------------------------------------- 1. no hay aviso hasta que graba
assert.equal(await p.locator("text=GRABANDO").count(), 0);
res.push("PASS  el aviso de grabando no existe antes de empezar");

// ----------------------------------- 2. rotacion: 12 segundos -> 3 segmentos
await p.getByRole("button", { name: /Empezar a grabar la clase/ }).click();
await p.waitForSelector("text=GRABANDO", { timeout: 8000 });
res.push("PASS  aviso permanente de GRABANDO visible con contador");

await p.waitForTimeout(13000);
await p.getByRole("button", { name: /Terminar la clase/ }).click();
await p.waitForSelector("text=Empezar a grabar la clase", { timeout: 10000 });

const contados = Number(
  await p.locator("dt", { hasText: "Segmentos guardados" }).locator("xpath=following-sibling::dd").innerText(),
);
assert.ok(contados >= 3, `esperaba 3 o mas segmentos, hubo ${contados}`);
res.push(`PASS  rotacion produjo ${contados} segmentos en una clase de 13s con corte de 4s`);

// -------------------------------- 3. los segmentos son webm validos y pesan
const validos = await p.evaluate(async () => {
  const db = await new Promise((r, j) => {
    const q = indexedDB.open("opened", 1);
    q.onsuccess = () => r(q.result);
    q.onerror = () => j(q.error);
  });
  const todos = await new Promise((r, j) => {
    const q = db.transaction("segmentos", "readonly").objectStore("segmentos").getAll();
    q.onsuccess = () => r(q.result);
    q.onerror = () => j(q.error);
  });
  const salida = [];
  for (const s of todos) {
    const cab = new Uint8Array(await s.blob.slice(0, 4).arrayBuffer());
    salida.push({
      indice: s.indice,
      bytes: s.blob.size,
      inicioMs: s.inicioMs,
      duracionMs: s.duracionMs,
      // 1a45dfa3 es la cabecera EBML. Si esta, el webm es decodificable solo.
      ebml: [...cab].map((b) => b.toString(16).padStart(2, "0")).join("") === "1a45dfa3",
    });
  }
  return salida.sort((a, b) => a.indice - b.indice);
});

assert.ok(validos.length >= 3);
assert.ok(validos.every((s) => s.ebml), "algun segmento no tiene cabecera EBML propia");
assert.ok(validos.every((s) => s.bytes > 1000), "algun segmento salio casi vacio");
// Cada segmento arranca donde termino el anterior, sin solaparse.
for (let i = 1; i < validos.length; i++) {
  assert.ok(
    validos[i].inicioMs >= validos[i - 1].inicioMs + validos[i - 1].duracionMs - 500,
    "los segmentos se solapan",
  );
}
res.push(
  `PASS  cada segmento es un webm valido por si solo (cabecera EBML propia), ${validos.map((s) => s.bytes).join("/")} bytes, sin solape`,
);

// --------------------------------------- 4. sobrevive a recargar la pagina
await p.reload({ waitUntil: "networkidle" });
await p.waitForSelector("text=Clase anterior recuperada", { timeout: 8000 });
const txt = await p.locator("text=Clase anterior recuperada").locator("xpath=..").innerText();
assert.match(txt, /segmentos/);
res.push("PASS  al recargar, la clase anterior se recupera con sus segmentos");

// ------------- 5. UN SOLO getUserMedia: rotar no debe apagar el microfono
// Se cuentan las llamadas de verdad. Si rotar parara las pistas del stream,
// el hook tendria que volver a pedir el microfono en cada segmento, y en un
// navegador real eso hace parpadear el indicador o repreguntar el permiso.
await p.addInitScript(() => {
  const real = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  window.__gum = 0;
  navigator.mediaDevices.getUserMedia = (...a) => {
    window.__gum++;
    return real(...a);
  };
});
await p.reload({ waitUntil: "networkidle" });
await p.getByRole("button", { name: /Empezar a grabar la clase/ }).click();
await p.waitForSelector("text=GRABANDO", { timeout: 8000 });
await p.waitForTimeout(9500);

const enVivo = await p.evaluate(() => window.__gum);
await p.getByRole("button", { name: /Terminar la clase/ }).click();
await p.waitForSelector("text=Empezar a grabar la clase", { timeout: 10000 });

const trasRotar = Number(
  await p.locator("dt", { hasText: "Segmentos guardados" }).locator("xpath=following-sibling::dd").innerText(),
);
assert.ok(trasRotar >= 2, `esperaba al menos 2 rotaciones, hubo ${trasRotar}`);
assert.equal(enVivo, 1, `pidio el microfono ${enVivo} veces; con rotacion correcta es 1`);
res.push(`PASS  ${trasRotar} segmentos con UNA sola llamada a getUserMedia: rotar no apaga el microfono`);

// ------- 5b. pestana en segundo plano: se detecta y se DICE, no se tapa
await p.getByRole("button", { name: /Empezar a grabar la clase/ }).click();
await p.waitForSelector("text=GRABANDO", { timeout: 8000 });
await p.waitForTimeout(1000);
// Playwright no puede mandar la pestana al fondo de verdad, asi que se simula
// el evento que el navegador dispara. Lo que se prueba es MI manejo del caso.
await p.evaluate(() => {
  Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
  document.dispatchEvent(new Event("visibilitychange"));
});
await p.waitForTimeout(3000);
await p.evaluate(() => {
  Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
  document.dispatchEvent(new Event("visibilitychange"));
});
await p.waitForSelector("text=/segundo plano/", { timeout: 8000 });
res.push("PASS  la pestana en segundo plano se detecta y se avisa en pantalla");
await p.getByRole("button", { name: /Terminar la clase/ }).click();
await p.waitForSelector("text=Empezar a grabar la clase", { timeout: 10000 });

// ------------------------------------------ 6. borrar se lleva el audio
await p.getByRole("button", { name: /Borrar la sesi.n y su audio/ }).click();
await p.waitForSelector("text=Registro del permiso", { timeout: 8000 });
const quedan = await p.evaluate(async () => {
  const db = await new Promise((r, j) => {
    const q = indexedDB.open("opened", 1);
    q.onsuccess = () => r(q.result);
    q.onerror = () => j(q.error);
  });
  return new Promise((r, j) => {
    const q = db.transaction("segmentos", "readonly").objectStore("segmentos").count();
    q.onsuccess = () => r(q.result);
    q.onerror = () => j(q.error);
  });
});
assert.equal(quedan, 0, `quedaron ${quedan} segmentos de audio despues de borrar`);
res.push("PASS  borrar la sesion dejo IndexedDB en cero: el audio se fue de verdad");

await nav.close();
console.log("\n" + res.join("\n") + "\n");
