import { NextRequest } from "next/server";
import { responderIncidencia, type Turno } from "@/lib/agents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * El agente de contencion. Una llamada, dos bloques de vuelta.
 *
 * Va inline y no en cola: la docente esta esperando en el chat y el turno
 * dura segundos. Ademas nunca devuelve error al chat: si el modelo falla,
 * baja el fixture. Una burbuja vacia en escena es peor que una respuesta de
 * reserva bien escrita.
 */
export async function POST(req: NextRequest) {
  const cuerpo = (await req.json().catch(() => null)) as { historial?: unknown } | null;
  const crudo = Array.isArray(cuerpo?.historial) ? cuerpo.historial : null;

  if (!crudo || crudo.length === 0) {
    return Response.json({ error: "Falta el historial de la conversacion." }, { status: 400 });
  }

  const historial: Turno[] = [];
  for (const t of crudo) {
    const turno = t as { rol?: unknown; texto?: unknown };
    const texto = typeof turno.texto === "string" ? turno.texto.trim() : "";
    if (!texto) continue;
    historial.push({ rol: turno.rol === "opened" ? "opened" : "docente", texto });
  }

  // La API exige que el primero sea del usuario y que no haya dos seguidos
  // del mismo rol al final. El saludo inicial es nuestro, asi que se descarta.
  while (historial.length && historial[0].rol === "opened") historial.shift();
  if (historial.length === 0) {
    return Response.json({ error: "No hay ningun mensaje de la docente." }, { status: 400 });
  }

  const { incidencia, mock } = await responderIncidencia(historial, req.signal);
  return Response.json({ ...incidencia, mock });
}
