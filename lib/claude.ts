/**
 * Wrapper del Anthropic SDK para OpenEd.
 *
 * Dos modos:
 *   - REAL: usa @anthropic-ai/sdk con ANTHROPIC_API_KEY.
 *   - MOCK: devuelve fixtures de lib/mockData.ts, sin red. Se activa solo
 *           si no hay API key o si OPENED_MOCK_MODE=true.
 *
 * El modo mock es el Plan B de la demo: nada en el escenario depende
 * de una llamada de red en vivo.
 */

import Anthropic from "@anthropic-ai/sdk";
import { RESPUESTA_ECO } from "./mockData";

const MODEL_ID = "claude-opus-5";
const MAX_TOKENS = 4096;
const MOCK_DELAY_MS = 900; // Latencia simulada para que la demo se vea viva.

let cachedClient: Anthropic | null = null;

export function isMockMode(): boolean {
  if (process.env.OPENED_MOCK_MODE === "true") return true;
  if (process.env.OPENED_MOCK_MODE === "false") return false;
  return !process.env.ANTHROPIC_API_KEY;
}

function getClient(): Anthropic {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY no esta definida. Activa modo mock o configura la key.");
  }
  cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}

function fillTemplate(template: string, variables: Record<string, string>): string {
  return Object.entries(variables).reduce(
    (acc, [key, value]) => acc.replaceAll(`{${key}}`, value),
    template,
  );
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Una llamada a Claude con un prompt de lib/prompts.ts. */
export async function llamarAgente(
  prompt: string,
  variables: Record<string, string>,
): Promise<string> {
  if (isMockMode()) {
    await sleep(MOCK_DELAY_MS);
    return RESPUESTA_ECO;
  }

  const response = await getClient().messages.create({
    model: MODEL_ID,
    max_tokens: MAX_TOKENS,
    thinking: { type: "adaptive" },
    messages: [{ role: "user", content: fillTemplate(prompt, variables) }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Respuesta del agente sin contenido de texto.");
  }
  return textBlock.text;
}
