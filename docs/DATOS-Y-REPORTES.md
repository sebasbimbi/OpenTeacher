# DATOS Y REPORTES

Esquema de la incidencia, taxonomia, privacidad y los reportes. Lo normativo esta verificado
contra fuente primaria. Lo no verificado, al final.

---

## 0. La decision que ordena todo

**El docente es informante, no registrador oficial.** El DS 004-2018-MINEDU asigna el Libro de
Incidencias al director y el SiseVe al responsable de convivencia (8.3.3 y 8.3.4,
https://www.minedu.gob.pe/transparencia/2018/pdf/decreto-supremo-lineamientos-para-gestion-de-la-convivencia-escolar.pdf).

**OpenTeacher nunca reporta al SiseVe ni asienta el Libro.** Produce el borrador para quien si tiene
esa competencia. Saber que no construir es la mitad de la credibilidad, y ademas: si una
docente cree que ya cumplio porque le escribio al bot, el producto le hizo dano.

## 1. Una sola llamada, y la prosa va dentro de la herramienta

**Esta es la decision de arquitectura mas importante del dia y hay que entender por que.**

Una llamada a `claude-opus-5` con `tool_choice` forzado a `registrar_incidencia`. Esa llamada
devuelve la prosa **y** el triage. No hay segunda llamada, no hay `/api/registrar`, no hay
streaming.

Y la prosa va **dentro del schema**, como `bloque_1` y `bloque_2`, no en un bloque de texto
aparte. Razon concreta: cuando fuerzas una herramienta, el modelo suele suprimir el preambulo,
o sea que `response.content` puede no traer **ningun** bloque `type: "text"`. `lib/claude.ts:64`
hace `response.content.find(b => b.type === "text")` y lanza si no hay. El fallo se ve como
"el agente no responde", el instinto es culpar al prompt, y el prompt es lo unico que no esta
roto. Metiendo la prosa en el schema, ese modo de fallo deja de existir y ademas desaparece el
parseo de la linea en blanco.

**PROVISIONAL:** que forzar la herramienta suprima el preambulo con alta frecuencia es
observacion, no garantia. Por eso la solucion es estructural y no un guard.

Tres reglas mas del esquema:

1. **Nada opcional.** El modelo emite todas las claves; la incertidumbre se declara con
   `no_indicado`. El hueco es un dato, no un silencio.
2. **Cita textual obligatoria.** Sin el fragmento literal que lo sustenta no hay registro
   auditable.
3. **El protocolo no lo decide el modelo.** El modelo extrae tipo, actor y agravantes; el
   numero lo deriva una tabla deterministica en `lib/norma.ts`. Una clasificacion juridica
   producida por un LLM no es auditable ni defendible, y el salto del protocolo 01 al 03
   depende de un hecho binario (hubo arma) que el docente muchas veces no menciona. Por eso
   `hubo_arma` tiene enum `si` / `no` / `no_indicado` y la instruccion explicita de **nunca
   inferir**.

### El schema, aplanado a proposito

`strict: true` exige `additionalProperties: false` y `required` completo en **cada** nivel.
Un `anyOf` con `{"type":"null"}` o un `format: "date"` devuelven 400 **antes** de que el modelo
razone, y ese 400 se ve como "el agente no responde". Por eso: solo strings y enums cerrados,
un solo nivel de anidamiento, y el nulo se expresa con `no_indicado` o cadena vacia.

```json
{
  "name": "registrar_incidencia",
  "description": "Responde a la docente y registra lo que conto. Se llama SIEMPRE, en todos los turnos, incluso si el mensaje no describe ninguna incidencia.",
  "input_schema": {
    "type": "object",
    "additionalProperties": false,
    "required": [
      "bloque_1", "bloque_2", "momento",
      "cita_textual", "alumno_mencionado", "descripcion_conductual",
      "hora_declarada", "lugar", "hubo_lesion", "hubo_arma",
      "nivel", "categoria_convivencia", "tipo_violencia",
      "actor_presunto", "agredido", "es_reiterado",
      "estado_emocional_docente", "accion_ya_tomada", "vacio_principal"
    ],
    "properties": {
      "bloque_1": { "type": "string", "description": "Primer mensaje a la docente, 1 a 3 lineas. En caliente esto es contencion y nada mas. Sin numeros de protocolo, plazos, articulos ni telefonos." },
      "bloque_2": { "type": "string", "description": "Segundo mensaje, 1 a 4 lineas: la accion, la ruta en palabras, o UNA pregunta. Cadena vacia si no hace falta." },
      "momento": { "type": "string", "enum": ["en_caliente", "en_frio", "preventivo"] },

      "cita_textual": { "type": "string", "description": "Fragmento LITERAL del mensaje de la docente que sustenta este registro. Nunca parafrasear ni corregir la ortografia. Cadena vacia si el mensaje no describe ningun hecho." },
      "alumno_mencionado": { "type": "string", "description": "Tal cual lo escribio la docente: 'Mateo', 'el de atras', 'M'. NO normalizar, NO completar apellidos, NO inventar. Cadena vacia si no menciono a nadie." },
      "descripcion_conductual": { "type": "string", "description": "Solo conducta observable, en tercera persona. Prohibido: rasgos de caracter, diagnosticos, causas, juicios, y cualquier dato de la familia del alumno." },
      "hora_declarada": { "type": "string", "description": "Expresion horaria literal si la dijo: 'en el recreo', 'ultima hora', '11:40'. Cadena vacia si no dijo nada. NUNCA deducir." },
      "lugar": { "type": "string", "enum": ["aula", "patio_recreo", "pasillo", "fuera_ie", "virtual", "no_indicado"] },
      "hubo_lesion": { "type": "string", "enum": ["si", "no", "no_indicado"], "description": "NUNCA inferir. Solo si la docente lo afirma." },
      "hubo_arma": { "type": "string", "enum": ["si", "no", "no_indicado"], "description": "NUNCA inferir. Un arma cambia el protocolo y el plazo." },

      "nivel": { "type": "string", "enum": ["convivencia", "violencia", "riesgo_urgente", "sin_incidencia"] },
      "categoria_convivencia": { "type": "string", "enum": ["disrupcion_aula", "incumplimiento_acuerdos", "conflicto_entre_pares_sin_agresion", "desregulacion_emocional", "no_aplica"] },
      "tipo_violencia": { "type": "string", "enum": ["fisica", "psicologica", "sexual", "castigo_fisico_humillante", "ninguna"] },
      "actor_presunto": { "type": "string", "enum": ["estudiante", "personal_ie", "familiar_o_entorno", "no_determinado"] },
      "agredido": { "type": "string", "enum": ["estudiante", "docente", "no_determinado"], "description": "Clave. Si la agredida es la docente NO hay ruta de SiseVe." },
      "es_reiterado": { "type": "string", "enum": ["si", "no", "no_indicado"], "description": "Solo si la docente dice que se repite. Separa violencia de acoso." },

      "estado_emocional_docente": { "type": "string", "enum": ["frustracion", "agotamiento", "impotencia", "miedo", "colera", "tristeza", "calma", "no_declarado"], "description": "Solo si lo expresa. Es dato de salud DE LA DOCENTE: nunca aparece en el reporte a la familia." },
      "accion_ya_tomada": { "type": "string", "description": "Que hizo la docente. Cadena vacia si no lo dijo." },
      "vacio_principal": { "type": "string", "enum": ["ninguno", "identidad_alumno", "hora", "lugar", "lesion", "arma", "actor", "que_paso_antes", "hubo_testigos"], "description": "Lo que el agente NO debe adivinar y que mas falta. UNA sola pregunta por turno, y siempre despues de contener." }
    }
  }
}
```

Modelo: `claude-opus-5`, con `output_config: { effort: "low" }`.
**Sin `effort: "low"` el default es `high`**, y con Opus pensando en high desde una funcion
serverless tres parrafos son varios segundos: el `Promise.race` de 6 s gana **siempre** el
fixture y el modelo nunca habla en escena. Ademas los tokens de razonamiento cuentan contra
`max_tokens`, asi que con 4096 y effort high el turno puede cortar en `stop_reason: "max_tokens"`
sin bloque util.
**PROVISIONAL: los IDs de modelo y los precios salen de la skill `claude-api` de este entorno,
no de la pagina de precios en vivo. No cites cifras de precio al jurado.**

## 2. Taxonomia alineada a la RM 383-2025

**El DS 004 y la RM 383 solo tipifican violencia.** Casi nada de lo que reporta un docente lo
es, y meterlo en el mismo cajon fabrica obligaciones legales falsas: registro en SiseVe, Libro,
plazos de 24 horas, para hechos que la norma no alcanza.

**Nivel A, convivencia.** No activa protocolo ni va al SiseVe ni al Libro. Se ancla en las
"medidas correctivas" del DS 010-2012-ED, citado dentro del DS 004. **Es construccion nuestra
sobre un concepto normativo, y hay que decirlo asi.**

**Nivel B, violencia.** Mapeo deterministico a los 7 protocolos del Anexo 03 vigente. Este es
el contenido de `lib/norma.ts`:

| # | actor_presunto | tipo_violencia | agravante | Protocolo |
|---|---|---|---|---|
| 1 | estudiante | fisica o psicologica | ninguno | **01** |
| 2 | estudiante | fisica o psicologica | `es_reiterado = si` | **02** acoso |
| 3 | estudiante | cualquiera | `hubo_arma = si` | **03** armas |
| 4 | estudiante | sexual | | **04** |
| 5 | personal_ie | castigo fisico y humillante | | **05** |
| 6 | personal_ie | sexual | | **06** |
| 7 | familiar_o_entorno | cualquiera | | **07**, y **no** va al SiseVe |

**Orden de evaluacion, que importa:** primero arma, despues sexual, despues reiteracion,
despues el resto. Un arma manda al 03 aunque el hecho tambien sea reiterado.

Dos filas mas, **sin protocolo**, que son las que prueban que el sistema sabe donde termina la
norma:

| # | Condicion | Salida |
|---|---|---|
| 8 | `nivel = convivencia` | Sin protocolo. No va al SiseVe ni al Libro. Acuerdo de aula y tactica |
| 9 | `agredido = docente` | Sin ruta de SiseVe. Reglamento Interno, citacion a la familia, derivacion del estudiante. Autoridad competente solo si hubo lesiones, amenaza de muerte o arma |

**Nivel C, riesgo urgente.** Autolesion o riesgo de vida: fuera de alcance. Entrega los canales
y escala a humano. Ver `CONTENCION.md` §4.

## 3. Identidad sin friccion

"Mateo otra vez" se resuelve contra la **nomina del aula**, 5 filas hoy, no contra un padron.

- **Guardar la forma literal siempre.** Una resolucion errada queda auditable y reversible.
- **Coincidencia unica: resuelve en silencio.** Confirmar cada vez es la friccion que mata el
  producto.
- **Alumno nuevo o ambiguo: nunca bloquea.** `alumno_id = "no_resuelto"`, la incidencia se
  guarda igual y queda en bandeja. Que la contencion dependa del padron es invertir la
  prioridad.
- **Hoy no se construye:** alias aprendidos, fuzzy matching, desambiguacion de dos Mateos.
  Match exacto contra 5 filas. **Ceiling declarado:** con una nomina real de 25 a 35 alumnos
  esto necesita alias; se agrega despues y no cambia el esquema.

## 4. Privacidad, la postura defendible

**Papeles.** La IE es titular del banco de datos; **OpenTeacher es encargado de tratamiento**
(Ley 29733 art. 2.7, https://www.smv.gob.pe/Uploads/Ley_29733_vigente_2025.pdf) y trata por
instruccion de la IE. El docente no es responsable de datos.

**Base legal.** IE publica: art. 14.1, sin consentimiento cuando se recopila para funciones de
entidades publicas en su competencia, y atender violencia escolar es funcion que asigna el
DS 004. IE privada: consentimiento de quien ejerce la patria potestad (DS 016-2024-JUS art.
22.1, https://img.lpderecho.pe/wp-content/uploads/2024/11/Decreto-Supremo-016-2024-JUS-LPDerecho.pdf,
vigente desde el 30 de marzo de 2025).

**Seudonimizacion, y esto es lo fuerte.** La ley nombra la figura: *"Procedimiento de
disociacion: tratamiento de datos personales que impide la identificacion o que no hace
identificable al titular. El procedimiento es reversible"* (art. 2.15). El art. 14.8 exime de
consentimiento cuando se aplico disociacion. **Peru admite la disociacion reversible; el RGPD
no.**

Y no lo inventamos: **el propio MINEDU registra a los menores por iniciales.** Su Formato 1
pide "Iniciales del o de la estudiante" para la supuesta persona agredida y para el presunto
agresor, mientras al informante adulto le pide nombre completo, DNI, direccion y telefono.
**Adultos identificados, menores seudonimizados: es el diseno de la norma, no una idea nuestra.**

**Arquitectura, y esto se paga hoy porque retrofitearlo despues duele:**

- `NOMINA` es la unica clave de reidentificacion. Vive en la IE.
- `INCIDENCIAS` guarda `alumno_id`, **jamas un nombre**.
- El nombre se reinyecta **al renderizar**, en el equipo de la docente. Por eso el toggle
  "mostrar nombre" del cuaderno funciona en el cliente y no pide nada al servidor.

| Rol | Acceso |
|---|---|
| Docente | Sus incidencias, su aula, su capa emocional |
| Padre o madre | **Solo el reporte de su hijo.** El DS 004 lo dice literal del Libro: accesible a los padres, pero "no pueden leer otros casos registrados" |
| Convivencia y direccion | Borradores de nivel B, agregados |
| OpenTeacher | Datos disociados |

**Que no se guarda nunca.** El art. 23.1 del DS 016-2024-JUS prohibe recopilar datos de menores
que revelen informacion de su grupo familiar sin consentimiento de esos titulares: el extractor
**descarta** todo comentario sobre la familia ("la mama no viene", "el papa toma"). Tampoco se
captura el checklist de motivos del Formato 1 (color de piel, orientacion, religion,
discapacidad, pueblo originario): casi todo el es dato sensible del art. 2.5, y lo llena la IE,
no un chatbot.

**Transferencia internacional, y esto se dice antes de que lo pregunten.** La API esta fuera del
Peru: cada llamada es flujo transfronterizo (art. 18). **Y aca hay que ser exactos: hoy el
mensaje sale crudo, no disociado.** El diseno pide texto disociado; el mecanismo del dia manda
el relato tal cual. **No afirmar en el pitch que el texto va disociado.** Lo que si se puede
decir, con URL: la API comercial de Anthropic no entrena con inputs y borra entradas y salidas
dentro de 30 dias
(https://platform.claude.com/docs/en/manage-claude/api-and-data-retention,
https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training),
y la API de OpenAI por defecto no entrena y retiene hasta 30 dias para monitoreo de abuso
(https://developers.openai.com/api/docs/guides/your-data).
**PROVISIONAL: no verifique el detalle por endpoint de `/v1/audio/transcriptions`.**

**Huecos honestos que suman al decirlos:** el Oficial de Datos Personales es obligatorio si el
giro trata datos sensibles (art. 37.1.3); la inscripcion del banco en el Registro Nacional
(art. 42); la Evaluacion de Impacto es facultativa (art. 40.1) pero recomendada tratandose de
ninos y adolescentes.

## 5. Reporte por alumno

**Tono:** conducta observable, nunca rasgo. "Se levanto e interrumpio cuatro veces", no "es
inquieto". Todo con denominador. **Nada que el padre escuche por primera vez aqui.**

**OMITE siempre:** nombres de otros alumnos (siempre "un companero"); el estado emocional de la
docente (es su dato de salud y ademas le entrega un arma al padre); diagnosticos y especulacion
familiar; predicciones ("si sigue asi"); codigos internos y numero de protocolo; conteos sin
denominador. Un reporte sin una sola fortaleza suele estar incompleto: no es que el nino no
tenga ninguna.

**Los numeros los calcula TypeScript desde las filas. La prosa la escriben las docentes.**
En el plan del dia la prosa **no** la escribe el modelo: mata una llamada, un fixture y un modo
de fallo, y suena mejor porque es su voz. Ver `EQUIPO-HOY.md`, tarea B3.

```
REPORTE DE SEGUIMIENTO EN AULA
Estudiante: M. Q. R.  ·  4.° B  ·  Tutora: (nombre de la tutora)
Periodo: 14 de julio al 22 de agosto de 2026 (30 dias de clase)
Fecha: 29 de agosto de 2026

PARA QUE ES ESTE DOCUMENTO
Es un resumen de lo observado en el aula estas seis semanas, para
conversarlo juntos en la reunion. No es una sancion ni un expediente, y
no se comparte con otras familias.

LO QUE OBSERVAMOS
En 30 dias de clase se registraron 8 situaciones:
- En 5, se levanto de su sitio e interrumpio la clase en voz alta.
- En 2, respondio con groserias cuando se le pidio volver a su sitio.
- En 1, hubo un forcejeo con un companero por un cuaderno. No hubo
  lesiones. Ambos fueron atendidos ese mismo dia y el hecho ceso.

7 de las 8 ocurrieron entre las 11:00 y las 12:30, la ultima hora antes
del refrigerio. Ninguna ocurrio en las dos primeras horas.

LO QUE YA HICIMOS EN EL COLEGIO
- Conversacion individual despues de cada situacion.
- Cambio de ubicacion en el aula desde el 10 de agosto.
- Acuerdo de aula revisado con todo el grupo el 12 de agosto.

LO QUE ESTA FUNCIONANDO
Desde el 10 de agosto se le da una responsabilidad concreta al inicio de
la ultima hora. Antes de ese cambio hubo 6 situaciones en 3 semanas;
despues, 2 en 3 semanas. Es una senal temprana, no una conclusion, y por
eso queremos sostenerla.

LO QUE TAMBIEN VEMOS
Se ofrece de voluntario con frecuencia y ayuda a companeros que se
atrasan. En trabajos en grupo participa y sostiene la tarea.

LO QUE LES PEDIMOS
Una sola cosa, concreta: revisar con el la hora a la que se acuesta los
martes y jueves, que son los dias en que llega mas cansado. No pedimos
castigo en casa por lo ocurrido en el aula.

COMO SEGUIMOS
Volvemos a conversar en 4 semanas. Si algo cambia antes, en cualquier
direccion, se les avisa por la agenda.

Este documento es insumo para el Libro de Registro de Incidencias y para
la reunion con la familia. No es un registro oficial y no reemplaza al
SiseVe.
```

**Esa ultima linea va impresa siempre, en el pie, y no se puede desactivar.**

**PROVISIONAL: todos los datos del ejemplo son ilustrativos.** Las fechas, los conteos y el
patron horario los reemplaza la semilla que escriben las docentes.

## 6. Reporte de aula

Base minima: con **n menor a 5, conteos, jamas porcentajes.** Y mas reportes es senal **buena**:
ninguna metrica puede castigar el registro.

**Hoy se construyen dos, no cinco.** Dos bien puestas ganan a cinco a medias.

1. **Concentracion horaria.** Incidentes por hora de clase sobre las veces que esa hora
   ocurrio. Es la unica que da una accion directa: mover la actividad exigente. Barras de divs
   con `width` en porcentaje.
2. **Cobertura del registro.** Dias con reporte sobre dias de clase. Si solo se reporta en los
   dias malos, la data esta sesgada y la primera vale menos. Casi nadie la construye y es lo
   que hace defendible el estudio. Una linea al pie.

**Fuera hoy, y si preguntan se dice que existen y por que no estan:** distribucion de la carga
entre alumnos, intervalo entre incidentes por alumno, y que respuesta funciono.

**Descartadas por vanidosas, y no vuelven:** total de incidentes (sube cuando mejora el
registro, incentivo perverso), ranking de alumnos, "% de mejora" sobre bases chicas, incidentes
por alumno sin denominador.

## 7. Persistencia para hoy

**Ninguna base de datos.** Ni SQLite, ni Postgres, ni Supabase, ni Vercel KV. Son 5 alumnos y
unas 22 filas, y Vercel no tiene disco escribible en serverless.

- `NOMINA` e `INCIDENCIAS` en `lib/cuaderno.ts`, dos arrays separados desde el primer commit.
  **La separacion no es opcional: es la arquitectura de privacidad del §4.**
- Lo que se agrega en la demo va a `localStorage` como delta.
- **El overlay tiene que renderizar igual con `localStorage` vacio.** No probado en incognito,
  y el navegador del escenario puede venir limpio.
- Boton "Reiniciar demo" que borra el delta y deja solo la semilla.

**Crecimiento, si preguntan:** SQLite cuando entre la segunda IE, Postgres cuando entre la
decima, sin cambiar el esquema. Despues cifrado en reposo de la nomina, bitacora de accesos y
exportacion al Formato 1 para que convivencia solo revise y firme.

---

## SIN VERIFICAR

- **Que forzar la herramienta suprima el bloque de texto** con alta frecuencia. Observacion, no
  garantia. La solucion elegida no depende de eso.
- **El art. 3 del DS 004-2018-MINEDU permite actualizar los anexos por Resolucion Ministerial**,
  y de hecho la RM 383-2025 lo hizo. Los Formatos 1 y 2 y el Anexo 06 que cito pueden haber
  cambiado con esa RM. **No verificado.**
- **La afirmacion mas fuerte del documento:** que el art. 14.8 (disociacion exime de
  consentimiento) cubra una seudonimizacion reversible cuya clave conserva el colegio. El texto
  literal es favorable, pero no consulte ninguna resolucion de la ANPD ni jurisprudencia. Es
  lectura de texto plano, no doctrina asentada.
- **Si la ANPD emitio las disposiciones complementarias sobre el procedimiento de disociacion**
  que anuncia el art. 41.3 del DS 016-2024-JUS. Si existen, podrian imponer tecnicas concretas
  que este diseno no cumple.
- **Si Peru emitio resolucion de nivel adecuado de proteccion (art. 19) que cubra a Estados
  Unidos**, y si Anthropic u OpenAI ofrecen clausulas que satisfagan el art. 18.2 para un
  exportador peruano.
- **Donde esta la frontera entre "entidad publica" y un colegio privado** que ejecuta una
  funcion que la ley le impone. Sostengo que la IE privada necesita consentimiento, pero es
  discutible y no lo resolvi.
- **Todo el §4 es analisis de textos legales primarios hecho por un agente, no asesoria legal.**
  Ningun abogado peruano de proteccion de datos reviso una linea. Para produccion hay que
  validarlo con uno, y eso se dice si preguntan.
- **Las metricas del §6 y las reglas de tono del §5 son juicio de diseno.** No hay evidencia
  empirica citable de que mejoren la toma de decisiones docente. Es hipotesis razonada.
- **Los datos del reporte de ejemplo son inventados.**
- **Los IDs de modelo, los precios y los parametros de la API** vienen de la skill `claude-api`
  de este entorno, con cache. No verificados contra la pagina en vivo hoy.
- **El art. 11 de la Ley 29719** lo lei en una copia PDF, no en el texto consolidado oficial, y
  no revise modificaciones posteriores.
- **El rango de 25 a 35 alumnos por aula** es plausible pero no lo contraste contra estadistica
  oficial.
