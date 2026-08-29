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

## Grabacion larga de aula (/aula)

Una clase de 45 minutos en opus mono ronda los 37 MB y Whisper corta en 25 MB, asi que hay que trocear.

**No se usa `recorder.start(timeslice)`.** Los trozos que emite despues del primero salen sin cabecera y no son decodificables por separado. En su lugar se **rota el MediaRecorder**: cada 5 minutos se para el recorder y se arranca uno nuevo sobre el mismo stream. Cada segmento sale como un webm completo y valido por si solo. Sin ffmpeg y sin cirugia de cabeceras. Verificado byte a byte: cada segmento arranca con la cabecera EBML `1a45dfa3` propia.

**Un solo `getUserMedia`.** Al rotar se para el RECORDER, nunca las pistas del stream. Si se paran las pistas, el navegador apaga el microfono y el indicador parpadea en cada rotacion, o vuelve a pedir permiso. La prueba cuenta las llamadas: 3 segmentos, 1 sola llamada.

**Persistencia en IndexedDB, no localStorage.** localStorage solo guarda strings; IndexedDB guarda Blobs. Cada segmento se escribe apenas cierra, no al final: si la pestana muere en el minuto 40, lo grabado hasta ahi esta a salvo y se recupera al volver a entrar.

### La duracion que se reporta es la honesta

Se reporta la **suma real de los segmentos capturados**, no el reloj de pared. Si el navegador estrangulo los timers con la pestana en segundo plano, la pantalla dice cuanto audio falta en vez de afirmar 45 minutos que no grabo. Vale mas una sesion que dice "se corto en el minuto 22" que una que miente diciendo 45.

Tres formas de detectarlo, las tres cubiertas:

| Senal | Que se hace |
|---|---|
| `visibilitychange` a oculto | Se anota el tramo y se avisa en pantalla al volver. |
| Un segmento que dura mas de 1.5x el intervalo | El timer fue estrangulado. Se avisa. |
| `track.onended` | El sistema le quito el microfono. Se para y se dice, sin seguir en falso. |

### Gancho de prueba

`?seg=N` rota cada N segundos en vez de cada 5 minutos. Sin eso, verificar la rotacion cuesta 15 minutos de reloj por corrida. La maquina de estados es la misma.

## PWA

`app/manifest.ts` la hace instalable en el telefono: `display: standalone`, colores de la paleta de WhatsApp que ya usa la interfaz, e iconos 192, 512 y uno maskable con la zona segura que Android recorta.

iOS ignora los iconos del manifest para la pantalla de inicio y usa `apple-icon.png`, que Next sirve desde `app/`. Sin ese archivo el atajo de iPhone sale con una captura de la pagina en lugar del icono, asi que no es opcional.

Tres detalles de movil que no son cosmeticos:

- La altura va en `dvh`, no en `vh`. Con `100vh` la barra dinamica de los navegadores moviles empuja el campo de escribir debajo del fold.
- La barra de escribir lleva `env(safe-area-inset-bottom)`. En standalone en iPhone, el indicador de inicio se come esos pixeles.
- No se bloquea el zoom. El salto de zoom al enfocar un input en iOS ya esta resuelto con el input a 16px, asi que no hace falta romper la accesibilidad con `maximum-scale=1`.

Los iconos se generaron renderizando un SVG en Chromium, no a mano. El script no se deja en el repo: son archivos estaticos que no cambian.

## Variables de entorno

Ver `.env.example`. `.env.local` esta en `.gitignore` y nunca se commitea.
