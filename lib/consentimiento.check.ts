/**
 * Check de la puerta de consentimiento. Corre con `npm run check`.
 *
 * Esta es la logica que decide si el boton de grabar EXISTE. Si alguien la
 * afloja sin querer, terminamos grabando menores sin registro de permiso.
 * Por eso tiene su propio check y no solo confianza.
 */

import assert from "node:assert/strict";
import {
  CONSENTIMIENTO_VACIO,
  consentimientoCompleto,
  faltantes,
  type Consentimiento,
} from "./consentimiento.ts";

const completo: Consentimiento = {
  institucion: "IE 1234 Jose Carlos Mariategui",
  aula: "4to B",
  fecha: "2026-08-29",
  responsable: "Directora Carmen Rojas",
  colegio: true,
  familias: true,
  estudiantes: true,
  otorgadoEn: new Date().toISOString(),
};

assert.equal(consentimientoCompleto(completo), true);
assert.deepEqual(faltantes(completo), []);

// Vacio no pasa, y explica las siete cosas que faltan.
assert.equal(consentimientoCompleto(CONSENTIMIENTO_VACIO), false);
assert.equal(faltantes(CONSENTIMIENTO_VACIO).length, 7);

// Quitar CUALQUIER campo de texto cierra la puerta.
for (const campo of ["institucion", "aula", "fecha", "responsable"] as const) {
  assert.equal(
    consentimientoCompleto({ ...completo, [campo]: "" }),
    false,
    `sin ${campo} no deberia poder grabar`,
  );
}

// Espacios en blanco no cuentan como dato.
assert.equal(consentimientoCompleto({ ...completo, institucion: "   " }), false);

// Quitar CUALQUIER confirmacion cierra la puerta.
for (const campo of ["colegio", "familias", "estudiantes"] as const) {
  assert.equal(
    consentimientoCompleto({ ...completo, [campo]: false }),
    false,
    `sin ${campo} no deberia poder grabar`,
  );
}

console.log("consentimiento: ok");
