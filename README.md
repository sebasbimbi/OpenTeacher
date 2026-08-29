# OpenEd

Agente de WhatsApp para docentes peruanos. El docente reporta un incidente de aula, por texto o por audio, y OpenEd responde con contencion emocional mas tacticas inmediatas, y registra la incidencia para generar reportes por alumno y por aula.

Todo en espanol peruano. Hackathon AIdea, 29 de agosto.

## Estado

Hoy NO se usa un numero real de WhatsApp. El simulador web es el producto y lo unico que se demuestra.

El brief de producto (arquitectura de agentes, prompts, esquema de datos, contexto MINEDU) todavia no llega, asi que la logica de los agentes esta marcada como PENDIENTE en `lib/prompts.ts` y `lib/agents.ts`. Lo que si esta en pie:

- Simulador de chat estilo WhatsApp en `/`, corriendo 100% local.
- Grabacion de audio real en el navegador con MediaRecorder, con duracion medida y reproduccion.
- Transcripcion en `/api/transcribir` con Whisper, y modo mock cuando no hay llave.
- Wrapper del Anthropic SDK con modo mock automatico.
- Webhook de WhatsApp Cloud API con el handshake de verificacion de Meta. Congelado, sirve de evidencia.
- Deploy en Vercel.

## Correr en local

```bash
npm install
cp .env.example .env.local   # rellenar las llaves; .env.local nunca se commitea
npm run dev
```

Abre http://localhost:3000. Sin `ANTHROPIC_API_KEY` ni `OPENAI_API_KEY` el proyecto corre en modo mock y no toca la red.

```bash
npm run check        # helpers de audio, sin dependencias, corre en un segundo
npm run test:audio   # ruta de audio en Chromium real: camino feliz + los 3 modos de falla
```

```bash
npm run test:movil   # PWA en 390px CONTRA PRODUCCION: que el microfono grabe de verdad sobre https
```

`test:audio` corre contra localhost por defecto y `test:movil` contra produccion. Ambos aceptan `URL_APP=` para apuntar al otro lado.

La grabacion necesita https o localhost (requisito del navegador, no del proyecto).

## Estructura

| Ruta | Que hace |
|---|---|
| `app/page.tsx` | Simulador de chat de WhatsApp. Plan B de la demo. |
| `app/api/transcribir/route.ts` | Transcribe la nota de voz con Whisper. Modo mock sin llave. |
| `lib/grabadora.ts` | Hook de MediaRecorder. Graba, mide, y maneja los modos de falla. |
| `lib/audioErrores.ts` | Helpers puros de la ruta de audio. Cubiertos por `npm run check`. |
| `app/api/whatsapp/route.ts` | Webhook de WhatsApp Cloud API. Congelado, hoy no se usa. |
| `lib/claude.ts` | Wrapper del Anthropic SDK. Modo real y modo mock. |
| `lib/prompts.ts` | Prompts de los agentes, separados del codigo. PENDIENTE. |
| `lib/agents.ts` | Orquestacion de los agentes. PENDIENTE. |
| `lib/mockData.ts` | Datos pre-generados. De aqui vive la demo si la red falla. |

## Instalar en el telefono

OpenEd es una PWA: se instala desde el navegador, sin app nativa y sin tienda. Abre https://opened-phi.vercel.app y:

- **Android (Chrome):** menu de tres puntos, "Instalar aplicacion" o "Anadir a pantalla principal".
- **iPhone (Safari):** boton de compartir, "Anadir a pantalla de inicio".

Queda con su icono y abre a pantalla completa, sin barra del navegador. El microfono funciona igual porque produccion es https, que es lo que el navegador exige para grabar.

## Documentos

`PROBLEM.md` · `PRODUCT.md` · `ARCHITECTURE.md` · `PITCH.md` · `TEAM.md`

## Stack

Next.js 15 (App Router), TypeScript, Tailwind CSS 4, Anthropic SDK. Sin base de datos, sin auth, sin state manager. Se agregan cuando el brief los pida.
