# OpenTeacher, plan maestro

Hackathon AIdea, Lima. Escrito el **29 ago 2026 a las 14:56** (hora Lima, verificada con `date`).
Todo lo que sigue esta calculado contra ese reloj, no contra un dia entero.

> **Lo primero que cambia respecto del dossier.** El dossier planifico ~370 minutos de
> construccion mas ~145 de trabajo humano. A las 14:56 eso no existe. Si el pitch es a las
> 18:00 quedan unas dos horas de build util. Este documento es el plan que si cabe.
> **PROVISIONAL: la hora exacta del pitch no la verifique. Sebastian la confirma y ajusta
> el congelamiento en consecuencia.** Todas las horas de abajo asumen pitch 18:00.

---

## 1. Problema

Del lienzo oficial, textual: *"La sobrecarga emocional sin contencion impide a los docentes
gestionar adecuadamente los incidentes del aula."*

La cadena, en el orden del lienzo:

1. Carencia de herramientas preventivas y de recuperacion (el origen).
2. Deterioro de la capacidad de respuesta y toma de decisiones (impacto personal).
3. Escalamiento de conflictos escolares (consecuencia en el aula).
4. Aumento de conflictos con la comunidad educativa (impacto institucional).

El dato duro que sostiene el paso 1: **55,8 % de docentes reporto estres**, 28,4 % ansiedad,
19,1 % depresion. ENDO 2021, n = 9 765, *Revista de Neuro-Psiquiatria*
(https://revistas.upch.edu.pe/index.php/RNP/article/view/6380). Serie de apoyo: el estres
autorreportado paso de 32,3 % (2014) a 60,4 % (2020), Pulso PUCP
(https://pulso.pucp.edu.pe/noticias/salud-mental-el-55-8-de-docentes-padecio-problemas-de-estres-en-el-segundo-ano-de-la-pandemia).

Y el hueco que nadie cubre: la ley exige un psicologo por colegio y habia **2 291 para
82 734 IE publicas**, 2,7 % de cobertura (El Comercio, jul 2023,
https://elcomercio.pe/lima/la-ley-exige-que-haya-un-psicologo-por-colegio-pero-solo-hay-2291-para-82-mil-instituciones-publicas-informe-educacion-escolares-minedu-salud-mental-noticia/).
El MINEDU declaro 4 000 plazas en jul 2025
(https://educacionteescucha.minedu.gob.pe/noticias/minedu-fortalece-la-salud-mental-escolar-con-mas-psicologos-tutores-y-programas-integrales/).
**PROVISIONAL: la primera cifra es de un pedido de acceso a la informacion, la segunda es
autorreporte del MINEDU. Ninguna esta auditada.**

## 2. Solucion

Un agente al que la docente le cuenta lo que acaba de pasar en el aula, por escrito o por
audio, y que hace tres cosas en el mismo turno:

1. **La contiene a ella.** No al alumno primero, a ella. Es lo que pidieron Carmen y Silvia.
2. **Le dice que hacer ahora**, y si el relato encaja en un protocolo, le nombra la ruta.
   Nunca cierra solo con empatia cuando la ley obliga a escalar.
3. **Le deja el registro escrito**, por alumno y por aula, que se lleva a la reunion con el
   padre. Es lo que pidieron Mariale, Mara y Nicolas.

**El rol que imita es el auxiliar de educacion**, no el psicologo ni el tutor. El auxiliar es
quien por norma mantiene el cuaderno de incidencias y la ficha de seguimiento e informa al
director y al Comite de Gestion del Bienestar (RVM 126-2023-MINEDU,
https://www.minedu.gob.pe/reforma-magisterial/pdf/rvm-126-2023-minedu-situaciones-administrativas-auxiliares.pdf).
Y en primaria de EBR el auxiliar **no existe**, asi que ahi OpenTeacher cubre un puesto que la
escuela literalmente no tiene.

**Donde esta la innovacion defendible:** los 7 protocolos vigentes protegen al **estudiante**.
Cuando el agredido es el **docente**, la RM 383-2025-MINEDU manda Reglamento Interno, citacion
a padres y derivacion del estudiante, sin ninguna contencion para el maestro. Ese vacio es
verificable, no es opinion, y es exactamente lo que dijeron Carmen y Silvia. Ver
`MINEDU-CONTEXT.md` §5.

## 3. La restriccion dura del dia

**HOY NO SE USA UN NUMERO REAL DE WHATSAPP.** Ni Meta Cloud API, ni Twilio, ni webhook en
vivo, ni numero de prueba. La demo corre integra sobre el simulador web ya desplegado en
https://openteacher-peru.vercel.app. Decidido por Sebastian, cerrado, no se rediscute.

Tres consecuencias que hay que asumir de frente:

1. **La pantalla es lo unico que existe.** Si no se ve en el simulador, para el jurado no existe.
2. **Aparece una vulnerabilidad de pitch nueva:** el lienzo promete "un agente con su propio
   numero de WhatsApp" y vamos a mostrar una pagina web. El jurado lo va a notar. La respuesta
   va **temprano y de frente** en el pitch, no escondida al final. Texto exacto en `PITCH.md` §3.
3. **`app/api/whatsapp/route.ts` se congela tal cual**, con el handshake de Meta ya hecho, como
   evidencia de que el camino esta trazado. No se le invierte un minuto mas.

El audio si es parte del producto hoy: la docente graba en el navegador con MediaRecorder y se
transcribe. Eso ya esta construido (`lib/grabadora.ts`, `app/api/transcribir/route.ts`).

## 4. Estado real del repo, verificado hoy

Verificado a las 14:50 en `/Users/sebasbimbi/sebastian-bimbi/projects/bimbi-digital/aidea/opened`:

- Next 15.5.19 App Router, TypeScript, Tailwind 4, React 19, `@anthropic-ai/sdk` ^0.122.
- 7 commits. **`git remote -v` esta vacio: no hay GitHub.** Todo vive en un disco.
- `app/page.tsx` (448 lineas): el simulador completo y funcionando. Cabecera, burbujas con
  tail, nota de voz con waveform, doble check, indicador de escribiendo, barra que alterna
  microfono y enviar.
- `lib/claude.ts` (69 lineas): `isMockMode()`, `fillTemplate()`, `llamarAgente()`.
  `MODEL_ID = "claude-opus-5"`, `MAX_TOKENS = 4096`, `thinking: {type: "adaptive"}`, **sin
  `output_config`**, o sea effort por defecto (`high`).
- `lib/prompts.ts` y `lib/agents.ts`: la forma existe, la logica dice **PENDIENTE**.
- `app/api/transcribir/route.ts`: whisper-1, `language=es`, modo mock, manejo de 400, 413,
  429 con Retry-After, 502, 504 y 422.
- Extra que el brief no mencionaba y que si existe: **`app/aula/page.tsx`** (309 lineas, captura
  ambiental de una clase) y **`lib/consentimiento.ts`** (90 lineas, puerta de consentimiento
  antes de grabar menores, con su `.check.ts` enganchado a `npm run check`).
- `npm run check` corre hoy `lib/audioErrores.check.ts` y `lib/consentimiento.check.ts`.
- Docs: `README.md` 3,4 KB, `ARCHITECTURE.md` 6,2 KB. `PROBLEM.md` 695 B, `PRODUCT.md` 763 B,
  `PITCH.md` 526 B, `TEAM.md` 113 B. Los cuatro ultimos son esqueletos.

**Y lo que verifique en produccion a las 14:52:**

```
POST https://openteacher-peru.vercel.app/api/transcribir  (sin audio)
-> HTTP 200 en 4.48 s
-> {"texto":"Profe, disculpe. Hoy en el recreo dos chicos de cuarto...","mock":true}
GET  https://openteacher-peru.vercel.app/    -> HTTP 200 en 0.29 s
GET  https://openteacher-peru.vercel.app/aula -> HTTP 200
```

**Produccion esta fingiendo en este momento.** Transcribe cualquier cosa, incluso 4 bytes de
basura, con el mismo parrafo fijo. Y `lib/claude.ts` no se llama desde ningun lado: el unico
punto de cableado es `app/page.tsx:63`, un `setTimeout` de 1100 ms que devuelve `RESPUESTA_ECO`.

## 5. Dentro y fuera

### DENTRO, en orden de valor por minuto

| # | Que | Por que |
|---|---|---|
| 1 | Reescribir 3 strings mentirosos (`Aviso`, saludo `m1`, `RESPUESTA_ECO` + `TRANSCRIPCION_MOCK`) | 5 minutos. Compra el Plan B entero y borra el autogol mas barato |
| 2 | `lib/prompts.ts` real: `SISTEMA_OPENED` + herramienta `registrar_incidencia` | Sin esto no hay agente |
| 3 | `app/api/responder/route.ts` + cable en `app/page.tsx:63`, dos burbujas | El unico cable que falta |
| 4 | `lib/norma.ts` + `lib/norma.check.ts` | El modelo tiene PROHIBIDO escribir digitos. Los pone el codigo |
| 5 | `components/FichaNorma.tsx`, tres estados | Lo unico que hace **visible** el criterio 4 del jurado |
| 6 | `lib/cuaderno.ts` (semilla) + chip "Guardado en el cuaderno" | El puente visible entre la conversacion y el dato |
| 7 | Overlay del cuaderno con la hoja A4 imprimible | El entregable que Mariale pidio en el lienzo |

### FUERA, decidido y cerrado

- WhatsApp real en cualquier forma. Meta, Twilio, cloudflared, webhooks. Cero minutos.
- Tocar `app/api/whatsapp/route.ts`. Se congela.
- Segunda llamada al modelo para extraer la incidencia. Una sola llamada con `tool_choice`
  forzado devuelve prosa y triage juntos.
- Streaming y SSE. Con tool forzado el stream da JSON parcial y no sirve para partir burbujas.
- Prosa del reporte escrita por el modelo. **La escriben las docentes.** Mata una llamada, un
  fixture y un modo de fallo, y ademas suena mejor.
- Cualquier base de datos. Son 5 alumnos y ~22 filas en un array de TypeScript.
- El PDF de la norma como bloque `document` en base64. En YachAI nunca se commiteo y el agente
  degrado en silencio mientras el pitch afirmaba fidelidad normativa. Una tabla citable es
  mejor evidencia y ademas se ve.
- Cards animadas de pipeline multi-agente. Aca el teatro es WhatsApp.
- Rutas separadas `/aula-resumen` o `/alumno/[id]`. Un solo overlay. Cero cambio de ruta en escena.
- Auth, login, multi-colegio, roles, nomina por CSV, panel de administracion.
- Resolucion de identidad con alias o fuzzy matching. Match exacto contra 5 filas; si no
  resuelve, `alumno_id = "no_resuelto"` y la incidencia se guarda igual.
- Integracion o exportacion a SiseVe. No hay API publica verificada, y ademas OpenTeacher **no
  reporta ni asienta el Libro por decision**, no por falta de tiempo.
- Respuestas en audio (TTS). Nuevas features de PWA. Cualquier refactor de `lib/claude.ts`.
- La rama de riesgo suicida como beat de escenario. Vive en el prompt como frontera de
  seguridad, pero no se demuestra.

### Inversion del orden respecto del dossier, y por que

El dossier decia **construir al reves**: la hoja primero, el cable al final, porque quedarse
sin tiempo con el cable hecho deja "un chat lindo y una promesa". Con un dia entero eso era
correcto. **A las 14:56 se invierte**, por una razon concreta: la promesa ya esta desplegada y
dice, textual, *"Cuando el equipo conecte el agente, aqui va la contencion"*. Ese string se
proyecta hoy si nadie lo toca.

La solucion es mas barata que reordenar todo el dia: el **paso C0 de 5 minutos** reescribe ese
string con la respuesta real del caso de Carmen. Con eso el Plan B queda comprado y el peor
final posible pasa a ser un final aceptable. Recien ahi se construye hacia adelante.

## 6. Orden de construccion

Tres carriles en paralelo. Nadie espera a nadie.

### Carril A, Sebastian, sin codigo

| Hora | Min | Que | Listo cuando |
|---|---|---|---|
| 14:56 | 10 | Vercel: `ANTHROPIC_API_KEY` y `OPENAI_API_KEY` en Production y Preview. Redeploy. NO setear `OPENED_MOCK_MODE` | `curl -X POST -F x=1 https://openteacher-peru.vercel.app/api/transcribir` devuelve **400 "No llego ningun audio"**. Ese 400 es el unico recibo de que produccion dejo de fingir |
| 15:06 | 10 | `gh repo create` publico y push. Reescribir el bloque "Estado" del README en el mismo push | El link de GitHub abre y `app/api/whatsapp/route.ts` se ve desde el navegador. El README ya no dice "el brief todavia no llega" |
| 15:20 | 15 | **Compuerta del audio.** Grabar 3 clips de 15 s desde la posicion real del laptop, contra produccion, y cronometrar | Los 3 vuelven con el texto correcto en menos de 6 s. **Si no: borrar `OPENAI_API_KEY` de Vercel** y quedarse con la transcripcion en mock, que sale exacta siempre |
| 15:40 | 10 | Pre-vuelo del laptop (ver §7) | Checklist firmada |
| 17:00 | - | **Congelamiento.** Nadie commitea despues | Deploy verde y curl verificado |
| 17:00 | 40 | Tres corridas cronometradas del pitch | Tres seguidas por debajo de 3:00, sin un cambio de codigo entre ellas |

### Carril B, las cuatro docentes y Mariale, sin codigo, arranca YA

| Hora | Min | Quien | Que |
|---|---|---|---|
| 14:56 | 20 | Carmen + Mariale | Los 45 segundos de apertura, en sus palabras, dichos en voz alta una vez con cronometro. **Primero, no al final** |
| 14:56 | 30 | Jenny, Mara, Silvia | La semilla: 5 alumnos por iniciales **inventadas** y 20 a 22 incidencias sobre 6 semanas |
| 15:26 | 20 | Las cuatro | Los tres parrafos de la hoja del alumno, en su voz. Esto reemplaza una llamada al modelo |
| 15:46 | 20 | Mariale + una docente | Abrir `rm383-anexo03.pdf` (esta en esta misma carpeta) y contrastar fila por fila `lib/norma.ts` |
| 16:06 | 25 | Una docente | Validacion externa: mandar por WhatsApp a 5 colegas de otros colegios una foto de la tarjeta y de la hoja con **una** pregunta |
| 16:31 | 20 | Mariale | Lienzo y formatos del evento, con el link publico y el de GitHub |

### Carril C, el quadrant, codigo

| Hora | Min | Que |
|---|---|---|
| 14:56 | 5 | **C0** Los tres strings mentirosos |
| 15:01 | 25 | **C1** `lib/prompts.ts`: `SISTEMA_OPENED` + herramienta `registrar_incidencia` |
| 15:26 | 30 | **C2** `app/api/responder/route.ts` + cable en `page.tsx:63` + dos burbujas |
| 15:56 | 20 | **C3** `lib/norma.ts` + `lib/norma.check.ts` |
| 16:16 | 25 | **C4** `components/FichaNorma.tsx`, tres estados |
| 16:41 | 15 | **C5** `lib/cuaderno.ts` semilla + chip bajo la burbuja |
| 16:56 | 30 | **C6** Overlay del cuaderno con la hoja A4 |

C6 se pasa del congelamiento a proposito: **si a las 17:00 no esta, se corta donde este.**

**Orden de descarte si se atrasa, en este orden exacto:** (1) el resumen de aula con barras,
(2) el pulido del `@media print`, (3) el tercer estado de FichaNorma, (4) el chip. **Nunca se
descarta C0, C1 ni C2.**

## 7. Checklist del premortem, con hora de corte

Marcar con la inicial de quien lo hizo. Lo que no tiene inicial a su hora, no paso.

### Corte 15:10, antes de seguir con nada

- [ ] `curl -X POST -F x=1 .../api/transcribir` devuelve **400**, no `mock:true`. Sin eso, la
      invitacion del pitch a probarlo se **borra** del guion.
- [ ] Existe el repo publico en GitHub y el link abre.
- [ ] El banner amarillo ya **no** dice "Demo local. Ningun mensaje sale de este navegador".
      En cuanto hay keys eso es falso: el relato viaja a dos APIs fuera del Peru.
- [ ] El saludo `m1` ya **no** dice "guardo el registro por usted". El Libro es responsabilidad
      del director (Ley 29719 art. 11,
      https://www2.congreso.gob.pe/sicr/cendocbib/con4_uibd.nsf/36F4D51A64BB8728052579F90061B160/$FILE/1_LEY_29719.pdf).
- [ ] `RESPUESTA_ECO` ya **no** dice "cuando el equipo conecte el agente".

### Corte 15:40, la sala

- [ ] Alguien camino al **fondo de la sala** y leyo la transcripcion en voz alta sin dudar una
      palabra. Si dudo: subir la transcripcion de `#4a5a62` 14 px a `#111b21` 15 o 16 px.
- [ ] DevTools a 1280x800 con el zoom del proyector: burbuja + tarjeta + chip entran **en una
      sola pantalla**. Nadie midio el ALTO y es la dimension que se acaba.
- [ ] Con el HDMI y el dock conectados como van a estar: Ajustes, Sonido, Entrada, el microfono
      seleccionado es el interno y la barra de nivel se mueve al hablar. `getUserMedia` no falla
      si el sistema movio la entrada: entrega un stream en silencio.
- [ ] Permiso de microfono concedido y zoom fijado en **los dos origenes**, produccion y
      `localhost:3000`, con el mismo perfil de Chrome. Nada de incognito: resetea permiso y
      borra `localStorage`.
- [ ] Modo Concentracion encendido. Protector de pantalla y apagado de pantalla en Nunca.
      WhatsApp de escritorio, Slack y correo cerrados. Solo las dos pestanas de la demo.

### Corte 16:30, el Plan B

- [ ] `.env.local` tiene `OPENED_MOCK_MODE=true` y el dev server corrio con esa variable.
      Hoy `.env.local` tiene las dos keys reales y **ninguna** linea de mock, o sea que
      `npm run dev` intenta salir a la red igual que produccion.
- [ ] Con la **wifi apagada**, el guion completo corre en la pestana de localhost: texto,
      audio, tarjeta, cuaderno. Sin una pantalla en blanco.
- [ ] `TRANSCRIPCION_MOCK` coincide **palabra por palabra** con lo que dira Carmen.
- [ ] La pestana de produccion ya trae la conversacion completa corrida una vez, con su audio
      real, y **se deja abierta**. Si el microfono muere en escena, se cambia de pestana y se
      narra lo que ya esta ahi.
- [ ] Zoom anotado en un post-it pegado al laptop. Los **dos** niveles, uno por origen.

### Corte 17:00, congelamiento

- [ ] `npm run build` verde, `npx tsc --noEmit` limpio, `npm run check` pasa.
- [ ] Deploy a produccion hecho y push a GitHub hecho.
- [ ] Un `grep` sobre `lib/cuaderno.ts` no encuentra un solo nombre propio de menor ni el
      nombre de ningun colegio.
- [ ] Cada fila de `lib/norma.ts` tiene veredicto con inicial. **Lo que no se confirmo pierde
      el digito y se queda con la ruta sola.**
- [ ] Existe una lista escrita de lo que quedo por contrastar, para decirlo en el cierre.

## 8. Riesgos que quedan vivos, con dueno

| Riesgo | Dueno | Mitigacion |
|---|---|---|
| El `tool_choice` forzado devuelve `tool_use` y **ningun** bloque de texto, y `lib/claude.ts:64` hace `.find(b => b.type === "text")` y lanza | quadrant | La prosa va **dentro** del schema como `bloque_1` y `bloque_2`. Nunca se espera un bloque de texto |
| `stop_reason: "refusal"` llega con **HTTP 200** y sin excepcion, y este dominio es donde pasa | quadrant | Un solo guard: si `stop_reason` no es `end_turn` ni `tool_use`, cae al fixture. Cubre tambien `max_tokens` |
| `Promise.race` no cancela a la perdedora: el fixture gana a los 6 s, Claude llega a los 9, y la burbuja se reescribe o se duplica delante del jurado | quadrant | Bandera `resuelto` o `AbortController`. Quien llega segundo se descarta |
| `/api/transcribir` falla y `page.tsx:99` solo llama a `responder()` en el camino feliz: el chat queda muerto con una barra roja | quadrant | Llamar a `responder()` tambien en el `catch` y en la rama `!respuesta.ok` |
| La semilla lleva iniciales de alumnos reales | docentes | Los patrones son reales, los alumnos no. Iniciales inventadas, un 4to B generico, sin nombre de colegio |
| Cero docentes fuera del equipo han usado esto | Mariale | Los 25 minutos de validacion externa del carril B. Se necesitan 3 respuestas literales |
| Los digitos del Anexo 03 salen de un OCR | Mariale | `rm383-anexo03.pdf` esta en esta carpeta. Se abre y se lee. Lo que no se confirma, pierde el digito |

## 9. El indicador de impacto, uno solo

**Reuniones con padres que llegan con una hoja de datos en vez de una queja.** Linea base
hoy: cero. Es el unico que va en el lienzo.

---

Archivos hermanos: `MINEDU-CONTEXT.md` (norma), `CONTENCION.md` (voz y seguridad, con el system
prompt), `DATOS-Y-REPORTES.md` (esquema y privacidad), `DEMO-GUION.md` (runbook de escenario),
`PITCH.md` (guion), `EQUIPO-HOY.md` (quien hace que).
