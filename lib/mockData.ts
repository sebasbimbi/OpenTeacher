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
  /** Fila de la tabla normativa que pinta la tarjeta bajo la burbuja. */
  claveNorma?: string;
  /** Este mensaje ES la burbuja del cuaderno, no un globo de texto. */
  cuaderno?: boolean;
}

export const CONTACTO = {
  nombre: "OpenEd",
  estado: "en línea",
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
      "Hola profe. Soy OpenEd. Cuénteme qué pasó en el aula, escribiendo o con un audio. Le respondo qué hacer ahora y le dejo el registro escrito para dirección y para la reunión con el padre.\n\nNo soy psicóloga, y esto no reemplaza el Libro de Incidencias ni el SíseVe.",
    hora: "10:02",
  },
];

/**
 * Respuesta de contencion DEL CASO DEL PITCH: la agredida es la docente.
 *
 * Es el Plan B, y tiene que ser el MISMO caso que el resto de la demo. Antes
 * era el de una pelea entre alumnos, y eso significaba que en produccion sin
 * llave el relato de la docente agredida recibia la contencion de otro caso y
 * la tarjeta de otro protocolo. Una tarjeta con fuente y folio tipificando mal
 * es peor que no tener tarjeta: viene con apariencia de autoridad.
 *
 * Sin numeros de norma, telefonos ni plazos: esos los pone la tarjeta.
 */
export const RESPUESTA_ECO =
  "Uy, profe, qué feo eso. Y delante de todos, que es lo que más arde. Primero usted: eso que siente en el cuerpo es alerta, no es que lo haya hecho mal.\n\n" +
  "Le voy a decir algo que casi nadie le dice: cuando la agredida es usted, el sistema no tiene una ruta propia. El Portal registra la violencia contra estudiantes, no contra la docente. Por eso este caso la deja más sola de lo que debería, y por eso yo me quedo acá.\n\n" +
  "Lo que sí hay: esto va por el Reglamento Interno, se cita a la familia del alumno y se firman compromisos. Conciliar el hecho está prohibido. Y si hubo lesiones, amenaza o un arma, ahí sí entra la autoridad.\n\n" +
  "Mañana una sola cosa: recíbalo en la puerta, por su nombre, antes de que entre al salón. Suena tonto y está medido.\n\n" +
  "Le dejo el registro escrito para dirección y para la reunión con la familia. Es insumo, no reemplaza el Libro de Incidencias ni el SíseVe.";

/**
 * Transcripcion fija que devuelve /api/transcribir en modo mock.
 *
 * PENDIENTE DE CARMEN: tiene que coincidir PALABRA POR PALABRA con lo que ella
 * diga en el audio de la demo. Si no coincide, el jurado ve la nota de voz
 * decir una cosa y el texto decir otra, y ahi se cae todo. Reemplazar en
 * cuanto el equipo entregue el clip.
 */
export const TRANSCRIPCION_MOCK =
  "Profe, disculpe que le escriba así. Hoy un alumno de segundo me empujó y me gritó delante de todo el salón cuando le llamé la atención. Me quedé temblando, no supe qué hacer y seguí la clase como si nada. Y ya van varias veces con él.";

export function horaAhora(): string {
  return new Date().toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
