/**
 * Persistencia de los segmentos de audio de una clase.
 *
 * IndexedDB y no localStorage: localStorage solo guarda strings y una clase
 * de 45 minutos son decenas de MB de audio. IndexedDB guarda Blobs tal cual.
 *
 * Cada segmento se escribe APENAS CIERRA, no al final. Si la pestana se
 * cierra en el minuto 40, lo grabado hasta ahi esta a salvo.
 */

export type EstadoSegmento = "pendiente" | "transcrito" | "fallido";

export interface Segmento {
  /** `${sesionId}:${indice}` */
  id: string;
  sesionId: string;
  /** 0, 1, 2... en orden de grabacion. */
  indice: number;
  /** Milisegundos desde el inicio de la clase. Permite decir "minuto 23". */
  inicioMs: number;
  /** Duracion real medida de este segmento. */
  duracionMs: number;
  mimeType: string;
  blob: Blob;
  estado: EstadoSegmento;
  texto?: string;
  /** Por que fallo, si fallo. Se muestra como hueco en la transcripcion. */
  error?: string;
}

export interface Sesion {
  id: string;
  institucion: string;
  aula: string;
  fecha: string;
  responsable: string;
  /** Inicio de la grabacion, epoch ms. */
  inicioEn: number;
  /** Fin, epoch ms. Ausente mientras graba. */
  finEn?: number;
  /**
   * Tramos en que la pestana estuvo oculta. Los navegadores estrangulan los
   * timers en segundo plano, asi que aqui la grabacion puede tener huecos.
   * Se guardan para poder DECIRLO en vez de reportar una duracion que miente.
   */
  interrupciones: { desdeEn: number; hastaEn?: number }[];
}

const BD = "opened";
const VERSION = 1;
const TIENDA_SEG = "segmentos";
const TIENDA_SES = "sesiones";

let cache: Promise<IDBDatabase> | null = null;

function abrir(): Promise<IDBDatabase> {
  if (cache) return cache;
  cache = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Este navegador no tiene IndexedDB."));
      return;
    }
    const req = indexedDB.open(BD, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(TIENDA_SEG)) {
        const t = db.createObjectStore(TIENDA_SEG, { keyPath: "id" });
        t.createIndex("sesionId", "sesionId", { unique: false });
      }
      if (!db.objectStoreNames.contains(TIENDA_SES)) {
        db.createObjectStore(TIENDA_SES, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("No se pudo abrir IndexedDB."));
  });
  return cache;
}

function correr<T>(
  tienda: string,
  modo: IDBTransactionMode,
  fn: (t: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return abrir().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(tienda, modo);
        const req = fn(tx.objectStore(tienda));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error("Fallo la operacion en IndexedDB."));
      }),
  );
}

export const guardarSegmento = (s: Segmento) =>
  correr(TIENDA_SEG, "readwrite", (t) => t.put(s)).then(() => undefined);

export const guardarSesion = (s: Sesion) =>
  correr(TIENDA_SES, "readwrite", (t) => t.put(s)).then(() => undefined);

export const leerSesion = (id: string) =>
  correr<Sesion | undefined>(TIENDA_SES, "readonly", (t) => t.get(id));

export function leerSegmentos(sesionId: string): Promise<Segmento[]> {
  return correr<Segmento[]>(TIENDA_SEG, "readonly", (t) =>
    t.index("sesionId").getAll(sesionId),
  ).then((lista) => lista.sort((a, b) => a.indice - b.indice));
}

/** La sesion mas reciente, para poder retomar despues de recargar. */
export function ultimaSesion(): Promise<Sesion | undefined> {
  return correr<Sesion[]>(TIENDA_SES, "readonly", (t) => t.getAll()).then((lista) =>
    lista.sort((a, b) => b.inicioEn - a.inicioEn)[0],
  );
}

/** Borra la sesion Y su audio. Es lo que respalda el boton de borrar. */
export async function borrarSesion(sesionId: string): Promise<void> {
  const segmentos = await leerSegmentos(sesionId);
  await Promise.all(
    segmentos.map((s) => correr(TIENDA_SEG, "readwrite", (t) => t.delete(s.id))),
  );
  await correr(TIENDA_SES, "readwrite", (t) => t.delete(sesionId));
}

export async function borrarTodo(): Promise<void> {
  await correr(TIENDA_SEG, "readwrite", (t) => t.clear());
  await correr(TIENDA_SES, "readwrite", (t) => t.clear());
}
