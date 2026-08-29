/**
 * Prompts maestros de los agentes de OpenEd.
 *
 * PENDIENTE: el brief de producto define los agentes reales
 * (contencion emocional, tacticas inmediatas, registro de incidencia).
 * Estos son placeholders con la forma correcta: texto plano con
 * placeholders {variable} que fillTemplate() reemplaza en lib/claude.ts.
 *
 * Regla de la casa: los prompts viven aqui, nunca inline en el codigo.
 */

export const AGENTE_CONTENCION = `PENDIENTE: prompt del agente de contencion + tacticas inmediatas.

CONTEXTO DEL DOCENTE:
- Relato de la incidencia: {relato}
- Grado y seccion: {aula}
- Alumnos involucrados: {alumnos}

TAREA: responder en espanol peruano, tono de colega que ya paso por eso.
`;

export const AGENTE_REGISTRO = `PENDIENTE: prompt del agente que extrae la incidencia estructurada del relato.

RELATO: {relato}

OUTPUT: JSON estricto, sin cercas de markdown.
`;
