# OpenTeacher, el puente con las familias

Diseño aprobado el 29 ago 2026, después del hackathon AIdea.
Estado: aprobado en conversación, pendiente de plan de implementación.

---

## 1. Qué se construye y por qué

Hoy OpenTeacher es de una sola cara: la docente cuenta lo que pasó en el aula, el
agente la contiene, nombra la ruta normativa y deja la incidencia registrada.

El siguiente paso es la segunda cara: **el apoderado tiene su propio chat privado**,
y el producto pasa a ser el puente entre la familia y el colegio.

El riesgo de fondo, y la razón de casi todas las decisiones de abajo: el problema
fundacional que levantó Jenny en la ideación era la **sobrecarga de la docente**. Un
canal de padres puede empeorarlo en vez de aliviarlo si los mensajes aterrizan en la
bandeja de la maestra. Todo el diseño está orientado a que el puente **descargue** a
la docente y no le sume trabajo.

---

## 2. Decisiones tomadas

Cuatro decisiones de Sebastian, cerradas. No se rediscuten sin él.

| # | Decisión | Consecuencia |
|---|---|---|
| 1 | **El apoderado habla con el agente**, que responde solo | La docente no recibe ni un mensaje más. El puente descarga, no carga |
| 2 | **Todo lo del registro llega al padre**, sin aprobación previa de la docente | Obliga a que exista una **proyección**: el padre no ve el registro, ve una vista del registro |
| 3 | **El caso de agresión a la docente sí se le cuenta al padre**, con la ruta del numeral 4.3 | Convierte el peor momento en un procedimiento. Es el caso que da sentido al producto |
| 4 | **Identidad por teléfono** contra la nómina del colegio | El colegio verifica el parentesco, nosotros no. Es una virtud, no una carencia |

Y una quinta, de alcance:

| 5 | **Sin verificación de posesión por ahora**, marcado como prototipo | Se construye la conversación y la proyección; no se pone delante de datos reales |

---

## 3. Lo que ya juega a favor

El registro **ya está escrito en registro apto para un padre**, por decisiones que se
tomaron el día del hackathon y que ahora se cobran solas:

- `Incidencia.descripcion` está especificada como *"conducta observable en tercera
  persona. Nunca un rasgo de carácter"*.
- Los alumnos existen solo como `iniciales` inventadas. Nunca un nombre.
- `Incidencia.alumnoId` referencia la nómina; la nómina es la única clave de
  reidentificación y vive en la IE.

Por eso la decisión 2 es mucho menos expuesta de lo que suena: el registro nunca se
escribió en la voz cruda de la docente.

**Excepción a vigilar:** la captura ambiental del aula (`/aula`) sí guarda citas
textuales con marca de minuto. Esas **no** entran nunca en la proyección del padre.

---

## 4. Modelo de datos

### 4.1 Nómina

```ts
export interface Apoderado {
  id: string;
  alumnoId: string;
  telefono: string;      // E.164. La identidad.
  nombre: string;        // Del adulto. Los menores siguen siendo iniciales.
  relacion: "madre" | "padre" | "apoderado";
}
```

`Alumno` gana `apoderados: string[]`. Varios apoderados por alumno: las familias
separadas son la norma, no la excepción.

### 4.2 La contraparte, el hueco que abre esta feature

`Incidencia` tiene hoy **un solo** `alumnoId`. Un incidente entre dos estudiantes
involucra a dos, y el segundo no está registrado. Sin él no se puede responder bien
ni proteger a nadie.

```ts
contraparteId?: string;   // El otro alumno, cuando lo hay. Anulable.
```

### 4.3 La proyección

El corazón de la feature. Función **pura**, con su propio check, igual que
`lib/norma.ts`.

```ts
proyectar(incidencia: Incidencia, alumnoId: string): VistaApoderado | null
```

Devuelve `null` cuando la respuesta correcta es "nada". Reglas:

- El hijo propio, completo.
- La contraparte, **solo iniciales**. Nunca más. Principio 3.8 del Anexo 03: los
  documentos dirigidos a terceros llevan solo iniciales. **Un apoderado es un tercero
  respecto de otro niño.** Es cumplimiento citable, no criterio nuestro.
- `agredido: "docente"` se informa como hecho, más la ruta del 4.3.
- Nunca citas textuales de la captura ambiental.

---

## 5. Entrada del apoderado

1. Escribe su teléfono. Se normaliza a E.164: en Perú se teclea de seis formas.
2. Se busca contra `Apoderado.telefono`.
3. **Sin coincidencia:** salida amable, no un portazo. *"Ese número no figura como
   apoderado en el aula. Habla con dirección para que lo registren."* Lo arregla el
   colegio, que es quien tiene la nómina.
4. **Con coincidencia:** entra. Si tiene más de un hijo en el colegio, elige cuál.

### 5.1 El hueco conocido, y cómo se acota

Un teléfono escrito en un formulario **no prueba posesión**. Quien conozca el número
de un apoderado podría leer el registro de ese niño. En WhatsApp el problema no
existe, porque el mensaje llega **desde** el número.

Decisión 5: se acepta el hueco por ahora y se marca como prototipo. Para que
"prototipo" sea una restricción y no una intención:

- La ruta del apoderado exige `DATOS_DE_EJEMPLO=true`. Sin esa variable, no responde.
- Un check falla si la nómina contiene algo con forma de teléfono peruano real.
- Aviso visible y permanente en la interfaz del apoderado.

Cuando esto vaya a ver datos reales, la puerta se cierra con un código por SMS o
moviendo a los padres a WhatsApp, donde el canal prueba la posesión.

---

## 6. Qué dice el agente

Voz distinta a la de la docente. Con la maestra es una colega que la sostiene en su
peor momento; con el apoderado es serena e institucional sin ser fría. Más cerca de
un buen tutor que de un amigo o de un trámite.

**Los cuatro casos:**

1. **No pasó nada** (la mayoría de los días). *"Esta semana no hay incidencias
   registradas de M. Q. R."* Aburrido a propósito: si el canal solo habla para dar
   malas noticias, el padre aprende a temerlo y deja de abrirlo.
2. **Con otro estudiante.** La contraparte solo por iniciales.
3. **Con la docente** (caso Carmen). El hecho sin adjetivos, y la ruta del 4.3:
   citación con compromisos, evitando expresamente la conciliación.
4. **Su hijo fue el agredido.** El hecho, qué hizo el colegio, y la derivación que
   nombra el protocolo.

**Dos prohibiciones duras, con check:**

- Un apoderado **jamás** recibe la identidad de otro niño más allá de iniciales.
- El agente **no especula** sobre carácter, motivos ni diagnóstico. Reporta conducta
  registrada y ruta. Hereda la restricción que ya tiene `descripcion`, igual que hoy
  hereda la prohibición de escribir dígitos de norma.

---

## 7. Fuera de alcance

- WhatsApp real. El canal se decide después; con la proyección hecha es un cambio de
  enchufe, no una reescritura.
- Consola del colegio, carga de nómina por CSV, gestión de casos por dirección.
- Que el apoderado escriba a la docente, o que la docente reciba algo del apoderado.
  Rompería la decisión 1.
- Notificaciones push o SMS salientes.
- Cualquier dato real de un menor.

---

## 8. Cómo se verifica

Al estilo de la casa: checks ejecutables, no buenas intenciones.

- `lib/proyeccion.check.ts` en `npm run check`. Que falle de verdad: probarlo metiendo
  la identidad de la contraparte en una vista y comprobar que muere.
- Un caso por cada uno de los cuatro escenarios.
- Un caso adversarial: apoderado de A pidiendo información de B, explícitamente y de
  formas indirectas.
- Check de que la nómina de ejemplo no contiene teléfonos con forma real.
- Suites contra la API real, no contra el texto del prompt. Lo del hackathon: un
  prompt puede verse correcto en el código y equivocarse en pantalla.

---

## 9. Preguntas abiertas

Ninguna bloquea la implementación: cada una lleva un default con el que se puede
construir. Si Sebastian decide otra cosa, se cambia sin rehacer nada.

- **Histórico.** ¿Qué ve el apoderado de las incidencias anteriores a que se registre
  su teléfono? *Default: todo el histórico del alumno.* El registro es del alumno, no
  de la fecha de alta del adulto.
- **Borrado.** ¿Puede pedir que le borren datos? *Default: no se borra desde el chat.*
  El Libro de Registro de Incidencias es obligación del colegio, así que un borrado a
  pedido del apoderado entraría en conflicto con la norma. Se deriva a dirección.
- **Varios hijos.** ¿Dos chats o uno con selector? *Default: un chat con selector de
  hijo.* Menos superficie y menos estado que mantener.
