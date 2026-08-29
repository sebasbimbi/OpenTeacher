/**
 * El agente de contencion de OpenEd.
 *
 * UNA sola llamada con tool_choice forzado. Devuelve la prosa para la docente
 * y el triage estructurado juntos.
 *
 * Riesgos cubiertos aca, cada uno con su razon:
 *
 * 1. Con tool_choice forzado la respuesta puede NO traer ningun bloque de
 *    texto. Por eso la prosa vive DENTRO del esquema y nunca se busca un
 *    bloque `text`.
 * 2. `stop_reason: "refusal"` llega con HTTP 200 y sin excepcion, y este
 *    dominio (violencia, menores, autolesion) es justo donde pasa. Un solo
 *    guard cubre eso y tambien `max_tokens`.
 * 3. Si algo sale mal, se cae al fixture. La demo nunca se queda muda.
 */

import Anthropic from "@anthropic-ai/sdk";
import { isMockMode } from "./claude";
import { RESPUESTA_ECO } from "./mockData";
import {
  HERRAMIENTA_REGISTRAR,
  MODELO_ID,
  SISTEMA_OPENED,
  type Incidencia,
} from "./prompts";

const MAX_TOKENS = 2048;
const MOCK_DELAY_MS = 900;

/** El fixture, partido en dos bloques igual que la respuesta real. */
export function incidenciaMock(): Incidencia {
  const partes = RESPUESTA_ECO.split("\n\n");
  return {
    bloque_1: partes[0],
    bloque_2: partes.slice(1).join("\n\n"),
    momento: "en_frio",
    categoria: "agresion_entre_pares",
    es_violencia: true,
    requiere_derivacion: false,
    resumen:
      "Dos estudiantes de cuarto se agredieron fisicamente en el recreo. La docente los separo y los derivo a direccion. Segun uno de ellos, no es la primera vez.",
    alumno_iniciales: "",
  };
}

export interface Turno {
  rol: "docente" | "opened";
  texto: string;
}

let cliente: Anthropic | null = null;
function getCliente(): Anthropic {
  if (!cliente) cliente = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return cliente;
}

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Las iniciales no se pintan tal cual salen del modelo.
 *
 * Medido: cuando no hay nombre que poner, el modelo a veces devuelve un token
 * corrupto en vez de una cadena vacia. Eso llegaria a la hoja del alumno como
 * basura delante de educadoras. Solo pasan letras, puntos y espacios, cortos.
 */
export function sanearIniciales(crudo: unknown): string {
  if (typeof crudo !== "string") return "";
  const limpio = crudo.trim();
  if (!limpio || limpio === "SIN_NOMBRE") return "";
  if (limpio.length > 12) return "";
  return /^[A-Za-zÁÉÍÓÚÑáéíóúñ.\s]+$/.test(limpio) ? limpio : "";
}

/**
 * Devuelve SIEMPRE una incidencia. Si el modelo se niega, se corta o falla,
 * cae al fixture: en escena vale mas una respuesta buena de reserva que una
 * burbuja vacia.
 */
export async function responderIncidencia(
  historial: Turno[],
  senal?: AbortSignal,
): Promise<{ incidencia: Incidencia; mock: boolean }> {
  if (isMockMode()) {
    await dormir(MOCK_DELAY_MS);
    return { incidencia: incidenciaMock(), mock: true };
  }

  try {
    const respuesta = await getCliente().messages.create(
      {
        model: MODELO_ID,
        max_tokens: MAX_TOKENS,
        system: SISTEMA_OPENED,
        // Efecto buscado: respuesta rapida en escena. La contencion no es un
        // problema de razonamiento profundo, es de criterio y voz.
        output_config: { effort: "low" },
        tools: [HERRAMIENTA_REGISTRAR as never],
        tool_choice: { type: "tool", name: HERRAMIENTA_REGISTRAR.name },
        messages: historial.map((t) => ({
          role: t.rol === "docente" ? ("user" as const) : ("assistant" as const),
          content: t.texto,
        })),
      },
      senal ? { signal: senal } : undefined,
    );

    // Un stop_reason que no sea end_turn ni tool_use significa que no hay
    // herramienta usable: negativa, corte por tokens, o pausa.
    if (respuesta.stop_reason !== "tool_use" && respuesta.stop_reason !== "end_turn") {
      console.warn("[responder] stop_reason inesperado:", respuesta.stop_reason);
      return { incidencia: incidenciaMock(), mock: true };
    }

    const uso = respuesta.content.find((b) => b.type === "tool_use");
    if (!uso || uso.type !== "tool_use") {
      console.warn("[responder] la respuesta no trajo tool_use");
      return { incidencia: incidenciaMock(), mock: true };
    }

    const datos = uso.input as Partial<Incidencia>;
    if (!datos?.bloque_1?.trim()) {
      console.warn("[responder] tool_use sin bloque_1");
      return { incidencia: incidenciaMock(), mock: true };
    }

    return {
      incidencia: {
        bloque_1: datos.bloque_1.trim(),
        bloque_2: (datos.bloque_2 ?? "").trim(),
        momento: datos.momento ?? "en_caliente",
        categoria: datos.categoria ?? "conflicto_sin_violencia",
        es_violencia: datos.es_violencia ?? false,
        requiere_derivacion: datos.requiere_derivacion ?? false,
        resumen: (datos.resumen ?? "").trim(),
        alumno_iniciales: sanearIniciales(datos.alumno_iniciales),
      },
      mock: false,
    };
  } catch (err) {
    if ((err as Error)?.name === "AbortError") throw err;
    console.error("[responder]", err);
    return { incidencia: incidenciaMock(), mock: true };
  }
}
