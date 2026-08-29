/**
 * Orquestacion de los agentes de OpenEd.
 *
 * PENDIENTE: el brief de producto define el pipeline real
 * (contencion + tacticas, y en paralelo el registro de la incidencia).
 * Por ahora un solo paso, para no inventar logica de producto.
 */

import { llamarAgente } from "./claude";
import { AGENTE_CONTENCION } from "./prompts";

export interface Incidencia {
  relato: string;
  aula?: string;
  alumnos?: string;
}

export async function responderIncidencia(incidencia: Incidencia): Promise<string> {
  return llamarAgente(AGENTE_CONTENCION, {
    relato: incidencia.relato,
    aula: incidencia.aula ?? "(no indicado)",
    alumnos: incidencia.alumnos ?? "(no indicado)",
  });
}
