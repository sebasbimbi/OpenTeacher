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
}

export const CONTACTO = {
  nombre: "OpenEd",
  estado: "en linea",
  iniciales: "OE",
};

/** Conversacion de arranque: se ve al abrir la pagina. */
export const CONVERSACION_DEMO: Mensaje[] = [
  {
    id: "m1",
    de: "opened",
    texto:
      "Hola profe. Soy OpenEd. Cuenteme que paso en el aula, escribiendo o con un audio. Yo le respondo con que hacer ahora mismo y guardo el registro por usted.",
    hora: "10:02",
  },
  {
    id: "m2",
    de: "docente",
    texto: "Nota de voz",
    hora: "10:04",
    audio: true,
    duracion: "0:38",
  },
  {
    id: "m3",
    de: "opened",
    texto:
      "Le escucho, profe. Primero usted: respire, no es su culpa y no tiene que resolverlo sola en ese minuto.\n\nAhora tres cosas concretas:\n1. Separe a los dos ninos sin sermon delante del aula.\n2. Digale al grupo lo que va a pasar, en una frase.\n3. Al salir, dos minutos a solas con cada uno.\n\nYa registre la incidencia. Al final de la semana le mando el reporte del aula.",
    hora: "10:04",
  },
];

/** Respuesta de relleno mientras no llega el brief con los prompts reales. */
export const RESPUESTA_ECO =
  "Anotado, profe. Registre lo que me conto. Cuando el equipo conecte el agente, aqui va la contencion y las tacticas para este caso.";

/** Nota de voz simulada cuando el docente toca el microfono. */
export const AUDIO_ECO: Omit<Mensaje, "id" | "hora"> = {
  de: "docente",
  texto: "Nota de voz",
  audio: true,
  duracion: "0:21",
};

export function horaAhora(): string {
  return new Date().toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
