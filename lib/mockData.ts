/**
 * Datos pre-generados para la demo de OpenEd.
 *
 * PLAN B: el simulador de chat en app/page.tsx corre SOLO con esto.
 * Ni una llamada de red. Si el WhatsApp real falla en el escenario,
 * se demuestra aqui y nadie se entera.
 *
 * El caso, los prompts y las respuestas finales llegan con el brief
 * de producto. Lo de abajo es material de relleno con la forma correcta.
 */

export type Autor = "docente" | "opened";

export interface Mensaje {
  id: string;
  de: Autor;
  texto: string;
  hora: string;
  /** El docente tambien puede mandar audio. Se pinta como nota de voz. */
  audio?: boolean;
  /** Duracion de la nota de voz, formato m:ss. */
  duracion?: string;
  /** Duracion real medida al grabar. Se usa para la barra de reproduccion. */
  duracionMs?: number;
  /** Object URL del blob grabado. Sin esto la nota no se puede reproducir. */
  url?: string;
  /** Texto que devolvio /api/transcribir. */
  transcripcion?: string;
  /** True mientras la transcripcion esta en vuelo. */
  transcribiendo?: boolean;
}

export const CONTACTO = {
  nombre: "OpenEd",
  estado: "en linea",
  iniciales: "OE",
};

/**
 * Conversacion de arranque. Solo el saludo, a proposito.
 *
 * La pantalla arranca casi vacia para que la PRIMERA nota de voz que
 * aparezca sea la que se graba en vivo delante del jurado. Una nota
 * semilla sin audio detras deja un boton de play muerto, y en proyector
 * eso se lee como software roto.
 */
export const CONVERSACION_DEMO: Mensaje[] = [
  {
    id: "m1",
    de: "opened",
    texto:
      "Hola profe. Soy OpenEd. Cuenteme que paso en el aula, escribiendo o con un audio. Yo le respondo con que hacer ahora mismo y guardo el registro por usted.",
    hora: "10:02",
  },
];

/** Respuesta de relleno mientras no llega el brief con los prompts reales. */
export const RESPUESTA_ECO =
  "Anotado, profe. Registre lo que me conto. Cuando el equipo conecte el agente, aqui va la contencion y las tacticas para este caso.";

export function horaAhora(): string {
  return new Date().toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Transcripcion fija que devuelve /api/transcribir en modo mock.
 * Es lo que se escucha en la nota de voz de arriba.
 */
export const TRANSCRIPCION_MOCK =
  "Profe, disculpe. Hoy en el recreo dos chicos de cuarto se agarraron a golpes y cuando los separe uno me dijo que ya van varias veces. No supe que hacer, los mande a direccion y me quede mal el resto del dia.";
