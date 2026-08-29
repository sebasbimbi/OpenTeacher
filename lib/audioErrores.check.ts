/**
 * Check minimo de la ruta de audio. Corre con `npm run check`.
 * Falla ruidosamente si alguien rompe el mapeo de errores o el formato
 * de duracion, que es justo lo que nos mordería en vivo.
 */

import assert from "node:assert/strict";
import {
  DURACION_MINIMA_MS,
  extensionDeMime,
  formatearDuracion,
  mensajeDeErrorAudio,
} from "./audioErrores.ts";

// Cada modo de falla real tiene que dar un mensaje distinto y accionable.
const permiso = mensajeDeErrorAudio({ name: "NotAllowedError" });
const ocupado = mensajeDeErrorAudio({ name: "NotReadableError" });
const sinMic = mensajeDeErrorAudio({ name: "NotFoundError" });
const raro = mensajeDeErrorAudio({ name: "AlgoQueNoConocemos" });

assert.match(permiso, /permiso/i);
assert.match(ocupado, /ocupado/i);
assert.match(sinMic, /microfono/i);
assert.equal(new Set([permiso, ocupado, sinMic, raro]).size, 4, "los mensajes no pueden repetirse");

// Nunca romper con basura: null, undefined, string suelto.
for (const entrada of [null, undefined, "boom", 42, new Error("x")]) {
  assert.equal(typeof mensajeDeErrorAudio(entrada), "string");
}

// Duracion en el formato de WhatsApp.
assert.equal(formatearDuracion(0), "0:00");
assert.equal(formatearDuracion(7400), "0:07");
assert.equal(formatearDuracion(59_600), "1:00");
assert.equal(formatearDuracion(125_000), "2:05");
assert.equal(formatearDuracion(-5), "0:00");

// La extension es lo que Whisper usa para inferir el formato.
assert.equal(extensionDeMime("audio/webm;codecs=opus"), "webm");
assert.equal(extensionDeMime("audio/mp4"), "m4a");
assert.equal(extensionDeMime("audio/ogg;codecs=opus"), "ogg");
assert.equal(extensionDeMime(""), "webm");

assert.equal(DURACION_MINIMA_MS, 1000);

console.log("audio: ok");
