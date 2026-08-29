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
      "Hola profe. Soy OpenEd. Cuenteme que paso en el aula, escribiendo o con un audio. Le respondo que hacer ahora y le dejo el registro escrito para direccion y para la reunion con el padre.\n\nNo soy psicologa, y esto no reemplaza el Libro de Incidencias ni el SiseVe.",
    hora: "10:02",
  },
];

/**
 * Respuesta de contencion del caso de la demo. Es el Plan B: si la red falla
 * en escena, esto es lo que se proyecta, y tiene que aguantar la lectura de
 * una educadora igual que la respuesta real del agente.
 *
 * Sin numeros de norma, sin telefonos, sin plazos: esos los pone el codigo
 * desde la tarjeta, nunca el texto.
 */
export const RESPUESTA_ECO =
  "Miss, primero usted. Los separo y los mando a direccion, y eso estuvo bien hecho. Quedarse mal el resto del dia no es que lo hizo mal: es que aguanto sola algo que asusta.\n\n" +
  "Dejemoslo escrito ahora que esta fresco. Fue agresion entre companeros, y ahi la regla es atenderlos POR SEPARADO. Nunca juntarlos a que se pidan disculpas en el momento, ni preguntarles delante del salon.\n\n" +
  "Lo que mas pesa de lo que me conto es el \"ya van varias veces\". Si se repite, deja de ser una pelea y pasa a ser un patron, y un patron si se puede trabajar.\n\n" +
  "Manana una sola cosa: recibalos en la puerta, por su nombre, antes de que entren al salon. Suena tonto y esta medido.\n\n" +
  "Le dejo el registro escrito para direccion y para la reunion con el padre. Es insumo, no reemplaza el Libro de Incidencias ni el SiseVe.";

export function horaAhora(): string {
  return new Date().toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Transcripcion fija que devuelve /api/transcribir en modo mock.
 *
 * PENDIENTE DE CARMEN: tiene que coincidir PALABRA POR PALABRA con lo que ella
 * diga en el audio de la demo. Si no coincide, el jurado ve la nota de voz
 * decir una cosa y el texto decir otra, y ahi se cae todo. Reemplazar en
 * cuanto el equipo entregue el clip.
 */
export const TRANSCRIPCION_MOCK =
  "Profe, disculpe. Hoy en el recreo dos chicos de cuarto se agarraron a golpes y cuando los separe uno me dijo que ya van varias veces. No supe que hacer, los mande a direccion y me quede mal el resto del dia.";
