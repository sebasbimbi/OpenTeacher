/**
 * Check del cuaderno de incidencias. Corre con `npm run check`.
 *
 * Dos cosas que defiende, y las dos nos hunden si fallan:
 *
 * 1. EL CONTRATO DE NO IDENTIFICACION. El producto promete por escrito que
 *    no le pone nombre a ningun menor. El premortem pide un grep buscando
 *    nombres propios; esto es ese grep, ejecutable y corriendo en cada
 *    `npm run check` en vez de una vez a mano antes del congelamiento.
 *
 * 2. QUE LOS NUMEROS DE LA HOJA SALGAN DE LAS FILAS. La hoja que la docente
 *    se lleva a la reunion dice "8 situaciones, 7 en la ultima hora, 6 antes
 *    del cambio y 2 despues". Si alguien edita una fila y esos numeros dejan
 *    de cuadrar, el papel miente delante de un padre. Aca se comprueban
 *    contra el calculo, no contra la memoria.
 */

import assert from "node:assert/strict";
import {
  ALUMNO_NO_RESUELTO,
  FECHA_CAMBIO,
  HOJA_PROSA,
  INCIDENCIAS,
  NOMINA,
  PENDIENTE,
  PERIODO,
  diasDeClase,
  incidenciasDe,
  prosaDe,
  resumenAlumno,
  resumenAula,
} from "./cuaderno.ts";
import { CLAVES_NORMA, resolverNorma } from "./norma.ts";

// --- 1. La nomina --------------------------------------------------------------

assert.equal(NOMINA.length, 5, "la semilla son cinco estudiantes");

const ids = NOMINA.map((a) => a.id);
assert.equal(new Set(ids).size, ids.length, "hay ids repetidos en la nomina");

const INICIALES = /^[A-ZÑ]\. [A-ZÑ]\. [A-ZÑ]\.$/;
for (const alumno of NOMINA) {
  assert.match(
    alumno.iniciales,
    INICIALES,
    `"${alumno.iniciales}" no tiene forma de iniciales. El MINEDU registra menores por iniciales, nunca por nombre.`,
  );
}
const inicialesUnicas = new Set(NOMINA.map((a) => a.iniciales));
assert.equal(inicialesUnicas.size, NOMINA.length, "dos estudiantes con las mismas iniciales");

// --- 2. EL GREP DE NOMBRES PROPIOS ---------------------------------------------
//
// Las descripciones son conducta observable en tercera persona y van en
// minuscula a proposito. Cualquier palabra capitalizada en medio de una frase
// es sospechosa: un nombre de menor, o el nombre de un colegio.

const PALABRA_CAPITALIZADA = /(?<=\S\s)[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}/;
const PROHIBIDO = /\bcolegio\b|\binstituci[oó]n educativa\b|\bI\.?E\.?\s*N/i;

for (const inc of INCIDENCIAS) {
  for (const [campo, texto] of Object.entries({
    descripcion: inc.descripcion,
    accionTomada: inc.accionTomada,
  })) {
    assert.ok(
      !PALABRA_CAPITALIZADA.test(texto),
      `posible nombre propio en ${inc.id}.${campo}: "${texto}". Los menores van por iniciales y nada mas.`,
    );
    assert.ok(
      !PROHIBIDO.test(texto),
      `${inc.id}.${campo} nombra una institucion: "${texto}". El aula es un cuarto B generico, sin colegio.`,
    );
  }
}

// --- 3. Las incidencias ---------------------------------------------------------

assert.ok(
  INCIDENCIAS.length >= 20 && INCIDENCIAS.length <= 22,
  `la semilla pide entre 20 y 22 incidencias, hay ${INCIDENCIAS.length}`,
);

const incIds = INCIDENCIAS.map((i) => i.id);
assert.equal(new Set(incIds).size, incIds.length, "hay ids repetidos en las incidencias");

const conocidos = new Set([...NOMINA.map((a) => a.id), ALUMNO_NO_RESUELTO]);
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

for (const inc of INCIDENCIAS) {
  assert.ok(conocidos.has(inc.alumnoId), `${inc.id} apunta a un alumno que no esta en la nomina`);
  assert.match(inc.hora, HORA, `${inc.id} tiene una hora rara: ${inc.hora}`);
  assert.ok(
    inc.fecha >= PERIODO.desde && inc.fecha <= PERIODO.hasta,
    `${inc.id} cae fuera del periodo: ${inc.fecha}`,
  );

  // Nadie tiene una incidencia de aula un sabado ni en Fiestas Patrias.
  const dia = new Date(`${inc.fecha}T12:00:00Z`).getUTCDay();
  assert.ok(dia >= 1 && dia <= 5, `${inc.id} cae en fin de semana: ${inc.fecha}`);
  assert.ok(!PERIODO.feriados.includes(inc.fecha), `${inc.id} cae en feriado: ${inc.fecha}`);

  // La clave de norma tiene que existir de verdad en la tabla.
  assert.ok(
    CLAVES_NORMA.includes(inc.claveNorma),
    `${inc.id} usa una clave de norma que no existe: ${inc.claveNorma}`,
  );
}

// --- 4. Coherencia entre el nivel y la norma ------------------------------------

for (const inc of INCIDENCIAS) {
  if (inc.nivel === "convivencia") {
    assert.equal(
      inc.claveNorma,
      "sin_protocolo",
      `${inc.id} es convivencia y no puede activar protocolo: fabricar una obligacion legal falsa es peor que no registrar`,
    );
    assert.notEqual(inc.categoria, "no_aplica", `${inc.id} es convivencia y necesita categoria`);
  }
  if (inc.nivel === "violencia") {
    assert.notEqual(inc.claveNorma, "sin_protocolo", `${inc.id} es violencia y quedo sin ruta`);
  }
  if (inc.agredido === "docente") {
    assert.equal(
      inc.claveNorma,
      "docente_agredido",
      `${inc.id}: si la agredida es la docente NO hay ruta de SiseVe, es el numeral 4.3`,
    );
  }
  if (inc.claveNorma === "docente_agredido") {
    assert.equal(inc.agredido, "docente", `${inc.id} usa la ruta del docente sin que lo sea`);
  }
  // Un arma cambia el protocolo y el plazo: nunca se infiere, se declara.
  if (inc.huboArma === "si") {
    assert.equal(inc.claveNorma, "protocolo_03", `${inc.id} declara arma y no va al protocolo 03`);
  }
}

// El caso que se demuestra en escena tiene que existir.
const contraDocente = INCIDENCIAS.filter((i) => i.agredido === "docente");
assert.equal(contraDocente.length, 1, "falta (o sobra) el caso de la docente agredida");

// --- 5. Los numeros de la hoja salen de las filas -------------------------------

assert.equal(diasDeClase(), 27, "el denominador de dias de clase cambio, revisa el periodo");

const hoja = resumenAlumno("a1");
assert.equal(hoja.total, 8, "la hoja dice ocho situaciones");
assert.equal(hoja.antesDelCambio, 6, `antes del ${FECHA_CAMBIO} la hoja dice seis`);
assert.equal(hoja.despuesDelCambio, 2, `desde el ${FECHA_CAMBIO} la hoja dice dos`);
assert.equal(hoja.enFranja, 7, "la hoja dice siete de ocho en la ultima hora antes del refrigerio");
assert.equal(
  hoja.antesDelCambio + hoja.despuesDelCambio,
  hoja.total,
  "el antes y el despues no suman el total",
);

// Y el desglose de conducta, que es lo que el padre lee linea por linea.
const porConducta = Object.fromEntries(hoja.porConducta.map((c) => [c.descripcion, c.veces]));
assert.equal(porConducta["se levantó de su sitio e interrumpió la clase en voz alta"], 5);
assert.equal(porConducta["respondió con groserías cuando se le pidió volver a su sitio"], 2);
assert.equal(
  hoja.porConducta.reduce((suma, c) => suma + c.veces, 0),
  hoja.total,
  "el desglose de conductas no suma el total: el papel mentiria delante de un padre",
);

// Ningun conteo sin denominador: la hoja siempre dice sobre cuantos dias.
assert.ok(hoja.diasDeClase > hoja.total, "un conteo sin denominador no se pinta");

// --- 6. El aula ------------------------------------------------------------------

const aula = resumenAula();
assert.equal(aula.total, INCIDENCIAS.length);
assert.equal(aula.convivencia + aula.violencia, aula.total, "hay filas sin nivel util");
assert.equal(aula.contraLaDocente, 1);
assert.equal(aula.porAlumno.length, NOMINA.length, "el resumen de aula perdio a alguien");
assert.equal(
  aula.porAlumno.reduce((suma, f) => suma + f.total, 0),
  aula.total,
  "las incidencias por alumno no suman el total del aula",
);
assert.equal(aula.porAlumno[0].alumno.id, "a1", "el resumen ordena de mas a menos incidencias");

for (const alumno of NOMINA) {
  assert.ok(incidenciasDe(alumno.id).length > 0, `${alumno.iniciales} no tiene ninguna incidencia`);
}

// La mayoria del cuaderno NO es violencia, y eso es el punto del producto:
// meter convivencia en el cajon de violencia fabrica obligaciones falsas.
assert.ok(
  aula.convivencia > aula.violencia * 2,
  "un cuaderno de aula real es casi todo convivencia; si no, la taxonomia esta inflada",
);

// --- 7. Las incidencias con norma resuelven a una ficha util ---------------------

for (const { incidencia, norma } of hoja.conNorma) {
  assert.notEqual(norma.clave, "sin_protocolo", `${incidencia.id} deberia traer una ficha con ruta`);
}
for (const inc of INCIDENCIAS) {
  assert.equal(resolverNorma(inc.claveNorma).clave, inc.claveNorma);
}

// --- 8. La prosa de las docentes -------------------------------------------------
//
// No falla si falta: la escriben ellas y puede llegar tarde. Pero lo avisa en
// cada corrida, para que nadie proyecte un placeholder por accidente.

const pendientes = [];
for (const alumno of NOMINA) {
  const prosa = prosaDe(alumno.id);
  for (const [seccion, texto] of Object.entries(prosa)) {
    assert.ok(texto.trim().length > 0, `${alumno.id}.${seccion} quedo vacio`);
    if (texto.includes(PENDIENTE)) pendientes.push(`${alumno.iniciales} ${seccion}`);
  }
}
assert.ok(Object.keys(HOJA_PROSA).length >= 1, "HOJA_PROSA perdio su forma");

console.log(`cuaderno: ok (${NOMINA.length} alumnos, ${INCIDENCIAS.length} incidencias, ${diasDeClase()} dias de clase)`);
if (pendientes.length > 0) {
  console.log(
    `cuaderno: AVISO, falta la prosa de las docentes en ${pendientes.length} secciones. La hoja sale con placeholder.`,
  );
}
