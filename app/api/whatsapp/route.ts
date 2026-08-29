import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Webhook de WhatsApp Cloud API.
 *
 * GET  = handshake de verificacion que Meta exige al registrar el webhook.
 * POST = mensajes entrantes del docente. PENDIENTE: conectar con
 *        responderIncidencia() de lib/agents.ts cuando llegue el brief.
 *        Se responde 200 de una para que Meta no reintente.
 */

export function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (
    params.get("hub.mode") === "subscribe" &&
    verifyToken &&
    params.get("hub.verify_token") === verifyToken
  ) {
    return new Response(params.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  console.log("[whatsapp] entrante:", JSON.stringify(body));
  return new Response(null, { status: 200 });
}
