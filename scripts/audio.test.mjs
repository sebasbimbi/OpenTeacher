/**
 * Prueba de la ruta de audio en un navegador real.
 *
 *   npm run test:audio                                    # contra localhost:3001
 *   URL_APP=https://opened-phi.vercel.app/ npm run test:audio   # contra produccion
 *
 * Corre en Chromium con dispositivo de audio falso, asi que no necesita
 * microfono ni permisos del sistema. Cubre los tres modos de falla que
 * nos morderian en vivo mas el camino feliz y cancelar.
 *
 * Los casos 2 y 3 sustituyen getUserMedia por uno que rechaza con el
 * DOMException correspondiente: es la unica forma determinista de
 * reproducir "permiso denegado" y "microfono ocupado" sin tocar el SO.
 */

import { chromium } from "playwright";
import assert from "node:assert/strict";

const URL_APP = process.env.URL_APP ?? "http://localhost:3001/";
const resultados = [];

function ok(nombre, detalle = "") {
  resultados.push(`PASS  ${nombre}${detalle ? "  |  " + detalle : ""}`);
}
function fail(nombre, detalle) {
  resultados.push(`FAIL  ${nombre}  |  ${detalle}`);
}

async function nuevaPagina(navegador, { permitirMic, inyectar } = {}) {
  const ctx = await navegador.newContext();
  if (permitirMic) await ctx.grantPermissions(["microphone"], { origin: new URL(URL_APP).origin });
  const p = await ctx.newPage();
  if (inyectar) await p.addInitScript(inyectar);
  await p.goto(URL_APP, { waitUntil: "networkidle" });
  return { ctx, p };
}

const mic = (p) => p.getByRole("button", { name: /Grabar nota de voz|Terminar y enviar/ });
// Next monta su propio [role=alert] vacio (route announcer). Solo queremos el nuestro.
const aviso = (p) => p.locator('[role="alert"]:not(#__next-route-announcer__)');

// ---------------------------------------------------------------- 1. feliz
async function caminoFeliz(navegador) {
  const nombre = "1. graba, mide duracion real, transcribe y responde";
  const { ctx, p } = await nuevaPagina(navegador, { permitirMic: true });
  try {
    const codec = await p.evaluate(() =>
      ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].filter((t) =>
        MediaRecorder.isTypeSupported(t),
      ),
    );

    await mic(p).click();
    await p.waitForSelector("text=/Grabando 0:0/", { timeout: 5000 });
    await p.waitForTimeout(2400);
    await mic(p).click();

    await p.waitForSelector("text=Transcribiendo...", { timeout: 5000 });
    await p.waitForSelector("text=/dos chicos de cuarto/", { timeout: 15000 });
    await p.waitForSelector("text=/primero usted/", { timeout: 10000 });

    const duracion = await p
      .locator('button[aria-label="Reproducir nota de voz"]')
      .last()
      .locator("xpath=following-sibling::span[2]")
      .innerText();

    const real = await p.evaluate(() => {
      const a = [...document.querySelectorAll("audio")].pop();
      return a ? { src: a.src.slice(0, 5), tiene: true } : { tiene: false };
    });

    assert.match(duracion, /^0:0[23]$/, `duracion medida fue ${duracion}, esperaba 0:02 o 0:03`);
    assert.equal(real.tiene, true, "no se creo el elemento audio para reproducir");
    assert.equal(real.src, "blob:", "el audio no apunta a un blob local");
    ok(nombre, `codecs soportados: ${codec.join(", ")} | duracion mostrada: ${duracion}`);
  } catch (e) {
    fail(nombre, e.message);
  } finally {
    await ctx.close();
  }
}

// ------------------------------------------------------- 2. permiso denegado
async function permisoDenegado(navegador) {
  const nombre = "2. permiso de microfono denegado";
  const { ctx, p } = await nuevaPagina(navegador, {
    permitirMic: false,
    inyectar: () => {
      navigator.mediaDevices.getUserMedia = () =>
        Promise.reject(
          Object.assign(new Error("Permission denied"), { name: "NotAllowedError" }),
        );
    },
  });
  try {
    await mic(p).click();
    const alerta = aviso(p);
    await alerta.waitFor({ timeout: 5000 });
    const texto = await alerta.innerText();
    assert.match(texto, /permiso/i);

    // La pagina sigue usable: se puede escribir y enviar.
    await p.getByLabel("Mensaje").fill("Escribo porque no pude grabar");
    await p.getByRole("button", { name: "Enviar mensaje" }).click();
    await p.waitForSelector("text=Escribo porque no pude grabar", { timeout: 5000 });
    await p.waitForSelector("text=/primero usted/", { timeout: 10000 });
    ok(nombre, `mensaje mostrado y chat sigue usable`);
  } catch (e) {
    fail(nombre, e.message);
  } finally {
    await ctx.close();
  }
}

// -------------------------------------------------------- 3. microfono ocupado
async function microfonoOcupado(navegador) {
  const nombre = "3. microfono ocupado por otra app";
  const { ctx, p } = await nuevaPagina(navegador, {
    permitirMic: false,
    inyectar: () => {
      navigator.mediaDevices.getUserMedia = () =>
        Promise.reject(
          Object.assign(new Error("Could not start audio source"), { name: "NotReadableError" }),
        );
    },
  });
  try {
    await mic(p).click();
    const alerta = aviso(p);
    await alerta.waitFor({ timeout: 5000 });
    const texto = await alerta.innerText();
    assert.match(texto, /ocupado por otra aplicacion/i);

    // No quedo en estado "grabando" colgado.
    const grabando = await p.locator("text=/Grabando 0:/").count();
    assert.equal(grabando, 0, "la barra quedo en estado grabando despues del fallo");
    ok(nombre, "mensaje correcto y la barra volvio a inactivo");
  } catch (e) {
    fail(nombre, e.message);
  } finally {
    await ctx.close();
  }
}

// ----------------------------------------------------------- 4. muy corto
async function muyCorto(navegador) {
  const nombre = "4. grabacion de menos de un segundo";
  const { ctx, p } = await nuevaPagina(navegador, { permitirMic: true });
  try {
    const burbujasAntes = await p.locator("ol > li").count();

    await mic(p).click();
    await p.waitForSelector("text=/Grabando 0:0/", { timeout: 5000 });
    await p.waitForTimeout(300);
    await mic(p).click();

    const alerta = aviso(p);
    await alerta.waitFor({ timeout: 5000 });
    const texto = await alerta.innerText();
    assert.match(texto, /Muy corto/i);

    await p.waitForTimeout(1500);
    const burbujasDespues = await p.locator("ol > li").count();
    assert.equal(burbujasDespues, burbujasAntes, "se agrego una burbuja para un audio descartado");

    // Se recupera: una grabacion normal despues del error sigue funcionando.
    await mic(p).click();
    await p.waitForTimeout(1600);
    await mic(p).click();
    await p.waitForSelector("text=/dos chicos de cuarto/", { timeout: 15000 });
    ok(nombre, "descartado sin burbuja y la siguiente grabacion funciona");
  } catch (e) {
    fail(nombre, e.message);
  } finally {
    await ctx.close();
  }
}

// ------------------------------------------------------------- 5. cancelar
async function cancelar(navegador) {
  const nombre = "5. cancelar una grabacion en curso";
  const { ctx, p } = await nuevaPagina(navegador, { permitirMic: true });
  try {
    const antes = await p.locator("ol > li").count();
    await mic(p).click();
    await p.waitForTimeout(1400);
    await p.getByRole("button", { name: "Cancelar grabacion" }).click();
    await p.waitForTimeout(800);

    assert.equal(await p.locator("ol > li").count(), antes, "cancelar dejo una burbuja");
    assert.equal(await aviso(p).count(), 0, "cancelar mostro un error");
    assert.equal(await p.locator("text=/Grabando 0:/").count(), 0, "quedo grabando");
    ok(nombre, "sin burbuja, sin error, barra en inactivo");
  } catch (e) {
    fail(nombre, e.message);
  } finally {
    await ctx.close();
  }
}

const navegador = await chromium.launch({
  args: [
    "--use-fake-device-for-media-stream",
    "--use-fake-ui-for-media-stream",
    "--autoplay-policy=no-user-gesture-required",
  ],
});

await caminoFeliz(navegador);
await permisoDenegado(navegador);
await microfonoOcupado(navegador);
await muyCorto(navegador);
await cancelar(navegador);
await navegador.close();

console.log("\n" + resultados.join("\n") + "\n");
process.exit(resultados.some((r) => r.startsWith("FAIL")) ? 1 : 0);
