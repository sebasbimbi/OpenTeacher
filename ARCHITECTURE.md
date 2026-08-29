# Arquitectura

## Stack

Next.js 15 (App Router) sobre Vercel. TypeScript. Tailwind CSS 4. Anthropic SDK para los agentes. OpenAI Whisper solo para transcribir los audios que manda el docente.

Sin base de datos, sin auth, sin state manager. El estado vive en memoria del proceso hasta que el brief pida persistencia.

## Piezas

```
WhatsApp Cloud API
        |
        v
app/api/whatsapp/route.ts     GET: handshake de Meta. POST: mensaje entrante.
        |
        v
lib/agents.ts                 orquestacion (PENDIENTE con el brief)
        |
        v
lib/claude.ts                 wrapper del SDK, modo real o mock
        |
        +--> lib/prompts.ts   prompts fuera del codigo
        +--> lib/mockData.ts  fixtures pre-generadas
```

Regla de la casa: los prompts nunca van inline. Viven en `lib/prompts.ts` con placeholders `{variable}` que `fillTemplate()` reemplaza.

## Plan B (demo failure)

El escenario de un hackathon tiene wifi malo, proyector prestado y un API que elige justo ese minuto para tener latencia. La demo no puede depender de una llamada de red en vivo.

Dos capas de Plan B:

1. **Simulador de chat** en `/`. Corre 100% con `lib/mockData.ts`, sin una sola llamada de red. Si WhatsApp real falla en el escenario, se demuestra ahi y la demo sigue. Se ve como WhatsApp a proposito: paleta clavada, burbujas verdes y blancas, nota de voz, indicador de escribiendo.
2. **Modo mock del wrapper**. `lib/claude.ts` devuelve fixtures cuando no hay `ANTHROPIC_API_KEY` o cuando `OPENED_MOCK_MODE=true`. La app entera corre offline.

Quien narra lo dice sin disculparse: "como estan viendo el flujo, ahora les muestro el resultado precargado del mismo caso."

## Variables de entorno

Ver `.env.example`. `.env.local` esta en `.gitignore` y nunca se commitea.
