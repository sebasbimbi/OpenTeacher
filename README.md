# OpenEd

Agente de WhatsApp para docentes peruanos. El docente reporta un incidente de aula, por texto o por audio, y OpenEd responde con contencion emocional mas tacticas inmediatas, y registra la incidencia para generar reportes por alumno y por aula.

Todo en espanol peruano. Hackathon AIdea, 29 de agosto.

## Estado

Scaffold listo. El brief de producto (arquitectura de agentes, prompts, esquema de datos, contexto MINEDU) todavia no llega, asi que la logica de producto esta marcada como PENDIENTE en `lib/prompts.ts` y `lib/agents.ts`. Lo que si esta en pie:

- Simulador de chat estilo WhatsApp en `/`, corriendo 100% local. Es el Plan B de la demo.
- Wrapper del Anthropic SDK con modo mock automatico.
- Webhook de WhatsApp Cloud API con el handshake de verificacion de Meta.
- Deploy en Vercel.

## Correr en local

```bash
npm install
cp .env.example .env.local   # rellenar las llaves; .env.local nunca se commitea
npm run dev
```

Abre http://localhost:3000. Sin `ANTHROPIC_API_KEY` el proyecto corre en modo mock y no toca la red.

## Estructura

| Ruta | Que hace |
|---|---|
| `app/page.tsx` | Simulador de chat de WhatsApp. Plan B de la demo. |
| `app/api/whatsapp/route.ts` | Webhook de WhatsApp Cloud API. GET verifica, POST recibe. |
| `lib/claude.ts` | Wrapper del Anthropic SDK. Modo real y modo mock. |
| `lib/prompts.ts` | Prompts de los agentes, separados del codigo. PENDIENTE. |
| `lib/agents.ts` | Orquestacion de los agentes. PENDIENTE. |
| `lib/mockData.ts` | Datos pre-generados. De aqui vive la demo si la red falla. |

## Documentos

`PROBLEM.md` · `PRODUCT.md` · `ARCHITECTURE.md` · `PITCH.md` · `TEAM.md`

## Stack

Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Anthropic SDK. Sin base de datos, sin auth, sin state manager. Se agregan cuando el brief los pida.
