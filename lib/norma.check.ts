/**
 * Check de la tabla normativa. Corre con `npm run check`.
 *
 * Esta tabla es lo unico que separa "OpenTeacher conoce la norma peruana" de
 * "OpenTeacher invento un numero delante de cuatro docentes". Un comentario
 * pidiendo cuidado no sobrevive a las ultimas dos horas antes de un pitch.
 * Un check que falla, si.
 *
 * Lo que se defiende aca:
 *  1. La tabla esta bien formada y completa: los 7 protocolos, sin huecos.
 *  2. **Ningun digito vive en la prosa.** `ruta[]` y `cuando` son la ruta en
 *     palabras, que es lo unico que el modelo puede repetir. Los digitos
 *     viven en `protocolo`, `plazo` y `hitos[].plazo`, y los pinta la tarjeta.
 *  3. Toda clave que el modelo pueda emitir resuelve, y una clave inventada
 *     cae en la fila prudente en vez de romper la pantalla.
 *  4. Cada fila declara su fuente y su sello.
 */

import assert from "node:assert/strict";
import {
  CLAVES_NORMA,
  CLAVE_RESPALDO,
  NORMA,
  citaCorta,
  etiquetaProtocolo,
  resolverNorma,
  type FilaNorma,
} from "./norma.ts";

const PAGINAS_DEL_PDF = 42;
const SELLOS = ["publicado", "por-contrastar"];
const NIVELES = ["protocolo", "informativa", "sin_norma"];

function noVacio(valor: string, que: string) {
  assert.equal(typeof valor, "string", `${que} deberia ser texto`);
  assert.ok(valor.trim().length > 0, `${que} no puede estar vacio`);
}

// --- 1. La tabla esta bien formada ------------------------------------------

assert.ok(NORMA.length >= 9, "faltan filas: 7 protocolos + docente agredida + sin protocolo");

const claves = NORMA.map((f) => f.clave);
assert.equal(new Set(claves).size, claves.length, "hay claves duplicadas en NORMA");
assert.deepEqual(CLAVES_NORMA, claves, "CLAVES_NORMA se desincronizo de NORMA");

for (const fila of NORMA) {
  noVacio(fila.clave, "clave");
  noVacio(fila.titulo, `titulo de ${fila.clave}`);
  noVacio(fila.cuando, `cuando de ${fila.clave}`);
  assert.ok(NIVELES.includes(fila.nivel), `nivel invalido en ${fila.clave}`);
  assert.ok(SELLOS.includes(fila.verificado), `sello invalido en ${fila.clave}`);
  assert.ok(fila.ruta.length > 0, `${fila.clave} no dice que hacer, que es lo unico que importa`);
  for (const paso of fila.ruta) noVacio(paso, `un paso de ruta de ${fila.clave}`);
  for (const hito of fila.hitos) {
    noVacio(hito.paso, `un hito de ${fila.clave}`);
    noVacio(hito.plazo, `el plazo de un hito de ${fila.clave}`);
  }
}

// --- 2. Los 7 protocolos, completos y sin huecos -----------------------------

const protocolos = NORMA.filter((f) => f.nivel === "protocolo");
assert.equal(protocolos.length, 7, "el Anexo 03 tiene exactamente 7 protocolos");

const numeros = protocolos.map((f) => f.protocolo).sort((a, b) => Number(a) - Number(b));
assert.deepEqual(numeros, [1, 2, 3, 4, 5, 6, 7], "los protocolos deben ir del 1 al 7 sin huecos");

for (const fila of protocolos) {
  assert.notEqual(fila.protocolo, null, `${fila.clave} es un protocolo y necesita numero`);
  noVacio(fila.plazo ?? "", `plazo de ${fila.clave}`);
  assert.ok(fila.bloque, `${fila.clave} necesita su bloque del indice`);
  assert.ok(
    fila.hitos.some((h) => h.paso.toLowerCase().includes("cierre")),
    `${fila.clave} debe declarar cuando cierra el caso`,
  );
}

// Las filas que NO son protocolo no pueden inventarse un numero.
for (const fila of NORMA.filter((f) => f.nivel !== "protocolo")) {
  assert.equal(fila.protocolo, null, `${fila.clave} no es un protocolo y no lleva numero`);
  assert.equal(etiquetaProtocolo(fila), "", `${fila.clave} no deberia tener etiqueta de protocolo`);
}

// --- 3. LA REGLA DURA: ni un digito en la prosa ------------------------------
//
// El modelo repite `ruta` y `cuando`. Si ahi hay un numero, el modelo aprende
// que puede decir numeros, y el dia que alucine uno nadie lo va a notar.

const DIGITO = /\d/;

for (const fila of NORMA) {
  for (const paso of fila.ruta) {
    assert.ok(
      !DIGITO.test(paso),
      `digito en la prosa de ${fila.clave}: "${paso}". Los numeros van en protocolo, plazo o hitos, nunca en la ruta.`,
    );
  }
  assert.ok(
    !DIGITO.test(fila.cuando),
    `digito en "cuando" de ${fila.clave}: "${fila.cuando}". Escribalo en palabras.`,
  );
}

// --- 3b. LA TRAMPA DEL SISEVE -----------------------------------------------
//
// El Portal SiseVe numera sus protocolos del uno al cinco; el Anexo 03 los
// numera del uno al siete, y NO coinciden (tabla de equivalencias, Anexo
// N.02, pdf p.42). "Reportalo en SiseVe como protocolo tres" manda a la
// docente a castigo humillante de personal de la IE, no a armas. Y la tabla
// de equivalencias ni siquiera cubre armas ni entorno familiar.
// Por eso: ninguna cadena visible puede poner SiseVe cerca de un digito.

const SISEVE_CON_DIGITO = /(s[ií]seve[^.]{0,40}\d)|(\d[^.]{0,40}s[ií]seve)/i;

for (const fila of NORMA) {
  const visibles = [fila.titulo, fila.cuando, fila.noAplica ?? "", ...fila.ruta];
  for (const texto of visibles) {
    assert.ok(
      !SISEVE_CON_DIGITO.test(texto),
      `${fila.clave} pone un numero cerca de SiseVe: "${texto}". El SiseVe numera distinto que el Anexo 03.`,
    );
  }
}

// Y el numero que se pinta siempre se declara como del Anexo 03, nunca suelto.
for (const fila of protocolos) {
  assert.match(
    citaCorta(fila),
    /del Anexo 03$/,
    `la cita de ${fila.clave} debe decir de que anexo es el numero, o se confunde con el del SiseVe`,
  );
}

// --- 4. Toda clave resuelve, y lo inventado no rompe nada --------------------

for (const clave of CLAVES_NORMA) {
  assert.equal(resolverNorma(clave).clave, clave, `la clave ${clave} no resuelve a su propia fila`);
}

const respaldo = NORMA.find((f) => f.clave === CLAVE_RESPALDO);
assert.ok(respaldo, "falta la fila de respaldo");
assert.equal(respaldo.nivel, "sin_norma", "el respaldo tiene que ser la ficha mas prudente");

for (const basura of ["protocolo_99", "", "   ", "PROTOCOLO_01", null, undefined]) {
  const fila = resolverNorma(basura as string | null | undefined);
  assert.equal(
    fila.clave,
    CLAVE_RESPALDO,
    `una clave inventada (${JSON.stringify(basura)}) debe caer en el respaldo, no romper la pantalla`,
  );
}

// --- 5. Los tres estados de la ficha existen ---------------------------------

for (const nivel of NIVELES) {
  assert.ok(
    NORMA.some((f) => f.nivel === nivel),
    `FichaNorma tiene un estado "${nivel}" sin ninguna fila que lo ejercite`,
  );
}

// La fila que sostiene el producto: la docente agredida. Numeral 4.3.
const docente = NORMA.find((f) => f.clave === "docente_agredido");
assert.ok(docente, "falta la fila de la docente agredida, que es el caso del pitch");
assert.equal(docente.nivel, "informativa");
assert.equal(docente.protocolo, null, "el caso de la docente no tiene protocolo, ese es el punto");
assert.ok(
  docente.fuente.norma.includes("4.3"),
  "la fila de la docente agredida debe citar el numeral 4.3",
);
assert.ok(
  docente.ruta.length >= 3,
  "el numeral 4.3 trae tres literales: Reglamento Interno, citacion a padres y derivacion",
);

// --- 6. Cada fila declara de donde salio -------------------------------------

for (const fila of NORMA) {
  const { norma, paginaPdf, paginaDocumento, verificadoPor, url } = fila.fuente;
  noVacio(norma, `fuente.norma de ${fila.clave}`);
  noVacio(verificadoPor, `fuente.verificadoPor de ${fila.clave}`);
  assert.ok(url.startsWith("https://"), `fuente.url de ${fila.clave} deberia ser una URL`);
  assert.ok(
    Number.isInteger(paginaPdf) && paginaPdf >= 1 && paginaPdf <= PAGINAS_DEL_PDF,
    `${fila.clave} apunta a la pagina ${paginaPdf}, y el PDF tiene ${PAGINAS_DEL_PDF}`,
  );
  assert.ok(
    Number.isInteger(paginaDocumento) && paginaDocumento >= 1 && paginaDocumento < paginaPdf,
    `${fila.clave}: el folio impreso siempre va por detras de la pagina del archivo`,
  );
}

// --- 7. La cita del pie pinta el digito, con dos cifras ----------------------

const arma = NORMA.find((f) => f.clave === "protocolo_03") as FilaNorma;
assert.equal(etiquetaProtocolo(arma), "03", "el documento escribe 'PROTOCOLO 03', con dos cifras");
assert.ok(citaCorta(arma).includes("Protocolo 03"));
assert.ok(citaCorta(arma).includes("RM 383-2025-MINEDU"));
assert.ok(!citaCorta(respaldo).includes("Protocolo"), "la ficha sin norma no cita un protocolo");

console.log(`norma: ok (${NORMA.length} filas, ${protocolos.length} protocolos, 0 digitos en prosa)`);
