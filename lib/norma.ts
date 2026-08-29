/**
 * Tabla normativa de OpenTeacher. RM 383-2025-MINEDU, Anexo 03.
 *
 * REGLA DE LA CASA, la mas importante de este archivo:
 * **el modelo tiene PROHIBIDO escribir digitos de normas.**
 * El agente emite una `clave` de esta tabla y nada mas. El numero de
 * protocolo, el plazo en dias y los hitos salen de aca, no del LLM.
 * Un numero de norma alucinado delante de educadoras nos hunde.
 *
 * Por eso `ruta[]` NO contiene un solo digito: es la ruta en palabras,
 * que es lo que el agente si puede decir. Los digitos viven en `protocolo`,
 * `plazo` y `hitos[].plazo`, y los pinta la tarjeta.
 * `norma.check.ts` falla si alguien mete un digito en la prosa.
 *
 * VERIFICACION: cada fila se contrasto pagina por pagina contra
 * `rm383-anexo03.pdf` (42 pp, escaneado). `fuente.paginaPdf` es la pagina
 * del archivo; `fuente.paginaDocumento` es el folio impreso. Lo que no se
 * pudo leer en el PDF no esta en esta tabla.
 */

/** Los tres estados de la ficha. Mas que esto no hay. */
export type NivelNorma = "protocolo" | "informativa" | "sin_norma";

/** Sello de confianza de una fila. */
export type Verificacion = "publicado" | "por-contrastar";

export interface Fuente {
  norma: string;
  /** Pagina del archivo PDF, 1-indexada. */
  paginaPdf: number;
  /** Folio impreso en el pie de esa pagina. */
  paginaDocumento: number;
  /** Quien la leyo y contra que. */
  verificadoPor: string;
  /** Donde vive la norma. */
  url: string;
}

export interface Hito {
  paso: string;
  /** El digito vive aca, no en la prosa. */
  plazo: string;
}

export interface FilaNorma {
  /** Lo UNICO que el modelo puede emitir. */
  clave: string;
  nivel: NivelNorma;
  /** Numero de protocolo. `null` cuando no hay protocolo que numerar. */
  protocolo: number | null;
  /**
   * Sello de la fila. `por-contrastar` cuando el digito viene de segunda
   * mano y todavia no lo confirmo una persona contra la fuente primaria.
   * La tarjeta lo PINTA, no lo esconde: distinguir lo confirmado de lo
   * pendiente es mas fuerte que fingir certeza.
   */
  verificado: Verificacion;
  /** Titulo literal, como aparece en el indice del Anexo 03. */
  titulo: string;
  /** Bloque del indice (I, II, III). */
  bloque: string | null;
  /** Que situacion lo activa, en palabras del docente. */
  cuando: string;
  /** Que debe hacer la docente. El corazon de la fila. Sin digitos a proposito. */
  ruta: string[];
  /** Plazo total de atencion, ya legible. `null` cuando la norma no fija uno. */
  plazo: string | null;
  hitos: Hito[];
  /** Excepcion explicita del texto, si la hay. */
  noAplica: string | null;
  fuente: Fuente;
}

const URL_NORMA =
  "https://www.gob.pe/institucion/minedu/normas-legales/7106134-383-2025-minedu";

const VERIFICADOR = "quadrant Q26, lectura directa de rm383-anexo03.pdf, 29 ago 2026";

export const NORMA: FilaNorma[] = [
  {
    clave: "protocolo_01",
    nivel: "protocolo",
    protocolo: 1,
    verificado: "publicado",
    titulo: "Violencia física y/o psicológica",
    bloque: "I. Violencia escolar entre estudiantes",
    cuando:
      "Un estudiante agrede a otro: golpes, jalones, mordeduras, o bien ridiculiza, aísla, insulta, amenaza o grita.",
    ruta: [
      "Informar al director o al responsable de convivencia escolar el mismo día.",
      "El director convoca al Comité de Gestión del Bienestar para fijar medidas de protección y correctivas.",
      "Reunión con los padres o apoderados de cada estudiante involucrado, por separado.",
      "El registro en el Libro de Registro de Incidencias y el reporte al Portal SíseVe los hace la dirección o el responsable de convivencia, no usted.",
      "Derivación al centro de salud u otro servicio para la atención médica o psicológica.",
    ],
    plazo: "30 días hábiles",
    hitos: [
      { paso: "Reunión del CGB y con padres o apoderados", plazo: "Día 02" },
      { paso: "Libro de Registro de Incidencias", plazo: "Día 03" },
      { paso: "Reporte en el Portal SíseVe", plazo: "Día 03" },
      { paso: "Seguimiento con tutores", plazo: "Día 07 al 29" },
      { paso: "Cierre del caso", plazo: "Día 30" },
    ],
    noAplica:
      "No es aplicable cuando ambos involucrados corresponden al nivel inicial de la Educación Básica Regular.",
    fuente: {
      norma: "RM 383-2025-MINEDU, Anexo 03, Protocolo 01",
      paginaPdf: 15,
      paginaDocumento: 12,
      verificadoPor: VERIFICADOR,
      url: URL_NORMA,
    },
  },
  {
    clave: "protocolo_02",
    nivel: "protocolo",
    protocolo: 2,
    verificado: "publicado",
    titulo: "Acoso entre estudiantes (bullying y ciberbullying)",
    bloque: "I. Violencia escolar entre estudiantes",
    cuando:
      "Hostigamiento reiterado de uno o varios estudiantes contra otro que no puede defenderse, presencial o por redes y mensajería.",
    ruta: [
      "Informar al director o al responsable de convivencia escolar el mismo día.",
      "El director convoca al Comité de Gestión del Bienestar para fijar medidas de protección y correctivas.",
      "Tutoría grupal sobre las causas del acoso y tutoría individual con agredidos y agresores.",
      "Reunión con los padres o apoderados de cada estudiante involucrado, por separado.",
      "El registro en el Libro de Registro de Incidencias y el reporte al Portal SíseVe los hace la dirección o el responsable de convivencia, no usted.",
      "En ciberbullying, recabar y guardar las evidencias: capturas, grabaciones y la dirección donde se publicó.",
    ],
    plazo: "30 días hábiles",
    hitos: [
      { paso: "Reunión del CGB, tutores y padres o apoderados", plazo: "Día 02" },
      { paso: "Libro de Registro de Incidencias y Portal SíseVe", plazo: "Día 03" },
      { paso: "Seguimiento con tutores", plazo: "Día 07 al 29" },
      { paso: "Cierre del caso", plazo: "Día 30" },
    ],
    noAplica:
      "No se presenta en niños de la primera infancia: no existe bullying ni ciberbullying perpetrado por niños menores de nueve años.",
    fuente: {
      norma: "RM 383-2025-MINEDU, Anexo 03, Protocolo 02",
      paginaPdf: 18,
      paginaDocumento: 15,
      verificadoPor: VERIFICADOR,
      url: URL_NORMA,
    },
  },
  {
    clave: "protocolo_03",
    nivel: "protocolo",
    protocolo: 3,
    verificado: "publicado",
    titulo: "Violencia con uso de armas",
    bloque: "I. Violencia escolar entre estudiantes",
    cuando:
      "Un estudiante usa un arma de fuego o un arma blanca para intimidar, coaccionar, amenazar o agredir.",
    ruta: [
      "Informar al director de inmediato. La confidencialidad de quien avisa está garantizada.",
      "El director comunica el hecho a la policía y llama a los padres o apoderados para que se apersonen.",
      "No manipular el arma ni acercarse a ella: se espera a la policía para la incautación.",
      "El director evalúa el riesgo y, de haber peligro, dispone la evacuación parcial o total.",
      "Si hay un herido, traslado de emergencia al servicio de salud más cercano.",
      "El director eleva un informe a la UGEL.",
      "El registro en el Libro de Registro de Incidencias y el reporte al Portal SíseVe los hace la dirección, no usted.",
    ],
    plazo: "20 días hábiles",
    hitos: [
      { paso: "Informe a la UGEL", plazo: "Hasta 24 horas de la intervención" },
      { paso: "Reunión del CGB, tutores y padres o apoderados", plazo: "Día 02" },
      { paso: "Libro de Registro de Incidencias y Portal SíseVe", plazo: "Día 03" },
      { paso: "Derivación para atención psicológica", plazo: "Día 03" },
      { paso: "Cierre del caso", plazo: "Día 20" },
    ],
    noAplica: null,
    fuente: {
      norma: "RM 383-2025-MINEDU, Anexo 03, Protocolo 03",
      paginaPdf: 22,
      paginaDocumento: 19,
      verificadoPor: VERIFICADOR,
      url: URL_NORMA,
    },
  },
  {
    clave: "protocolo_04",
    nivel: "protocolo",
    protocolo: 4,
    verificado: "publicado",
    titulo:
      "Violencia sexual (violación sexual, tocamientos, actos de connotación sexual o actos libidinosos y acoso sexual) entre estudiantes",
    bloque: "I. Violencia escolar entre estudiantes",
    cuando:
      "Conducta con connotación sexual de un estudiante contra otro. No hace falta que haya mediado violencia ni amenaza.",
    ruta: [
      "Usted informa al director o al responsable de convivencia el mismo día. La denuncia puede ser verbal, y entonces se levanta acta ante el director.",
      "El director comunica el hecho a la Comisaría o al Ministerio Público si la familia no lo hizo.",
      "El registro en el Libro de Registro de Incidencias y el reporte al Portal SíseVe los hace la dirección, no usted.",
      "No interrogar ni entrevistar al estudiante: la revictimización está prohibida.",
      "Está prohibido conciliar entre los involucrados o sus familiares.",
      "Orientar a la familia sobre el Centro Emergencia Mujer o el Servicio de Atención Rural.",
    ],
    plazo: "30 días hábiles",
    hitos: [
      { paso: "Denuncia y comunicación a Comisaría o Fiscalía", plazo: "Día 01" },
      { paso: "Libro de Registro de Incidencias y Portal SíseVe", plazo: "Día 01" },
      { paso: "Reunión con tutoría y con padres o apoderados", plazo: "Día 02" },
      { paso: "Derivación al CEM o al SAR", plazo: "Día 02" },
      { paso: "Cierre del caso", plazo: "Día 30" },
    ],
    noAplica:
      "No es aplicable cuando ambos involucrados corresponden al nivel inicial de la EBR. En ese caso rige el Anexo 01, ruta frente a conductas sexuales en niños de nivel inicial.",
    fuente: {
      norma: "RM 383-2025-MINEDU, Anexo 03, Protocolo 04",
      paginaPdf: 26,
      paginaDocumento: 23,
      verificadoPor: VERIFICADOR,
      url: URL_NORMA,
    },
  },
  {
    clave: "protocolo_05",
    nivel: "protocolo",
    protocolo: 5,
    verificado: "publicado",
    titulo: "Castigo físico y humillante de personal de la IE",
    bloque: "II. Violencia del personal de la IE a estudiantes",
    cuando:
      "Personal de la institución usa la fuerza o el trato denigrante para corregir a un estudiante: jalones de oreja, palmazos, planas, insultos, ridiculizaciones, discriminación.",
    ruta: [
      "Usted informa al director el mismo día. La denuncia administrativa puede ser verbal, y entonces se levanta acta ante el director.",
      "El director convoca al Comité de Gestión del Bienestar y coordina el acompañamiento socioemocional del estudiante agredido.",
      "Comunicar el hecho a la UGEL, que evalúa el inicio del procedimiento administrativo disciplinario.",
      "El registro en el Libro de Registro de Incidencias y el reporte al Portal SíseVe los hace la dirección, no usted.",
      "Está prohibido conciliar, minimizar el hecho o naturalizarlo.",
      "Si el castigo es reiterado o hay grave afectación a la vida, el cuerpo o la salud, se comunica además a la autoridad competente.",
    ],
    plazo: "30 días hábiles",
    hitos: [
      { paso: "Denuncia administrativa", plazo: "Día 01" },
      { paso: "Reunión del CGB y con padres o apoderados", plazo: "Día 02" },
      { paso: "Comunicación a la UGEL", plazo: "Día 03" },
      { paso: "Libro de Registro de Incidencias y Portal SíseVe", plazo: "Día 03" },
      {
        paso: "Autoridad competente si es reiterado o hay grave afectación",
        plazo: "Dentro de 24 horas",
      },
      { paso: "Cierre del caso", plazo: "Día 30" },
    ],
    noAplica:
      "El castigo físico y humillante no constituye por su naturaleza un hecho punible, salvo reiteración o grave afectación a la vida, el cuerpo o la salud.",
    fuente: {
      norma: "RM 383-2025-MINEDU, Anexo 03, Protocolo 05",
      paginaPdf: 30,
      paginaDocumento: 27,
      verificadoPor: VERIFICADOR,
      url: URL_NORMA,
    },
  },
  {
    clave: "protocolo_06",
    nivel: "protocolo",
    protocolo: 6,
    verificado: "publicado",
    titulo:
      "Violencia sexual (violación sexual, tocamientos, actos de connotación sexual o actos libidinosos y acoso sexual) de personal de la IE a estudiantes",
    bloque: "II. Violencia del personal de la IE a estudiantes",
    cuando:
      "Conducta con connotación sexual de un trabajador de la institución hacia un estudiante, presencial o por medios digitales.",
    ruta: [
      "Todo integrante de la comunidad educativa debe comunicar el hecho a la Dirección apenas lo conoce.",
      "El director presenta la denuncia administrativa y comunica de manera inmediata a la Comisaría o al Ministerio Público.",
      "Separación preventiva del personal presuntamente agresor, poniéndolo a disposición de la UGEL.",
      "La dirección anota el hecho en el Libro de Registro de Incidencias con las iniciales del estudiante, nunca su nombre, y lo reporta en el Portal SíseVe.",
      "Derivación obligatoria al Centro Emergencia Mujer, o al Servicio de Atención Rural donde no exista CEM.",
      "No interrogar ni entrevistar al estudiante, y no conciliar con los involucrados ni con sus familiares.",
    ],
    plazo: "30 días hábiles",
    hitos: [
      { paso: "Denuncia administrativa", plazo: "Inmediatamente de conocido el caso" },
      { paso: "Comunicación a Comisaría o Ministerio Público", plazo: "De manera inmediata" },
      { paso: "Separación preventiva del personal", plazo: "Día 01" },
      { paso: "Libro de Registro de Incidencias y Portal SíseVe", plazo: "Día 01" },
      { paso: "Informe a la UGEL", plazo: "Día 02" },
      { paso: "Derivación al CEM o al SAR", plazo: "Día 03" },
      { paso: "Cierre del caso", plazo: "Día 30" },
    ],
    noAplica: null,
    fuente: {
      norma: "RM 383-2025-MINEDU, Anexo 03, Protocolo 06",
      paginaPdf: 33,
      paginaDocumento: 30,
      verificadoPor: VERIFICADOR,
      url: URL_NORMA,
    },
  },
  {
    clave: "protocolo_07",
    nivel: "protocolo",
    protocolo: 7,
    verificado: "publicado",
    titulo:
      "Violencia contra estudiantes de parte de una persona del entorno familiar o comunitario (violencia física, psicológica y sexual)",
    bloque: "III. Violencia del entorno familiar o comunitario",
    cuando:
      "Señales de alerta de que un estudiante es agredido en su casa o por alguien de su entorno: golpes, negligencia, humillación sostenida o violencia sexual.",
    ruta: [
      "Detectar las señales de alerta e informar de inmediato al director. Aquí la norma sí nombra a docentes y tutores.",
      "El director se comunica el mismo día con el padre o apoderado que no esté involucrado en el hecho.",
      "El director denuncia ante la comisaría, la fiscalía o el juzgado.",
      "El hecho se registra en el Libro o cuaderno de actas de la institución.",
      "Derivación al Centro Emergencia Mujer, o al Servicio de Atención Rural en ámbitos rurales y pueblos indígenas.",
      "Si el castigo físico o humillante viene de la familia, comunicar además a la DEMUNA.",
    ],
    plazo: "Atención permanente, sin plazo de cierre en días",
    hitos: [
      { paso: "Detección y comunicación al director", plazo: "En el día de conocido el hecho" },
      { paso: "Denuncia ante la autoridad", plazo: "En el día de conocido el hecho" },
      { paso: "Derivación al CEM o al SAR", plazo: "Dentro de 24 horas de realizada la denuncia" },
      { paso: "Seguimiento y acompañamiento", plazo: "Bimestral durante el año escolar" },
      { paso: "Cierre coordinando la protección con el CEM", plazo: "Permanente" },
    ],
    noAplica:
      "Este caso no se reporta en el Portal SíseVe: el registro que corresponde es el Libro o cuaderno de actas de la IE.",
    fuente: {
      norma: "RM 383-2025-MINEDU, Anexo 03, Protocolo 07",
      paginaPdf: 37,
      paginaDocumento: 34,
      verificadoPor: VERIFICADOR,
      url: URL_NORMA,
    },
  },
  {
    clave: "docente_agredido",
    nivel: "informativa",
    protocolo: null,
    verificado: "publicado",
    titulo: "Violencia ejercida por un estudiante en agravio de personal de la IE",
    bloque: null,
    cuando:
      "El agredido es usted, profe, no un estudiante. Los siete protocolos no cubren este caso: tienen otra ruta.",
    ruta: [
      "Se aplican las medidas correctivas del Reglamento Interno de la institución.",
      "Se cita al padre o apoderado del estudiante y se firman compromisos para restaurar la convivencia.",
      "Está prohibido conciliar el hecho de violencia.",
      "De requerirlo, se deriva al estudiante al servicio especializado: centro de salud, DEMUNA, Unidad de Protección Especial o Centro Emergencia Mujer.",
      "Solo si hay lesiones, amenaza de muerte o arma blanca se puede comunicar a la autoridad competente.",
    ],
    plazo: null,
    hitos: [],
    noAplica:
      "Aquí no hay ruta SíseVe ni plazo de cierre: el Portal SíseVe registra violencia contra estudiantes, no contra el docente.",
    fuente: {
      norma: "RM 383-2025-MINEDU, Anexo 03, numeral 4.3",
      paginaPdf: 13,
      paginaDocumento: 10,
      verificadoPor: VERIFICADOR,
      url: URL_NORMA,
    },
  },
  {
    clave: "sin_protocolo",
    nivel: "sin_norma",
    protocolo: null,
    verificado: "publicado",
    titulo: "Conflicto de convivencia, no violencia escolar",
    bloque: null,
    cuando:
      "Desacuerdo respetuoso, corrección firme sin humillación, o malentendido sin insultos entre estudiantes.",
    ruta: [
      "No se activa ningún protocolo: la norma es explícita en que esto no es violencia.",
      "Corresponde acompañamiento y estrategia de aula, y dejarlo anotado en su cuaderno de incidencias.",
      "Si se repite o escala, vuelva a contármelo: ahí sí puede cambiar de casillero.",
    ],
    plazo: null,
    hitos: [],
    noAplica: null,
    fuente: {
      norma: "RM 383-2025-MINEDU, Anexo 03, numeral 4.2",
      paginaPdf: 12,
      paginaDocumento: 9,
      verificadoPor: VERIFICADOR,
      url: URL_NORMA,
    },
  },
];

/**
 * Las unicas claves que el modelo puede emitir. Va directo al enum del
 * schema de la herramienta `registrar_incidencia` en lib/prompts.ts.
 */
export const CLAVES_NORMA: string[] = NORMA.map((f) => f.clave);

/** A donde cae una clave que el modelo se invento. La tarjeta mas prudente. */
export const CLAVE_RESPALDO = "sin_protocolo";

/**
 * Resuelve la clave que devolvio el modelo. Nunca lanza: si el modelo se
 * inventa una clave, cae en "sin_protocolo" y la ficha sigue funcionando.
 * Preferimos una tarjeta prudente a una pantalla rota en escena.
 */
export function resolverNorma(clave: string | null | undefined): FilaNorma {
  const fila = NORMA.find((f) => f.clave === clave);
  if (fila) return fila;
  const respaldo = NORMA.find((f) => f.clave === CLAVE_RESPALDO);
  if (!respaldo) throw new Error("falta la fila de respaldo en NORMA");
  return respaldo;
}

/**
 * Cita corta para el pie de la tarjeta. Aca es donde el digito se pinta,
 * con dos cifras porque asi lo escribe el documento ("PROTOCOLO 03").
 *
 * Dice "del Anexo 03" SIEMPRE, y no es verborrea: el Portal SiseVe numera
 * sus protocolos del uno al cinco y esa numeracion NO coincide con la del
 * Anexo 03 (tabla de equivalencias, Anexo N.02, pdf p.42). Mandar a una
 * docente a "el protocolo tres" del SiseVe la manda a castigo humillante
 * de personal de la IE, no a armas.
 */
export function citaCorta(fila: FilaNorma): string {
  return fila.protocolo === null
    ? fila.fuente.norma.replace("RM 383-2025-MINEDU, ", "RM 383-2025-MINEDU · ")
    : `RM 383-2025-MINEDU · Protocolo ${etiquetaProtocolo(fila)} del Anexo 03`;
}

/** "03". Cadena vacia cuando la fila no tiene protocolo que numerar. */
export function etiquetaProtocolo(fila: FilaNorma): string {
  return fila.protocolo === null ? "" : String(fila.protocolo).padStart(2, "0");
}
