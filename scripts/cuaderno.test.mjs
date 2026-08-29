/**
 * Verifica el OVERLAY del cuaderno en el DOM.
 *
 *   npm run test:cuaderno
 *   URL_APP=https://openteacher-peru.vercel.app/ npm run test:cuaderno
 *
 * Lo que se defiende:
 *  - la burbuja abre el overlay SIN cambiar de ruta (nada de barra de URL
 *    nueva en el proyector),
 *  - las dos vistas viven dentro del mismo overlay y se navega entre ellas,
 *  - los numeros de la hoja son los que calcula lib/cuaderno.ts,
 *  - ni un nombre propio de menor en pantalla,
 *  - Escape vuelve atras y despues cierra,
 *  - la hoja A4 se imprime sola: el resto de la pagina se oculta.
 */

import { chromium } from "playwright";
import assert from "node:assert/strict";

const BASE = process.env.URL_APP ?? "http://localhost:3001/";
const URL_BANCO = new URL("/ficha-prueba", BASE).href;
const res = [];

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1280, height: 800 } });
const p = await ctx.newPage();

const errores = [];
p.on("console", (m) => m.type() === "error" && errores.push(m.text()));

await p.goto(URL_BANCO, { waitUntil: "networkidle" });
const urlAntes = p.url();

// -------------------------------------------- 1. la burbuja abre sin cambiar de ruta
const burbuja = p.getByRole("button", { name: /Cuaderno de aula/ });
await burbuja.waitFor();
assert.match(await burbuja.innerText(), /21 registros/, "la burbuja debe decir cuantos registros hay");
await burbuja.click();

const overlay = p.locator('[data-overlay="cuaderno"]');
await overlay.waitFor();
assert.equal(p.url(), urlAntes, "el cuaderno cambio de ruta: en escena eso muestra la barra de URL");
res.push("PASS  la burbuja abre el overlay sin cambiar de ruta");

// ------------------------------------------------------- 2. vista de aula
const textoAula = await overlay.innerText();
assert.match(textoAula, /Por estudiante/i);
assert.match(textoAula, /27/, "faltan los dias de clase, que son el denominador");
for (const iniciales of ["M. Q. R.", "A. T. L.", "J. P. S.", "D. V. M.", "K. R. H."]) {
  assert.ok(textoAula.includes(iniciales), `falta ${iniciales} en el resumen de aula`);
}
assert.match(
  textoAula,
  /agredida a la docente/,
  "el resumen debe nombrar el caso que el SiseVe no registra",
);
res.push("PASS  el resumen de aula lista a los cinco por iniciales, con denominador");

// ------------------------------------- 3. se entra a la hoja dentro del mismo overlay
await overlay.getByRole("button", { name: /M\. Q\. R\./ }).click();
await p.locator(".hoja-a4").waitFor();
assert.equal(p.url(), urlAntes, "abrir la hoja cambio de ruta");
const hoja = await p.locator(".hoja-a4").innerText();

assert.match(hoja, /Reporte de seguimiento en aula/i);
assert.match(hoja, /M\. Q\. R\./);
assert.match(hoja, /En 27 días de clase se registraron 8 situaciones/);
assert.match(hoja, /En 5, se levantó de su sitio e interrumpió la clase en voz alta/);
assert.match(hoja, /En 2, respondió con groserías/);
assert.match(hoja, /7 de las 8 ocurrieron en la última hora/);
assert.match(hoja, /Antes del cambio de ubicación hubo 6; después, 2/);
res.push("PASS  la hoja pinta los numeros que calcula el cuaderno, no otros");

// ------------------------------------------- 4. ni un nombre propio de menor
const NOMBRE_SUELTO = /(?<=\s)(Mateo|Carmen|Silvia|Jenny|Mara|Nicolas|Nicolás|Mariale)\b/;
assert.doesNotMatch(hoja, NOMBRE_SUELTO, "hay un nombre propio en la hoja que se lleva la familia");
assert.doesNotMatch(hoja, /\bcolegio\s+[A-ZÁÉÍÓÚÑ]/, "la hoja nombra un colegio");
assert.match(hoja, /No es registro oficial/, "la hoja debe decir que no es registro oficial");
res.push("PASS  la hoja va por iniciales y declara que no es registro oficial");

// -------------------------------- 5. lo que falta se ve marcado, no se disfraza
const pendientes = await p.locator("[data-pendiente='si']").count();
assert.ok(pendientes > 0, "la prosa de las docentes aun no llega y deberia verse marcada");
assert.match(hoja, /PENDIENTE DOCENTES/, "un placeholder sin marcar se proyecta como texto real");
res.push(`PASS  ${pendientes} secciones pendientes se ven marcadas, no disfrazadas`);

// ------------------------------------------- 6. Escape vuelve atras, y luego cierra
await p.keyboard.press("Escape");
await p.locator('[data-overlay="cuaderno"]').waitFor();
assert.equal(await p.locator(".hoja-a4").count(), 0, "Escape deberia volver al resumen de aula");
await p.keyboard.press("Escape");
await p.locator('[data-overlay="cuaderno"]').waitFor({ state: "detached" });
res.push("PASS  Escape vuelve al aula y despues cierra el cuaderno");

// --------------------------------------- 7. impresion: solo la hoja llega al papel
await burbuja.click();
await overlay.getByRole("button", { name: /M\. Q\. R\./ }).click();
await p.locator(".hoja-a4").waitFor();
await p.emulateMedia({ media: "print" });

// Se mide si el elemento OCUPA CAJA, no su `visibility`: un display:none
// sigue reportando visibility "visible" y el check pasaria en falso.
const impresion = await p.evaluate(() => {
  const pintado = (el) => !!el && el.getClientRects().length > 0;
  return {
    hoja: pintado(document.querySelector(".hoja-a4")),
    cabecera: pintado(document.querySelector('[data-overlay="cuaderno"] header')),
    botonImprimir: [...document.querySelectorAll("button")].some(
      (b) => /Imprimir la hoja/.test(b.textContent) && pintado(b),
    ),
    chatDetras: [...document.body.children].some(
      (n) => !n.matches('[data-overlay="cuaderno"]') && n.getClientRects().length > 0,
    ),
  };
});
assert.equal(impresion.hoja, true, "la hoja no se ve al imprimir");
assert.equal(impresion.cabecera, false, "la cabecera verde de WhatsApp se cuela en el papel");
assert.equal(impresion.botonImprimir, false, "el boton de imprimir sale impreso en la hoja");
assert.equal(impresion.chatDetras, false, "el chat de atras sigue ocupando papel y pagina en blanco");
// Ojo: dejarlo fijado en "screen" hace que page.pdf() imprima con estilos de
// pantalla y la hoja vuelve a paginar en cuatro. Se suelta la emulacion.
await p.emulateMedia({ media: null });
res.push("PASS  al imprimir solo llega la hoja: sin cabecera ni botones");

// ------------------- 8. la hoja entra en UNA pagina A4, comprobado imprimiendo
//
// Esto no se mira a ojo: se genera el PDF y se cuentan las paginas. La
// primera version daba 4 porque `visibility: hidden` oculta pero conserva el
// alto, y el chat de atras seguia paginando en blanco. Un check de una linea
// que habria cazado eso solo.

const pdf = await p.pdf({ format: "A4", printBackground: true });
const arbol = pdf.toString("latin1").match(/\/Type\s*\/Pages[\s\S]{0,200}?\/Count\s+(\d+)/);
assert.ok(arbol, "no se pudo leer el arbol de paginas del PDF");
assert.equal(
  Number(arbol[1]),
  1,
  `la hoja salio en ${arbol[1]} paginas A4. Es el entregable que la docente lleva a la reunion: va en una.`,
);
res.push("PASS  la hoja imprime en una sola pagina A4");

// ------------------------------------------------------------- 9. consola limpia
assert.deepEqual(errores, [], `la consola tiro errores: ${errores.join(" | ")}`);
res.push("PASS  consola sin errores");

await nav.close();
console.log(res.join("\n"));
console.log(`\ncuaderno: ${res.length} comprobaciones OK`);
