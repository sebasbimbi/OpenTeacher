# Arquitectura

## Stack

Next.js 15 (App Router) sobre Vercel. TypeScript. Tailwind CSS 4. Anthropic SDK para los agentes. OpenAI Whisper solo para transcribir los audios que manda el docente.

Sin base de datos, sin auth, sin state manager. El estado vive en memoria del proceso hasta que el brief pida persistencia.

## Alcance de hoy

No se usa un numero real de WhatsApp. Nada de Meta Cloud API en vivo, nada de Twilio. La demo entera corre sobre el simulador web, que dejo de ser el plan B y paso a ser el producto: es lo unico que el jurado ve.

`app/api/whatsapp/route.ts` se queda como esta. El handshake de verificacion de Meta funciona y esta probado, y sirve de evidencia de que el camino al numero real esta trazado, pero hoy no se invierte mas tiempo ahi.

## Piezas

```
app/page.tsx                  simulador de chat. EL producto.
        |
        +--> lib/grabadora.ts     MediaRecorder: graba en el navegador
        |         |
        |         v
        |    app/api/transcribir/route.ts   Whisper, con modo mock
        |
        v
lib/agents.ts                 orquestacion (PENDIENTE con el brief)
        |
        v
lib/claude.ts                 wrapper del SDK, modo real o mock
        |
        +--> lib/prompts.ts   prompts fuera del codigo
        +--> lib/mockData.ts  fixtures pre-generadas

app/api/whatsapp/route.ts     congelado. GET: handshake de Meta. POST: recibe.
```

Regla de la casa: los prompts nunca van inline. Viven en `lib/prompts.ts` con placeholders `{variable}` que `fillTemplate()` reemplaza.

## Plan B (demo failure)

El escenario de un hackathon tiene wifi malo, proyector prestado y un API que elige justo ese minuto para tener latencia. La demo no puede depender de una llamada de red en vivo.

Dos capas de Plan B:

1. **Simulador de chat** en `/`. Corre 100% con `lib/mockData.ts`, sin una sola llamada de red. Si WhatsApp real falla en el escenario, se demuestra ahi y la demo sigue. Se ve como WhatsApp a proposito: paleta clavada, burbujas verdes y blancas, nota de voz, indicador de escribiendo.
2. **Modo mock del wrapper**. `lib/claude.ts` devuelve fixtures cuando no hay `ANTHROPIC_API_KEY` o cuando `OPENED_MOCK_MODE=true`. La app entera corre offline.

Quien narra lo dice sin disculparse: "como estan viendo el flujo, ahora les muestro el resultado precargado del mismo caso."

## Audio: que sale de MediaRecorder y si Whisper lo acepta

Medido, no asumido. Grabacion real en Chromium 1234 con dispositivo de prueba:

| Dato | Valor medido |
|---|---|
| `isTypeSupported` soportados | `audio/webm;codecs=opus`, `audio/webm`, `audio/mp4` |
| `recorder.mimeType` que sale | `audio/webm;codecs=opus` |
| Contenedor real (ffprobe) | matroska/webm, cabecera EBML `1a45dfa3` |
| Codec | opus, 48000 Hz, 1 canal |
| Peso | unos 41 KB por 3 segundos |

**Whisper acepta webm directo. No hace falta convertir nada.** La lista de formatos de la API de transcripciones de OpenAI incluye webm, y opus dentro de webm es exactamente lo que entrega Chrome. No hay ffmpeg en el camino y no lo va a haber hoy.

Un detalle que si importa: la API de OpenAI infiere el formato del **nombre del archivo**, no del content-type. Por eso `extensionDeMime()` en `lib/audioErrores.ts` arma el nombre (`nota.webm`, `nota.m4a`) antes de subirlo. Si eso se rompe, Whisper responde "Invalid file format" aunque el archivo este perfecto.

Safari entrega `audio/mp4` en vez de webm. Ya esta en la lista de preferencias de `lib/grabadora.ts` y Whisper tambien lo acepta, asi que el camino de Safari funciona sin codigo extra.

La duracion se mide con reloj propio (`Date.now()` al empezar y al terminar), no con `audio.duration`. Chrome actual si reporta duracion finita en ese webm (medido: 2.4s), pero recien la tiene despues de `loadedmetadata`, y el contador de "Grabando 0:07" la necesita desde el primer segundo.

### Por que la transcripcion va inline y no en cola

El docente esta esperando la respuesta en el chat, el clip dura segundos, y transcribir no tiene efectos colaterales que proteger con claves de idempotencia. Un solo trigger de la checklist (limites de tasa de OpenAI) no justifica una cola, y Vercel no hospeda un worker de todos modos. Lo que si esta puesto: timeout de 45s, el `Retry-After` de OpenAI se pasa tal cual en el 429, y limite de 25 MB antes de gastar la llamada. Si esto llegara a produccion con muchos docentes a la vez, aqui entra la cola.

### Modos de falla probados

Los cuatro degradan con mensaje en pantalla y dejan el chat usable. Ninguno cuelga la pagina ni deja el microfono tomado.

| Caso | Que hace |
|---|---|
| Permiso denegado (`NotAllowedError`) | Aviso explicando como activarlo, invita a escribir. El chat de texto sigue funcionando. |
| Microfono ocupado (`NotReadableError`) | Aviso de que otra app lo tiene. La barra vuelve a inactivo, no queda "grabando". |
| Menos de un segundo | Se descarta, no se crea burbuja, aviso "Muy corto". La siguiente grabacion funciona normal. |
| Cancelar a mitad | Sin burbuja, sin aviso de error, barra en inactivo. |

## Variables de entorno

Ver `.env.example`. `.env.local` esta en `.gitignore` y nunca se commitea.
