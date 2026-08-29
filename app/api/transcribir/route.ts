import { NextRequest } from "next/server";
import { TAMANO_MAXIMO_BYTES } from "@/lib/audioErrores";
import { TRANSCRIPCION_MOCK } from "@/lib/mockData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ENDPOINT = "https://api.openai.com/v1/audio/transcriptions";
const MODELO = "whisper-1";
const TIMEOUT_MS = 45_000;
const MOCK_DELAY_MS = 900;

/**
 * Transcribe la nota de voz del docente.
 *
 * Mismo patron que lib/claude.ts: sin OPENAI_API_KEY (o con
 * OPENED_MOCK_MODE=true) devuelve una transcripcion fija y no toca la red.
 * La demo nunca depende de que OpenAI responda.
 *
 * Va inline y no en cola a proposito: el docente esta esperando la
 * respuesta en el chat, el clip son segundos, y no hay side effects que
 * proteger. Si esto pasara a produccion con varios docentes a la vez,
 * aqui es donde entraria una cola.
 */
function isMockAudio(): boolean {
  if (process.env.OPENED_MOCK_MODE === "true") return true;
  if (process.env.OPENED_MOCK_MODE === "false") return false;
  return !process.env.OPENAI_API_KEY;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function json(cuerpo: unknown, status: number, headers?: HeadersInit) {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export async function POST(req: NextRequest) {
  if (isMockAudio()) {
    await sleep(MOCK_DELAY_MS);
    return json({ texto: TRANSCRIPCION_MOCK, mock: true }, 200);
  }

  let archivo: File | null = null;
  try {
    const form = await req.formData();
    const valor = form.get("audio");
    if (valor instanceof File) archivo = valor;
  } catch {
    return json({ error: "No pude leer el audio que mandaste." }, 400);
  }

  if (!archivo || archivo.size === 0) {
    return json({ error: "No llego ningun audio." }, 400);
  }
  if (archivo.size > TAMANO_MAXIMO_BYTES) {
    return json({ error: "El audio es muy largo. Manda uno mas corto." }, 413);
  }

  const salida = new FormData();
  salida.append("file", archivo, archivo.name || "nota.webm");
  salida.append("model", MODELO);
  salida.append("language", "es");

  let respuesta: Response;
  try {
    respuesta = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: salida,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return json({ error: "La transcripcion tardo demasiado. Vuelve a intentar." }, 504);
  }

  if (respuesta.status === 429) {
    // OpenAI manda Retry-After. Lo pasamos tal cual en vez de inventar un backoff.
    const retryAfter = respuesta.headers.get("retry-after");
    return json(
      { error: "Hay muchas transcripciones en cola. Intenta de nuevo en unos segundos." },
      429,
      retryAfter ? { "Retry-After": retryAfter } : undefined,
    );
  }

  if (!respuesta.ok) {
    const detalle = await respuesta.text().catch(() => "");
    console.error("[transcribir] OpenAI", respuesta.status, detalle.slice(0, 500));
    return json({ error: "No pude transcribir el audio. Escribeme el mensaje." }, 502);
  }

  const datos = (await respuesta.json().catch(() => null)) as { text?: string } | null;
  const texto = datos?.text?.trim();
  if (!texto) {
    return json({ error: "El audio salio vacio. Vuelve a grabar." }, 422);
  }

  return json({ texto, mock: false }, 200);
}
