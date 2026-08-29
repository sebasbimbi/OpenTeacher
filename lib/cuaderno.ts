/**
 * El cuaderno de incidencias del aula. Cinco estudiantes, seis semanas.
 *
 * Es el puente entre la conversacion y el entregable: lo que la docente se
 * lleva a la reunion con la familia. Sin base de datos, a proposito: son
 * cinco filas de nomina y veintiuna de incidencias.
 *
 * CONTRATO DE NO IDENTIFICACION, y no se negocia:
 * los estudiantes van por INICIALES INVENTADAS. No corresponden a ningun
 * menor real, no hay nombre de colegio en ningun lado, y ninguna
 * descripcion menciona a la familia del estudiante. El propio MINEDU
 * registra a los menores por iniciales en su Formato 1: adultos
 * identificados, menores seudonimizados. `cuaderno.check.ts` lo hace
 * cumplir buscando nombres propios en la prosa.
 *
 * REPARTO DEL TRABAJO: los NUMEROS los calcula este archivo desde las
 * filas. La PROSA de la hoja la escriben las docentes, en su voz, y se
 * pega en HOJA_PROSA. Lo que todavia no llego esta marcado PENDIENTE.
 */

import { resolverNorma, type FilaNorma } from "./norma.ts";

// --- Periodo -----------------------------------------------------------------

export const PERIODO = {
  desde: "2026-07-14",
  hasta: "2026-08-22",
  etiqueta: "14 de julio al 22 de agosto de 2026",
  /** Fiestas Patrias. Restan del denominador de dias de clase. */
  feriados: ["2026-07-28", "2026-07-29"],
};

/** El dia en que se cambio de ubicacion a M. Q. R. Parte el periodo en dos. */
export const FECHA_CAMBIO = "2026-08-10";

export const AULA = "4.º B";

// --- Nomina ------------------------------------------------------------------

export interface Alumno {
  id: string;
  /** Iniciales INVENTADAS. Nunca un nombre. */
  iniciales: string;
  aula: string;
}

/**
 * La nomina es la unica clave de reidentificacion y vive en la IE. Las
 * incidencias guardan `alumnoId`, jamas un nombre.
 */
export const NOMINA: Alumno[] = [
  { id: "a1", iniciales: "M. Q. R.", aula: AULA },
  { id: "a2", iniciales: "A. T. L.", aula: AULA },
  { id: "a3", iniciales: "J. P. S.", aula: AULA },
  { id: "a4", iniciales: "D. V. M.", aula: AULA },
  { id: "a5", iniciales: "K. R. H.", aula: AULA },
];

/** Cuando el relato no resuelve contra la nomina, la incidencia se guarda igual. */
export const ALUMNO_NO_RESUELTO = "no_resuelto";

// --- Incidencias -------------------------------------------------------------

export type Lugar = "aula" | "patio_recreo" | "pasillo" | "fuera_ie" | "virtual" | "no_indicado";
export type Nivel = "convivencia" | "violencia" | "riesgo_urgente";
export type Categoria =
  | "disrupcion_aula"
  | "incumplimiento_acuerdos"
  | "conflicto_entre_pares_sin_agresion"
  | "desregulacion_emocional"
  | "no_aplica";
export type Ternario = "si" | "no" | "no_indicado";

export interface Incidencia {
  id: string;
  alumnoId: string;
  /** ISO, siempre dia de clase. */
  fecha: string;
  /** Hora declarada por la docente, formato HH:MM. */
  hora: string;
  lugar: Lugar;
  nivel: Nivel;
  categoria: Categoria;
  /** Conducta observable en tercera persona. Nunca un rasgo de caracter. */
  descripcion: string;
  huboLesion: Ternario;
  huboArma: Ternario;
  esReiterado: Ternario;
  agredido: "estudiante" | "docente" | "no_determinado";
  /** Clave de lib/norma.ts. El numero de protocolo lo pone la tabla, no esto. */
  claveNorma: string;
  /** Que hizo la docente. Cadena vacia si no lo dijo. */
  accionTomada: string;
}

const SIN = "sin_protocolo";

export const INCIDENCIAS: Incidencia[] = [
  // ---- a1, M. Q. R. Seis antes del cambio de ubicacion, dos despues.
  {
    id: "i01",
    alumnoId: "a1",
    fecha: "2026-07-15",
    hora: "11:20",
    lugar: "aula",
    nivel: "convivencia",
    categoria: "disrupcion_aula",
    descripcion: "se levantó de su sitio e interrumpió la clase en voz alta",
    huboLesion: "no",
    huboArma: "no",
    esReiterado: "no_indicado",
    agredido: "no_determinado",
    claveNorma: SIN,
    accionTomada: "conversación individual al terminar la hora",
  },
  {
    id: "i02",
    alumnoId: "a1",
    fecha: "2026-07-21",
    hora: "11:45",
    lugar: "aula",
    nivel: "convivencia",
    categoria: "disrupcion_aula",
    descripcion: "se levantó de su sitio e interrumpió la clase en voz alta",
    huboLesion: "no",
    huboArma: "no",
    esReiterado: "no_indicado",
    agredido: "no_determinado",
    claveNorma: SIN,
    accionTomada: "conversación individual al terminar la hora",
  },
  {
    id: "i03",
    alumnoId: "a1",
    fecha: "2026-07-23",
    hora: "12:10",
    lugar: "aula",
    nivel: "convivencia",
    categoria: "incumplimiento_acuerdos",
    descripcion: "respondió con groserías cuando se le pidió volver a su sitio",
    huboLesion: "no",
    huboArma: "no",
    esReiterado: "no_indicado",
    agredido: "no_determinado",
    claveNorma: SIN,
    accionTomada: "se le recordó el acuerdo de aula",
  },
  {
    id: "i04",
    alumnoId: "a1",
    fecha: "2026-07-30",
    hora: "11:35",
    lugar: "aula",
    nivel: "convivencia",
    categoria: "disrupcion_aula",
    descripcion: "se levantó de su sitio e interrumpió la clase en voz alta",
    huboLesion: "no",
    huboArma: "no",
    esReiterado: "no_indicado",
    agredido: "no_determinado",
    claveNorma: SIN,
    accionTomada: "conversación individual al terminar la hora",
  },
  {
    id: "i05",
    alumnoId: "a1",
    fecha: "2026-08-04",
    hora: "09:15",
    lugar: "aula",
    nivel: "convivencia",
    categoria: "disrupcion_aula",
    descripcion: "se levantó de su sitio e interrumpió la clase en voz alta",
    huboLesion: "no",
    huboArma: "no",
    esReiterado: "no_indicado",
    agredido: "no_determinado",
    claveNorma: SIN,
    accionTomada: "",
  },
  {
    id: "i06",
    alumnoId: "a1",
    fecha: "2026-08-06",
    hora: "12:05",
    lugar: "aula",
    nivel: "convivencia",
    categoria: "incumplimiento_acuerdos",
    descripcion: "respondió con groserías cuando se le pidió volver a su sitio",
    huboLesion: "no",
    huboArma: "no",
    esReiterado: "no_indicado",
    agredido: "no_determinado",
    claveNorma: SIN,
    accionTomada: "se le recordó el acuerdo de aula",
  },
  {
    id: "i07",
    alumnoId: "a1",
    fecha: "2026-08-12",
    hora: "11:50",
    lugar: "patio_recreo",
    nivel: "convivencia",
    categoria: "conflicto_entre_pares_sin_agresion",
    descripcion: "forcejeó con un compañero por un cuaderno; el hecho cesó al separarlos",
    huboLesion: "no",
    huboArma: "no",
    esReiterado: "no",
    agredido: "no_determinado",
    claveNorma: SIN,
    accionTomada: "se atendió a los dos ese mismo día",
  },
  {
    id: "i08",
    alumnoId: "a1",
    fecha: "2026-08-18",
    hora: "11:25",
    lugar: "aula",
    nivel: "convivencia",
    categoria: "disrupcion_aula",
    descripcion: "se levantó de su sitio e interrumpió la clase en voz alta",
    huboLesion: "no",
    huboArma: "no",
    esReiterado: "no_indicado",
    agredido: "no_determinado",
    claveNorma: SIN,
    accionTomada: "conversación individual al terminar la hora",
  },

  // ---- a2, A. T. L. Aca vive el caso que se demuestra en escena.
  {
    id: "i09",
    alumnoId: "a2",
    fecha: "2026-07-16",
    hora: "10:40",
    lugar: "aula",
    nivel: "convivencia",
    categoria: "desregulacion_emocional",
    descripcion: "lloró y se negó a continuar la actividad durante media hora",
    huboLesion: "no",
    huboArma: "no",
    esReiterado: "no_indicado",
    agredido: "no_determinado",
    claveNorma: SIN,
    accionTomada: "se le dio un espacio fuera del aula y volvió solo",
  },
  {
    id: "i10",
    alumnoId: "a2",
    fecha: "2026-07-27",
    hora: "11:10",
    lugar: "aula",
    nivel: "convivencia",
    categoria: "disrupcion_aula",
    descripcion: "golpeó la carpeta de forma repetida durante la explicación",
    huboLesion: "no",
    huboArma: "no",
    esReiterado: "no_indicado",
    agredido: "no_determinado",
    claveNorma: SIN,
    accionTomada: "",
  },
  {
    // EL CASO DEL PITCH. La agredida es la docente: no hay ruta de SiseVe.
    id: "i11",
    alumnoId: "a2",
    fecha: "2026-08-05",
    hora: "12:20",
    lugar: "aula",
    nivel: "violencia",
    categoria: "no_aplica",
    descripcion: "lanzó un objeto hacia la docente y la insultó delante del grupo",
    huboLesion: "no",
    huboArma: "no",
    esReiterado: "no_indicado",
    agredido: "docente",
    claveNorma: "docente_agredido",
    accionTomada: "se informó a dirección el mismo día",
  },
  {
    id: "i12",
    alumnoId: "a2",
    fecha: "2026-08-19",
    hora: "11:00",
    lugar: "aula",
    nivel: "convivencia",
    categoria: "incumplimiento_acuerdos",
    descripcion: "no cumplió el acuerdo de trabajo en grupo y se retiró de la actividad",
    huboLesion: "no",
    huboArma: "no",
    esReiterado: "no_indicado",
    agredido: "no_determinado",
    claveNorma: SIN,
    accionTomada: "se revisó el acuerdo con el grupo",
  },

  // ---- a3, J. P. S.
  {
    id: "i13",
    alumnoId: "a3",
    fecha: "2026-07-17",
    hora: "10:15",
    lugar: "patio_recreo",
    nivel: "convivencia",
    categoria: "conflicto_entre_pares_sin_agresion",
    descripcion: "discutió con un compañero por el turno de un juego",
    huboLesion: "no",
    huboArma: "no",
    esReiterado: "no",
    agredido: "no_determinado",
    claveNorma: SIN,
    accionTomada: "se les pidió acordar el turno y siguieron jugando",
  },
  {
    id: "i14",
    alumnoId: "a3",
    fecha: "2026-08-07",
    hora: "11:30",
    lugar: "patio_recreo",
    nivel: "violencia",
    categoria: "no_aplica",
    descripcion: "empujó a un compañero y lo tiró al suelo durante el recreo",
    huboLesion: "no",
    huboArma: "no",
    esReiterado: "no",
    agredido: "estudiante",
    claveNorma: "protocolo_01",
    accionTomada: "se informó a dirección el mismo día",
  },
  {
    id: "i15",
    alumnoId: "a3",
    fecha: "2026-08-20",
    hora: "09:40",
    lugar: "aula",
    nivel: "convivencia",
    categoria: "disrupcion_aula",
    descripcion: "conversó en voz alta durante la evaluación pese a dos avisos",
    huboLesion: "no",
    huboArma: "no",
    esReiterado: "no_indicado",
    agredido: "no_determinado",
    claveNorma: SIN,
    accionTomada: "",
  },

  // ---- a4, D. V. M.
  {
    id: "i16",
    alumnoId: "a4",
    fecha: "2026-07-22",
    hora: "12:15",
    lugar: "aula",
    nivel: "convivencia",
    categoria: "disrupcion_aula",
    descripcion: "usó el celular en clase y se negó a guardarlo",
    huboLesion: "no",
    huboArma: "no",
    esReiterado: "no_indicado",
    agredido: "no_determinado",
    claveNorma: SIN,
    accionTomada: "se le recordó el acuerdo de aula",
  },
  {
    id: "i17",
    alumnoId: "a4",
    fecha: "2026-08-11",
    hora: "10:50",
    lugar: "virtual",
    nivel: "violencia",
    categoria: "no_aplica",
    descripcion:
      "envió mensajes humillantes sobre un compañero en un grupo de mensajería del salón, en más de una ocasión",
    huboLesion: "no",
    huboArma: "no",
    esReiterado: "si",
    agredido: "estudiante",
    claveNorma: "protocolo_02",
    accionTomada: "se guardaron las capturas y se informó a dirección",
  },
  {
    id: "i18",
    alumnoId: "a4",
    fecha: "2026-08-21",
    hora: "11:15",
    lugar: "aula",
    nivel: "convivencia",
    categoria: "desregulacion_emocional",
    descripcion: "salió del aula sin permiso tras una corrección y volvió a los diez minutos",
    huboLesion: "no",
    huboArma: "no",
    esReiterado: "no_indicado",
    agredido: "no_determinado",
    claveNorma: SIN,
    accionTomada: "conversación individual al terminar la hora",
  },

  // ---- a5, K. R. H.
  {
    id: "i19",
    alumnoId: "a5",
    fecha: "2026-07-20",
    hora: "09:50",
    lugar: "aula",
    nivel: "convivencia",
    categoria: "incumplimiento_acuerdos",
    descripcion: "llegó tarde por tercera vez en la semana y entró interrumpiendo",
    huboLesion: "no",
    huboArma: "no",
    esReiterado: "no_indicado",
    agredido: "no_determinado",
    claveNorma: SIN,
    accionTomada: "",
  },
  {
    id: "i20",
    alumnoId: "a5",
    fecha: "2026-08-03",
    hora: "11:40",
    lugar: "pasillo",
    nivel: "violencia",
    categoria: "no_aplica",
    descripcion: "golpeó a un compañero en el pasillo al salir del aula",
    huboLesion: "no",
    huboArma: "no",
    esReiterado: "no",
    agredido: "estudiante",
    claveNorma: "protocolo_01",
    accionTomada: "se informó a dirección el mismo día",
  },
  {
    id: "i21",
    alumnoId: "a5",
    fecha: "2026-08-17",
    hora: "12:00",
    lugar: "aula",
    nivel: "convivencia",
    categoria: "disrupcion_aula",
    descripcion: "interrumpió la explicación con comentarios en voz alta",
    huboLesion: "no",
    huboArma: "no",
    esReiterado: "no_indicado",
    agredido: "no_determinado",
    claveNorma: SIN,
    accionTomada: "se le recordó el acuerdo de aula",
  },
];

// --- La prosa de la hoja, que escriben las docentes --------------------------

export const PENDIENTE = "PENDIENTE DOCENTES";

export interface ProsaHoja {
  paraQueEs: string;
  loQueYaHicimos: string;
  loQueEstaFuncionando: string;
  loQueTambienVemos: string;
  loQuePedimos: string;
  comoSeguimos: string;
}

/**
 * Su voz, no la del modelo. Reemplazar el string y nada mas; ninguna otra
 * parte del sistema cambia. Lo que sigue marcado PENDIENTE no llego a
 * tiempo y `cuaderno.check.ts` lo avisa en cada corrida.
 */
export const HOJA_PROSA: Record<string, ProsaHoja> = {
  a1: {
    paraQueEs: PENDIENTE,
    loQueYaHicimos: PENDIENTE,
    loQueEstaFuncionando: PENDIENTE,
    loQueTambienVemos: PENDIENTE,
    loQuePedimos: PENDIENTE,
    comoSeguimos: PENDIENTE,
  },
};

const PROSA_VACIA: ProsaHoja = {
  paraQueEs: PENDIENTE,
  loQueYaHicimos: PENDIENTE,
  loQueEstaFuncionando: PENDIENTE,
  loQueTambienVemos: PENDIENTE,
  loQuePedimos: PENDIENTE,
  comoSeguimos: PENDIENTE,
};

export function prosaDe(alumnoId: string): ProsaHoja {
  return HOJA_PROSA[alumnoId] ?? PROSA_VACIA;
}

// --- Numeros, que los calcula TypeScript -------------------------------------

/** Franja en la que se concentran las incidencias del aula. */
export const FRANJA = { desde: "11:00", hasta: "12:30" };

export function alumnoPorId(id: string): Alumno | undefined {
  return NOMINA.find((a) => a.id === id);
}

export function incidenciasDe(alumnoId: string): Incidencia[] {
  return INCIDENCIAS.filter((i) => i.alumnoId === alumnoId).sort((a, b) =>
    a.fecha.localeCompare(b.fecha),
  );
}

/** Dias de clase del periodo. Lunes a viernes menos feriados declarados. */
export function diasDeClase(): number {
  const desde = new Date(`${PERIODO.desde}T12:00:00Z`);
  const hasta = new Date(`${PERIODO.hasta}T12:00:00Z`);
  let dias = 0;
  for (const d = new Date(desde); d <= hasta; d.setUTCDate(d.getUTCDate() + 1)) {
    const diaSemana = d.getUTCDay();
    if (diaSemana === 0 || diaSemana === 6) continue;
    if (PERIODO.feriados.includes(d.toISOString().slice(0, 10))) continue;
    dias += 1;
  }
  return dias;
}

/** Cuantas cayeron dentro de la franja de la ultima hora. */
export function enFranja(incidencias: Incidencia[]): number {
  return incidencias.filter((i) => i.hora >= FRANJA.desde && i.hora <= FRANJA.hasta).length;
}

export interface ResumenAlumno {
  alumno: Alumno;
  total: number;
  diasDeClase: number;
  enFranja: number;
  antesDelCambio: number;
  despuesDelCambio: number;
  /** Conducta observable -> cuantas veces. Es lo que se lee en la hoja. */
  porConducta: { descripcion: string; veces: number }[];
  /** Filas que la norma si alcanza. Casi siempre vacia, y eso es el punto. */
  conNorma: { incidencia: Incidencia; norma: FilaNorma }[];
}

export function resumenAlumno(alumnoId: string): ResumenAlumno {
  const alumno = alumnoPorId(alumnoId);
  if (!alumno) throw new Error(`no existe el alumno ${alumnoId} en la nomina`);
  const filas = incidenciasDe(alumnoId);

  const conteo = new Map<string, number>();
  for (const i of filas) conteo.set(i.descripcion, (conteo.get(i.descripcion) ?? 0) + 1);

  return {
    alumno,
    total: filas.length,
    diasDeClase: diasDeClase(),
    enFranja: enFranja(filas),
    antesDelCambio: filas.filter((i) => i.fecha < FECHA_CAMBIO).length,
    despuesDelCambio: filas.filter((i) => i.fecha >= FECHA_CAMBIO).length,
    porConducta: [...conteo.entries()]
      .map(([descripcion, veces]) => ({ descripcion, veces }))
      .sort((a, b) => b.veces - a.veces),
    conNorma: filas
      .filter((i) => i.claveNorma !== SIN)
      .map((i) => ({ incidencia: i, norma: resolverNorma(i.claveNorma) })),
  };
}

export interface ResumenAula {
  aula: string;
  periodo: string;
  diasDeClase: number;
  total: number;
  convivencia: number;
  violencia: number;
  /** El dato del que nadie habla: cuantas veces la agredida fue la docente. */
  contraLaDocente: number;
  enFranja: number;
  porAlumno: { alumno: Alumno; total: number }[];
}

export function resumenAula(): ResumenAula {
  return {
    aula: AULA,
    periodo: PERIODO.etiqueta,
    diasDeClase: diasDeClase(),
    total: INCIDENCIAS.length,
    convivencia: INCIDENCIAS.filter((i) => i.nivel === "convivencia").length,
    violencia: INCIDENCIAS.filter((i) => i.nivel === "violencia").length,
    contraLaDocente: INCIDENCIAS.filter((i) => i.agredido === "docente").length,
    enFranja: enFranja(INCIDENCIAS),
    porAlumno: NOMINA.map((alumno) => ({
      alumno,
      total: incidenciasDe(alumno.id).length,
    })).sort((a, b) => b.total - a.total),
  };
}
