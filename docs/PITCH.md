# PITCH, OpenEd

Guion de sala. La coreografia de los tres minutos vive en `DEMO-GUION.md`; aca vive **lo que se
dice, por que, y que se contesta cuando pregunten**.

---

## 1. La frase, si solo se puede decir una

> El Peru tiene siete protocolos para proteger al estudiante. Cuando la agredida es la
> profesora, no hay ninguno. OpenEd es el colega que la contiene a ella, le dice que hacer
> antes de que sea tarde, y le deja la hoja que se lleva el viernes a la reunion con el padre.

## 2. Cronometro

| Tramo | Quien | Que |
|---|---|---|
| 0:00 - 0:45 | Carmen | Un dia concreto, en primera persona, sin leer |
| 0:45 - 1:00 | Sebastian | El dato y la transicion |
| 1:00 - 1:50 | Carmen + Sebastian | Caso con protocolo. Audio en vivo, dos burbujas, tarjeta, chip |
| 1:50 - 2:20 | Carmen + Sebastian | Caso sin protocolo: la agredida es ella |
| 2:20 - 2:45 | Sebastian | El cuaderno y la hoja |
| 2:45 - 3:00 | Sebastian | Indicador y la objecion del simulador, dicha por nosotros |

Texto exacto de cada tramo: `DEMO-GUION.md` §3.

**Regla que gano el segundo puesto en YachAI y que aca se repite: la usuaria real abre el
pitch.** No es un adorno. Segun las notas del propio equipo, el segundo puesto de mayo lo gano
la persona del equipo que vivia el problema, mas el guion y los formatos, no la arquitectura.

---

## 3. LA RESPUESTA AL SIMULADOR

Se dice **temprano**, en el cierre o en la primera pregunta, y **la decimos nosotros primero**.
Si la dice el jurado, ya perdimos el tramo.

> "Correcto, y se los digo yo antes de que lo pregunten: el lienzo dice numero propio y ustedes
> estan viendo una pagina web.
>
> El endpoint de WhatsApp esta escrito y el handshake de verificacion de Meta esta hecho y
> probado. Esta en el repo, en app barra api barra whatsapp. Abranlo ahora mismo desde el link
> de GitHub. Lo que falta ahi no es codigo: es un tramite de verificacion de numero que no
> depende de nosotros.
>
> Teniamos un dia. Ese dia alcanzaba para el tramite o para lo que acaban de ver. Y les voy a
> ser honesto: nos convino. En el numero de prueba de Meta hay que dar de alta cada destinatario
> uno por uno, con un codigo que le llega a su celular. Ustedes no habrian estado en esa lista.
> Estarian mirando mi telefono desde su asiento. Con esto, el link esta arriba y lo abren desde
> su propio celular ahorita.
>
> El canal se resuelve en una tarde. Lo que no se resuelve en una tarde es que el agente sepa
> donde **termina** la norma peruana, y que la profesora salga de la conversacion con la hoja
> que se lleva el viernes. Ahi gastamos el dia."

**Dos advertencias de honestidad para quien la diga:**

1. **No cites un numero de destinatarios.** El flujo de dar de alta cada numero con un codigo si
   esta documentado por Meta; el tope exacto de 5 sale de fuentes secundarias y no esta
   confirmado en fuente primaria. "Hay que dar de alta cada destinatario uno por uno, con un
   codigo" es igual de fuerte y es verdad.
2. **Solo di "abranlo desde su celular" si produccion dejo de estar en modo mock**, o sea si el
   `curl` del carril A devolvio 400. Si sigue en mock, la frase se cambia por "el link esta
   arriba" y punto. Nunca invites a tocar un sistema que no verificaste en vivo diez minutos
   antes.

---

## 4. LA RESPUESTA A PRIVACIDAD DE DATOS DE MENORES

Es la pregunta mas probable en una sala con docentes. Tres frases y una URL.

> "Los menores nunca salen por nombre. Iniciales. Y eso no lo inventamos: el propio Formato 1
> del MINEDU registra al estudiante agredido y al presunto agresor por iniciales, y al
> informante adulto con nombre y DNI. Adultos identificados, menores seudonimizados, es el
> diseno de la norma.
>
> La Ley 29733 nombra la figura en su articulo 2.15: procedimiento de disociacion, y dice
> textual que es reversible. El articulo 14.8 exime de consentimiento cuando se aplico. El
> Peru admite algo que el reglamento europeo no.
>
> En el codigo son dos tablas separadas desde el primer commit: la nomina, que vive en el
> colegio, y las incidencias, que **nunca** guardan un nombre. El nombre se reinyecta al pintar
> la hoja, en la maquina de la profesora."

**Y si insisten, lo que hay que decir y no esconder:**

> "Dos cosas honestas. Una: la llamada al modelo sale del Peru, y eso es flujo transfronterizo.
> Hoy el mensaje sale tal cual, no disociado, y por eso el banner de la pantalla ya no dice que
> nada sale del navegador. Dos: ningun abogado peruano de proteccion de datos reviso esto. Para
> produccion hace falta, y ese es el primer cheque que firmariamos."

Fuentes por si las piden:
Ley 29733 https://www.smv.gob.pe/Uploads/Ley_29733_vigente_2025.pdf ·
DS 016-2024-JUS https://img.lpderecho.pe/wp-content/uploads/2024/11/Decreto-Supremo-016-2024-JUS-LPDerecho.pdf ·
retencion de Anthropic https://platform.claude.com/docs/en/manage-claude/api-and-data-retention ·
retencion de OpenAI https://developers.openai.com/api/docs/guides/your-data

**No decir nunca:** "esta encriptado", "no guardamos nada", "es anonimo". Ninguna de las tres es
verdad.

---

## 5. LA RESPUESTA A "ESTO ES UN PROMPT SOBRE CHATGPT"

Aca no se argumenta. **Se senala la pantalla.**

> "Esa tarjeta es la diferencia. El modelo tiene **prohibido** escribir un numero: ni un
> protocolo, ni un plazo, ni un articulo, ni un telefono. Si lo escribe, el test del repo se
> pone rojo. El modelo extrae hechos con enums cerrados, y la ruta la deriva una tabla de la
> Resolucion Ministerial 383 del 2025 con su fuente y su sello de verificacion.
>
> Ahi abajo pueden verlo (senala): el modelo extrajo fisica, patio, lesion no indicada. El
> protocolo lo puso el codigo, no el modelo.
>
> Y hagan la prueba al reves: peguenle esta misma frase a ChatGPT ahorita. Les va a citar los
> protocolos del 2018, o los del 2020, porque eso es lo que hay en internet. El Anexo 03
> cambio en setiembre pasado. Nosotros no le pedimos al modelo que se acuerde: le prohibimos
> acordarse."

**Preparar antes del pitch, es un minuto:** una foto en el celular de ChatGPT contestando la
frase exacta de Carmen. **La comparacion se ve; la afirmacion se discute.**

---

## 6. Otras preguntas, con respuesta corta

**"Cuantas docentes que no son ustedes lo han usado?"**
> "Cuatro de nosotras somos docentes de aula y escribimos el contenido, o sea que somos autoras,
> no muestra. Hoy le mandamos la tarjeta y la hoja a colegas de otros colegios y nos
> respondieron esto (leer una literal)." **Si no llegaron respuestas: "cero fuera del equipo, y
> es lo primero que haciamos manana."** No inflar.

**"Quien paga esto en septiembre?"**
> "El costo real es el modelo, y es de centavos por conversacion. Lo medimos hoy con el campo
> de uso que devuelve la propia API (dar el numero medido). El canal, cuando entre WhatsApp, no
> cobra los mensajes que la docente inicia. Quien firma es la UGEL o el colegio, y el que compra
> no compra un chat: compra que las reuniones con padres dejen de ser una queja contra otra
> queja."
> **PROVISIONAL: no cites precios de lista al jurado. Cita el numero que midieron ustedes hoy.**

**"Y el MINEDU ya no tiene algo asi?"**
> "Si, Educacion Te Escucha, y lo conocemos. Lo que publica para docentes es grupal, virtual y
> en horario de oficina. Esto es individual y a la hora en que pasa la cosa, que suele ser
> 11:40 de la manana con treinta chicos mirando."

**"Y si una docente le escribe a las dos de la manana que ya no quiere estar aca?"**
> "El agente para, lo dice, y deriva a la Linea 113 opcion 5, que es MINSA, gratis y anonima.
> Y voy a ser honesto: nadie con licencia clinica reviso este guion. Por eso el agente **corta
> y deriva** en vez de tratar, y por eso esa rama no se la mostramos en la demo."

**"Esos casos del cuaderno son reales?"**
> "Los patrones son reales, los alumnos no. Las iniciales son inventadas y no hay nombre de
> ningun colegio. El hallazgo esta en la concentracion horaria, no en que los chicos existan."

**"Por que no reportan directo al SiseVe?"**
> "Porque no nos corresponde. El Libro lo firma el director y el SiseVe lo registra el
> responsable de convivencia. Si nosotros lo automatizaramos, la profesora creeria que ya
> cumplio, y no cumplio. Saber que no construir es la mitad del producto."

---

## 7. Los criterios del jurado y donde los tocamos

**PROVISIONAL: estas cinco dimensiones estan transcritas de una nota del propio equipo de una
edicion anterior de AIdea. No encontre ningun documento oficial con la rubrica ni con las
ponderaciones, ni confirme que la edicion de hoy use las mismas.**

| # | Dimension | Donde la tocamos |
|---|---|---|
| 1 | Pertinencia del problema | Carmen, 0:00 a 0:45, en primera persona. Mas la ENDO 2021 |
| 2 | Efectividad e impacto | El caso 2: hay un hueco verificable en la norma y lo llenamos |
| 3 | Prototipo funcional y claro | Se graba en vivo, se ve responder, se abre la hoja. El link esta arriba |
| 4 | Uso estrategico de IA | La tarjeta. El modelo tiene prohibido escribir el numero, y se ve |
| 5 | Creatividad e innovacion | Imitar al **auxiliar**, que en primaria de EBR no existe, en vez de imitar a un psicologo |

## 8. Reglas de sala

1. **Nadie se disculpa.** Nunca. Ni "perdon que tarde", ni "normalmente funciona".
2. **Sebastian no mira la pantalla mientras narra.** Mira al jurado.
3. **Carmen no lee.** Sus primeros 25 segundos van de memoria.
4. **Si un jurado corrige un digito de la tarjeta, no se discute.** "Puede ser, ese lo teniamos
   como por contrastar y lo dice la propia tarjeta. Lo que si esta verificado es la ruta."
5. **Una sola persona responde cada pregunta.** Nada de completarse entre dos.
6. **El caso 2 nunca se corta por tiempo.** Es el que prueba la tesis. Si hay que sacrificar
   algo, se sacrifica el resumen de aula.

## 9. Lo que NO se dice, pase lo que pase

- Ningun numero de telefono del SiseVe. Hay dos versiones en dos fuentes oficiales.
- Ninguna cifra de precio de API.
- Ningun numero de destinatarios del numero de prueba de Meta.
- Las cifras de efecto del estudio de Cook 2018 que circulan en blogs. No estan en el resumen.
- Ninguna cifra de prevalencia de violencia de estudiantes contra docentes en el Peru.
  **No existe.** Si preguntan: "no hay dato publico, porque el SiseVe no registra ese caso. Ese
  es parte del problema."
- "Esta encriptado", "no guardamos nada", "es anonimo".
- Que el reporte de OpenEd sea un registro oficial, o que reemplace al Libro o al SiseVe.
- Cualquier cita textual de la RM 383-2025 que una persona del equipo no haya confirmado a mano
  antes de las 17:00.
