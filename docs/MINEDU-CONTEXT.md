# MINEDU-CONTEXT

Contexto normativo de OpenTeacher. Cada hecho duro lleva URL. Lo no verificado esta al final y
marcado. Fecha de corte: **29 ago 2026**.

Regla de la casa para este archivo: **si un dato no esta aca, el agente no lo dice.**

---

## 1. La pila normativa vigente

| Norma | Que hace |
|---|---|
| **Ley 29719** (25 jun 2011) | Ley antibullying. Crea el **Libro de Registro de Incidencias** (art. 11) y obliga a docentes y auxiliares a **denunciar de inmediato** (art. 6). Reglamento: DS 010-2012-ED. [texto](https://www2.congreso.gob.pe/sicr/cendocbib/con4_uibd.nsf/36F4D51A64BB8728052579F90061B160/$FILE/1_LEY_29719.pdf) |
| **Ley 31902** (18 oct 2023) | Modifica la 29719: un psicologo por IE, videovigilancia. [ficha](https://busquedas.elperuano.pe/dispositivo/NL/2226137-5) |
| **DS 004-2018-MINEDU** (13 may 2018) | Lineamientos de Gestion de la Convivencia Escolar. Marco madre, vigente. [PDF](https://www.minedu.gob.pe/transparencia/2018/pdf/decreto-supremo-lineamientos-para-gestion-de-la-convivencia-escolar.pdf) |
| **RM 383-2025-MINEDU** (2 set 2025, anexo 14 set 2025) | **Anexo 03 vigente: los 7 protocolos.** Reemplaza a la RM 274-2020. [norma](https://www.gob.pe/institucion/minedu/normas-legales/7106134-383-2025-minedu) · [nota MINEDU](https://www.gob.pe/institucion/minedu/noticias/1246057-minedu-actualiza-protocolos-para-atencion-de-casos-de-violencia-en-colegios) |
| **RM 189-2021-MINEDU** | Crea el **Comite de Gestion del Bienestar (CGB)**, que reemplaza al Comite de Tutoria. [ficha](https://busquedas.elperuano.pe/normaslegales/aprueban-el-documento-normativo-denominado-disposiciones-p-resolucion-ministerial-n-189-2021-minedu-1950810-1/) |
| **RVM 126-2023-MINEDU** | Funciones del auxiliar de educacion. [PDF](https://www.minedu.gob.pe/reforma-magisterial/pdf/rvm-126-2023-minedu-situaciones-administrativas-auxiliares.pdf) |

**El ancla del agente es la RM 383-2025-MINEDU, no los protocolos de 2018 ni la RM 274-2020.**
Casi todo lo que circula en internet, y buena parte de la memoria de un LLM, sigue siendo de
2018 o 2020. Si el agente cita el juego viejo, una docente o alguien de UGEL lo desmonta en la
demo.

Escalamiento fuera del sector: **Ley 27337** art. 18 (el director comunica maltrato, acoso,
abuso y violencia sexual), **Ley 30364** art. 15, **Ley 30403** (prohibe todo castigo fisico y
humillante), **Ley 29988**, **art. 407 del Codigo Penal** (omision de denuncia con obligacion
funcional).

---

## 2. Los 7 protocolos del Anexo 03

**Fuente y como la verifique.** El texto de la RM 383-2025 lo lei por OCR (tesseract) de un
PDF escaneado. **Ese PDF esta en esta misma carpeta: `rm383-anexo03.pdf`.** Eso convierte la
tarea de verificacion en algo de 20 minutos: abrir el PDF y mirar las tablas. Los digitos de
abajo salieron de ese OCR y estan **confirmados contra el indice del propio documento**, que
lista los 7 en tres bloques.

Indice textual del documento (pagina 11 del anexo):

> I. Protocolos de violencia escolar entre estudiantes (1 al 4)
> II. Protocolos de violencia escolar del personal de la IE (director, subdirector, docentes y
> personal administrativo) a estudiantes (5 al 6)
> III. Protocolo de violencia contra estudiantes de parte de una persona del entorno familiar o
> comunitario (7)

| # | Titulo, como aparece en el indice | Plazo total | Hito duro que si esta en la tabla |
|---|---|---|---|
| 01 | Violencia fisica y/o psicologica | 30 dias habiles | Libro de Incidencias y SiseVe: **Dia 03**. Cierre: **Dia 30**. No aplica si ambos involucrados son de nivel inicial |
| 02 | Acoso entre estudiantes (bullying y ciberbullying) | 30 dias habiles | Cierre: **Dia 30**. No se presenta en ninos de la primera infancia |
| 03 | Violencia con uso de armas | **20 dias habiles** | El director comunica **a la policia** y eleva **informe a la UGEL hasta las 24 horas** de la intervencion. Cierre: **Dia 20** |
| 04 | Violencia sexual (violacion, tocamientos, actos de connotacion sexual o libidinosos y acoso sexual) entre estudiantes | 30 dias habiles | Denuncia a Comisaria o Fiscalia de Familia o Mixta o Penal: **Dia 01**. Registro: **Dia 01**. Cierre: **Dia 30** |
| 05 | Castigo fisico y humillante de personal de la IE | 30 dias habiles | Via **administrativa**. Si es reiterativo o hay grave afectacion a la vida, el cuerpo o la salud: autoridad competente (PNP, Ministerio Publico o Poder Judicial) **dentro de 24 horas**, ademas de la UGEL. Cierre: **Dia 30** |
| 06 | Violencia sexual de personal de la IE a estudiantes | 30 dias habiles | **Dia 01**. Cierre: **Dia 30** |
| 07 | Violencia contra estudiantes de parte de una persona del entorno familiar o comunitario (fisica, psicologica y sexual) | Cierre **Permanente** | Denuncia **en el dia** de conocido; derivacion al CEM **dentro de 24 h de realizada la denuncia**; seguimiento **bimestral** |

**PROVISIONAL, y esto hay que decirlo tal cual.** El titulo de cada protocolo esta tomado del
indice y es literal. Los plazos totales estan tomados de la cabecera "Plazo de atencion (Dias
habiles: N)" de cada tabla, y los hitos de las filas "Cierre", "Denuncia" y "Derivacion". La
asignacion de cada cabecera a su protocolo **YA NO ES INFERENCIA**: cada tabla del Anexo 03 lleva
impresa su banda `PROTOCOLO 0N` encima, verificado en lectura directa de la imagen,
no lectura de una etiqueta que diga "Protocolo 03" encima de la tabla, porque el OCR no
recupero esas cabeceras salvo la del 07. **Antes de imprimir un digito en pantalla, una persona
abre `rm383-anexo03.pdf` y lo mira.** Las tablas viven entre las paginas 15 y 40 del PDF; la
del arma (20 dias) esta en la pagina 22 y el mapa resumen de tipo de violencia a numero de
protocolo esta en la pagina 42.

**Regla que sale de esto y que ordena el producto:** la tarjeta en pantalla **lidera con la
ruta**, que si esta verificada en fuente primaria, y el numero y el plazo van en segunda linea
con sello. Si Mariale confirma, el sello cae. Si no se confirma, **se borra el digito y la
tarjeta sigue funcionando.** Es peor citar mal que no citar.

**Transversales verificados en el texto:**

- Si el presunto agresor es el **director**, atiende la UGEL.
- El castigo fisico y humillante **no** se constituye en hecho punible por su naturaleza, salvo
  reiteracion o grave afectacion, y ahi si va a autoridad competente en 24 horas.
- Prohibida la **conciliacion** entre agresor y agredido, y prohibida la revictimizacion.
- **No** son violencia: el desacuerdo respetuoso, la correccion firme sin humillacion y el
  malentendido sin insultos. Ahi toca acompanamiento y estrategia de aula, no protocolo.

---

## 3. SiseVe: lo que realmente es

**No** es apoyo al docente. Es el **registro nacional de violencia contra estudiantes** y el
expediente que fiscaliza la UGEL.
Servicio oficial: https://www.gob.pe/62013-reportar-casos-de-violencia-escolar-en-la-plataforma-siseve-del-minedu
Portal: https://siseve.minedu.gob.pe/web/

- **Reporta cualquiera**: victima, testigo o quien tenga conocimiento, previa afiliacion con
  DNI. Para DRE, UGEL e IE la afiliacion es obligatoria; dentro de la IE lo administra el
  **responsable de convivencia** (DS 004-2018, 8.3.4).
- **Cubre** violencia fisica, psicologica y sexual **contra estudiantes**, dentro o fuera de la
  IE, presencial o virtual. El reporte se hace en la IE del agredido.
- **No cubre** la violencia de un estudiante contra un docente. Ese es el hueco del producto.
- Datos publicos: *Boletin SiseVe en cifras*,
  https://repositorio.minedu.gob.pe/handle/20.500.12799/9786. **No hay API publica verificada.
  No asumir integracion tecnica.**

**Telefonos: no se pinta ninguno de SiseVe en pantalla.** gob.pe indica 0800 77090 y el propio
portal muestra 0800-76-888. Son dos numeros distintos para el mismo servicio y no pude
determinar cual opera hoy. Un numero equivocado proyectado en una sala con docentes es un
autogol. **Los unicos telefonos que se pintan son Linea 100 (https://www.gob.pe/479) y Linea
113 opcion 5 (https://www.gob.pe/555).**

Cifra citable: **cerca de 19 600 reportes de violencia escolar en 2024**. **PROVISIONAL:** el
numero exacto varia segun la fecha de corte, aparecen 19 453, 19 642 y 19 684 en medios
distintos. Usar "cerca de 19 600" o no usarla.

---

## 4. Quien es quien

| Figura | Que hace realmente |
|---|---|
| **Director** | Responsable legal de aplicar protocolos, denunciar y reportar. Suyo es el Libro de Incidencias (Ley 29719 art. 11) |
| **Responsable de convivencia** | Nombrado por el director, integra el CGB. **Registra en SiseVe y en el Libro** |
| **CGB** | Director, coordinador de tutoria, responsables de convivencia e inclusion, psicologo si existe, representantes de familias y estudiantes. Decide en colegiado medidas de proteccion y correctivas |
| **Tutor / TOE** | Tutoria individual y grupal, trabajo con familias, deteccion de senales. Orientado al alumno, no al docente. **PROVISIONAL: las funciones las lei en una presentacion resumen de la DRE Puno, no en la RVM 212-2020-MINEDU** |
| **Auxiliar de educacion** | Solo en inicial y secundaria de EBR, y en EBE inicial y primaria. **No existe en primaria de EBR.** Vigila disciplina, **mantiene el cuaderno de incidencias y la ficha de seguimiento**, informa la conducta al director y al CGB |
| **Psicologo escolar** | Exigido por ley, casi inexistente. 2 291 para 82 734 IE publicas en jul 2023 |

---

## 5. El rol que OpenTeacher imita, y el hueco que reclama

**El auxiliar.** Cuaderno de incidencias, ficha por estudiante, insumo para la reunion con
padres, primer manejo de conducta. Es exactamente lo que pidieron Mariale y Nicolas. Lo que el
auxiliar **no** hace, y OpenTeacher tampoco: decidir medidas de proteccion, denunciar por el
docente ni cerrar un caso.

**El punto ciego.** Los 7 protocolos protegen al **estudiante**. Si el agredido es el docente,
la RM 383-2025 (4.3) manda otra ruta: Reglamento Interno, citacion a padres, derivacion del
estudiante, y autoridad competente solo si hay lesiones, amenaza de muerte o arma. **Nadie
contiene al docente ahi.** Ese es el hueco de OpenTeacher, conecta directo con lo que dijeron Carmen
y Silvia, y es lo que hace verdadera la frase del lienzo sobre conocer el sistema educativo
nacional.

**CONFIRMADO** en `rm383-anexo03.pdf` p.13 / folio 10, con sus literales a/b/c, por lectura
directa de la imagen. Se puede citar en voz alta. (Nota historica: antes de
citar el numeral en voz alta. La ruta en si (Reglamento Interno, citacion, derivacion) si esta
clara en el texto.

---

## 6. El competidor estatal

**Educacion Te Escucha**, del MINEDU:
https://www.gob.pe/institucion/minedu/campa%C3%B1as/74910-educacion-te-escucha

No se ignora, se nombra y se acota la diferencia: el soporte del MINEDU a docentes es
**grupal, virtual y en horario de oficina**; OpenTeacher es **individual y a cualquier hora**.
Nombrarlo demuestra que el equipo conoce el sistema; ignorarlo debilita la propuesta.

**PROVISIONAL:** la pagina de gob.pe (ultima actualizacion 5 ago 2026) describe la atencion a
docentes como grupal. El portal anterior Te Escucho Docente ofrecia, segun una nota de la
DRELM, soporte individual. No pude confirmar si hoy existe atencion individual para docentes.
Decir "el soporte a docentes que publica el MINEDU es grupal y en horario de oficina", que es
lo que dice la pagina, y no "no existe soporte individual".

---

## REGLAS DURAS PARA EL SYSTEM PROMPT

Estas son las que se copian a `lib/prompts.ts`. Estan escritas para el agente, no para el
lector.

1. **Nunca cierres solo con contencion si el relato encaja en un protocolo.** Conten primero y
   en el **mismo mensaje** nombra la ruta. El art. 6 de la Ley 29719 obliga al docente a
   denunciar de inmediato y el art. 407 del Codigo Penal tipifica la omision de denuncia con
   obligacion funcional. Un agente que solo consuela expone al docente a responsabilidad penal
   y administrativa. Es el riesgo reputacional numero uno del producto.
2. **Tu no escribes numeros.** Nunca escribas un numero de protocolo, un plazo en dias, un
   numero de articulo, un numero de ley ni un telefono. Eso lo pone la tarjeta, que lo lee de
   una tabla. Tu escribes la ruta en palabras.
3. **Violencia sexual contra un estudiante:** informar al director hoy, denuncia a comisaria o
   fiscalia y registro el mismo dia. Si el presunto agresor es personal de la IE, ademas
   denuncia inmediata y separacion preventiva (Ley 29988).
4. **Arma:** avisar al director y a la policia de inmediato, informe a la UGEL. **Nunca** pidas
   al docente manipular el arma ni acercarse.
5. **Castigo fisico o humillante de personal de la IE:** ruta administrativa, salvo reiteracion
   o afectacion grave, y ahi autoridad competente.
6. **Agresor del entorno familiar o comunitario:** denuncia y derivacion al CEM. Ese caso
   **no** va a SiseVe.
7. **Nunca sugieras conciliar**, arreglar entre las partes, callar hasta tener pruebas, esperar
   a ver si se repite, ni interrogar al estudiante para confirmar.
8. **Nunca prometas confidencialidad absoluta.** El desahogo es privado; el hecho de violencia
   contra un estudiante **debe** salir de la conversacion.
9. **Distingue conflicto de violencia.** Desacuerdo respetuoso, correccion firme sin humillacion
   y malentendido sin insultos **no** activan protocolo. Ahi toca acompanamiento y tactica de
   aula, y decirlo asi.
10. **Si el agredido es el docente**, no hay ruta SiseVe: Reglamento Interno, citacion a padres,
    derivacion del estudiante, y autoridad competente solo si hay lesiones, amenaza de muerte o
    arma. **Ahi conten: es tu terreno.**
11. **No inventes.** Si no esta en tu contexto, dilo y deriva al responsable de convivencia o a
    la UGEL.
12. **No des diagnostico clinico ni psicoterapia ni asesoria legal.** Ante ideacion suicida o
    crisis, deriva (ver `CONTENCION.md` §4).
13. **Tus registros son insumo** para el Libro de Registro de Incidencias y para la reunion con
    la familia. **No son registro oficial y no reemplazan al SiseVe.** Dilo cada vez que
    entregues uno.
14. **Anonimiza.** Iniciales, nunca nombres completos de menores, en todo documento que
    produzcas.
15. **Espanol peruano, breve.** El docente te escribe entre clases.

---

## SIN VERIFICAR

- **La asignacion cabecera a protocolo de los plazos totales.** Ver §2. Es la unica inferencia
  del documento y la mas cara si sale mal.
- **Que la RM 383-2025 derogue expresamente la RM 274-2020.** Lo tome de un resumen secundario.
  Lo que si lei en el texto es que los casos en tramite continuan bajo la RM 274-2020 hasta su
  conclusion.
- **La linea gratuita del SiseVe.** Dos numeros distintos en dos fuentes oficiales. No se pinta
  ninguno.
- **Que el WhatsApp 991 410 000 del SiseVe acepte reportes estructurados** o solo texto libre
  atendido por personas. No se pinta.
- **La existencia de cualquier API, endpoint o dataset abierto del SiseVe.** No verificada.
- **El contenido de la RVM 212-2020-MINEDU** (lineamientos de TOE). Leido en un resumen de la
  DRE Puno. Las funciones de tutor y coordinador son provisionales.
- **El texto del DS 010-2012-ED** (reglamento de la Ley 29719). No leido.
- **Tension no resuelta:** la Ley 29719 art. 6 manda denunciar ante el CONEI, que debe reunirse
  en 2 dias y resolver en 7. El DS 004-2018 y la RM 383-2025 encaminan la atencion por el CGB y
  el responsable de convivencia. El DS 004-2018 no trae clausula derogatoria expresa. **No
  afirmar que el CONEI quedo sin efecto.**
- **El contenido de la Ley 31902** leido en la ficha resumida de El Peruano, no en el texto
  completo.
- **Las cifras de psicologos.** 2 291 es de un informe de prensa basado en pedidos de acceso a
  la informacion; 4 000 es autorreporte del MINEDU sin auditoria.
- **El articulo de la Revista de Neuro-Psiquiatria con los datos de la ENDO 2021** aparece
  fechado 2026 (vol. 89 num. 2) segun la ficha de la revista. No lo lei completo.
- **No existe ningun dato publico verificado sobre prevalencia de violencia de estudiantes
  contra docentes en Peru.** El SiseVe no la registra. No hay numero que citar para el hueco
  que el producto reclama, y hay que decirlo asi si lo preguntan.
- **El Anexo N.° 01 de la RM 383-2025** (ruta frente a conductas sexuales en ninos de nivel
  inicial) existe pero su contenido no esta en este brief.
- **Educacion Te Escucha:** ver §6.
- **Nada de este documento cubre precios, limites de API de WhatsApp ni implementacion tecnica.**
