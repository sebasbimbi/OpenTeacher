/**
 * Helpers puros de la ruta de audio. Sin React, sin DOM, sin imports.
 * Se pueden correr con node directo: `npm run check`.
 */

/** Debajo de esto no mandamos nada: es un toque accidental, no una nota de voz. */
export const DURACION_MINIMA_MS = 1000;

/** Whisper rechaza archivos de mas de 25 MB. */
export const TAMANO_MAXIMO_BYTES = 25 * 1024 * 1024;

/**
 * Traduce el error de getUserMedia / MediaRecorder a algo que un docente
 * pueda leer y accionar. Los nombres vienen del spec de MediaDevices; los
 * alias viejos (TrackStartError, DevicesNotFoundError) todavia salen en
 * Chrome, por eso estan mapeados.
 */
export function mensajeDeErrorAudio(error: unknown): string {
  const nombre =
    typeof error === "object" && error !== null && "name" in error
      ? String((error as { name: unknown }).name)
      : "";

  switch (nombre) {
    case "NotAllowedError":
    case "PermissionDeniedError":
    case "SecurityError":
      return "No me diste permiso al micrófono. Actívalo en el candado de la barra del navegador y vuelve a intentar. Mientras tanto puedes escribirme.";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "No encuentro un micrófono conectado. Conecta uno o escríbeme el mensaje.";
    case "NotReadableError":
    case "TrackStartError":
      return "El micrófono está ocupado por otra aplicación. Ciérrala y vuelve a intentar.";
    case "OverconstrainedError":
    case "ConstraintNotSatisfiedError":
      return "Tu micrófono no soporta esta configuración. Prueba con otro dispositivo o escríbeme.";
    case "AbortError":
      return "La grabación se interrumpió. Vuelve a intentar.";
    default:
      return "No pude grabar el audio. Vuelve a intentar o escríbeme el mensaje.";
  }
}

/** Milisegundos a m:ss, el formato que muestra WhatsApp en la nota de voz. */
export function formatearDuracion(ms: number): string {
  const totalSegundos = Math.max(0, Math.round(ms / 1000));
  const minutos = Math.floor(totalSegundos / 60);
  const segundos = totalSegundos % 60;
  return `${minutos}:${String(segundos).padStart(2, "0")}`;
}

/**
 * Extension que Whisper necesita para inferir el formato. La API de OpenAI
 * lee el nombre del archivo, no el content-type, asi que si esto sale mal
 * la transcripcion falla con "Invalid file format".
 */
export function extensionDeMime(mimeType: string): string {
  const base = mimeType.split(";")[0].trim().toLowerCase();
  switch (base) {
    case "audio/webm":
      return "webm";
    case "audio/mp4":
    case "audio/x-m4a":
      return "m4a";
    case "audio/ogg":
      return "ogg";
    case "audio/wav":
    case "audio/wave":
      return "wav";
    case "audio/mpeg":
      return "mp3";
    default:
      return "webm";
  }
}
