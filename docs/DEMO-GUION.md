# Pre-vuelo de la laptop

La demo corre **desde la laptop**, no desde Vercel.

## Arranque, en este orden

```bash
npm run demo        # puerto 3100, agente REAL. Construye y levanta.
npm run demo:mock   # puerto 3101, simulado. REUSA el build de arriba, no reconstruye.
```

**El servidor de desarrollo va APAGADO.** Nunca `npm run dev` en escena: pinta el overlay de Build Error encima de la página, y eso en un proyector es el peor final posible.

Los dos servidores conviven: mismo build, puertos distintos. Verificado: 3100 responde con el agente real y 3101 responde simulado, al mismo tiempo.

## Antes de subir

- **Dos pestañas precalentadas**, una por puerto, con un mensaje real enviado en cada una. Así la primera respuesta del escenario no carga en frío.
- Navegador a **pantalla completa**, sin barra de URL ni de marcadores.
- **Notificaciones del sistema silenciadas** y suspensión de pantalla desactivada.

## Si algo falla

Cambiar a la pestaña de 3101 y seguir. **Sin anunciarlo.** La historia es la misma en las dos: el caso de la docente agredida, con la misma tarjeta normativa. El jurado no tiene por qué notar el cambio.

Por qué los dos servidores y no una variable: el modo simulado se lee al arrancar el proceso, así que cambiarlo en caliente obliga a matar y relevantar el servidor. Treinta segundos de pantalla muerta en un pitch de tres minutos es el pitch.

---

# DEMO-GUION, runbook de escenario

Sin numero real de WhatsApp, **este es el archivo mas importante del dia**. Si algo de aca no
se ensayo, no existe.

Regla de sala, una sola: **nadie se disculpa durante la demo.** Si algo tarda, se sigue
hablando. Si algo revienta, se pasa a la pestana ya cargada y se sigue. Cero "esperen un
segundito".

---

## 1. Que hay en pantalla

**El simulador de telefono solo, a pantalla completa, la columna de 440 px centrada, los tres
minutos enteros.** Nada de pantalla dividida con un dashboard. Nada de pestanas alternadas.

El cuaderno **no** es otra ruta: es una burbuja tipo documento **dentro del chat** ("Cuaderno de
aula 4to B") que abre a pantalla completa como un adjunto de WhatsApp, y cierra de vuelta al
chat.

Cuatro razones, y las cuatro importan:

1. **Aritmetica de proyector.** La columna es de 440 px por construccion y la paleta WhatsApp
   esta clavada a proposito para sobrevivir un proyector. Si la partes, cada mitad se queda con
   la mitad del ancho, y para mantener el mismo tamano fisico de letra hay que bajar el zoom a
   la mitad. A cinco metros lo primero que se vuelve ilegible es justo lo unico que el jurado
   **tiene** que leer: la transcripcion de lo que Carmen acaba de decir en voz alta.
2. **Un solo punto focal.** En tres minutos el narrador dirige la atencion senalando una cosa.
   Una pantalla dividida obliga al jurado a elegir, y en el beat de contencion elige la mitad
   equivocada.
3. **La ilusion es el argumento.** Toda nuestra respuesta a "prometieron WhatsApp" es *el canal
   no es el producto*. Un dashboard pegado al costado concede que esto es una web app con un
   widget de chat. Un adjunto que abre desde adentro dice que esto es lo que el agente le
   entrega a la docente en el canal donde ella vive.
4. **Cero riesgo de ruteo.** Sin cambio de ruta, sin barra de URL en el proyector, sin arranque
   en frio a mitad de la demo.

## 2. Quien hace que

| Rol | Quien | Que hace exactamente |
|---|---|---|
| Abre | **Carmen** | Los primeros 45 segundos, en primera persona, **sin leer**. Mira al jurado, no a la pantalla |
| Narra | **Sebastian** | Conduce del segundo 45 al final. **No mira la pantalla mientras narra**, mira al jurado |
| Maneja | **Nicolas** | El laptop. No habla. Graba nada, solo hace clic donde toca |
| Voz | **Carmen** | Ella graba la nota de voz en vivo. Es su caso |
| Cronometro | **Mariale** | Cuenta hacia atras con los dedos desde 0:30 restantes |
| Preguntas | **Sebastian y Mariale** | Sebastian lo tecnico y el modelo. Mariale lo pedagogico y lo normativo. Carmen responde cualquier cosa sobre el aula |

## 3. Los tres minutos, palabra por palabra

Los tiempos son objetivos, no adornos. Si a los 2:00 no arranco el cuaderno, se salta el
resumen de aula y se va directo a la hoja.

---

### 0:00 a 0:45 CARMEN, sin leer, sin pantalla

> **Carmen escribe sus propias 45 segundos hoy, con Mariale.** Lo de abajo es el andamio, no
> el texto. El texto tiene que sonar a ella o el beat mas fuerte del pitch se vuelve el mas
> debil. Estructura obligatoria, cuatro frases:
>
> 1. Un dia concreto, con hora. No "a veces pasa".
> 2. Que hizo un alumno. Conducta, no juicio.
> 3. **Que le paso a ella en el cuerpo y en la cabeza**, y que hizo despues. Esta es la frase
>    que nadie mas puede decir.
> 4. A quien pudo pedirle ayuda. La respuesta es a nadie, o a una colega en el pasillo.
>
> Cierra con una linea del tipo: *"Yo puedo manejar al chico. Lo que nadie me ensena es como
> vuelvo yo al aula en la siguiente hora."*

**Sebastian NO interrumpe.** Aunque se pase cinco segundos.

---

### 0:45 a 1:00 SEBASTIAN, transicion

> "Lo que acaban de escuchar tiene numero. El 55,8 % de los docentes peruanos reporto estres,
> segun la ENDO 2021 con casi diez mil docentes. Y la ley exige un psicologo por colegio: hay
> uno por cada treinta y seis colegios.
>
> Le hicimos a Carmen la unica pregunta que importaba: si tuvieras a alguien a quien
> escribirle en ese momento, que necesitarias. Esto es lo que construimos hoy."

Nicolas ya tiene la pestana de produccion arriba, con el chat vacio salvo el saludo.

---

### 1:00 a 1:50 DEMO, caso 1: hay protocolo

**Carmen toma el laptop, aprieta el microfono y graba en vivo.** Habla pegada al laptop.
Su texto tiene que ser **exactamente** este, porque `TRANSCRIPCION_MOCK` esta escrito palabra
por palabra igual y es la red de seguridad si el audio falla:

> "Profe, disculpe. Hoy en el recreo dos chicos de cuarto se agarraron a golpes y cuando los
> separe uno me dijo que ya van varias veces. No supe que hacer, los mande a direccion y me
> quede mal el resto del dia."

**PROVISIONAL: este texto es el que hoy esta en el codigo. Si Carmen lo cambia, se cambia
tambien `lib/mockData.ts` antes del congelamiento. Los dos tienen que decir lo mismo.**

Mientras transcribe, **Sebastian habla, no espera en silencio**:

> "Esta grabando desde el navegador. Se transcribe, y ojo, se transcribe fuera del Peru: eso lo
> declaramos, no lo escondemos."

Aparecen **dos burbujas seguidas** con el indicador de escribiendo en medio. Sebastian senala
la primera:

> "Primero la contiene a ella. Ni un tip, ni un protocolo, ni un formulario. A ella.
>
> Y en el mismo mensaje, sin cambiar de tema, la ruta. Porque el articulo 6 de la Ley 29719
> obliga al docente a denunciar de inmediato, y un agente que solo consuela lo deja expuesto."

Aparece **la tarjeta** debajo de la burbuja. Sebastian:

> "Esa tarjeta no la escribio el modelo. El modelo tiene prohibido escribir un numero: ni un
> protocolo, ni un plazo, ni un articulo, ni un telefono. El modelo extrae los hechos, y el
> numero lo pone una tabla del Anexo 03 vigente, la Resolucion Ministerial 383 del 2025, que es
> de setiembre pasado. La mayoria de lo que hay en internet todavia es del 2018."

Y el chip:

> "Y ahi abajo: guardado en el cuaderno. Iniciales, aula, hora. Nunca el nombre completo de un
> menor, igual que el propio formato del MINEDU."

---

### 1:50 a 2:20 DEMO, caso 2: no hay protocolo, y ese es el punto

**Carmen escribe, sin audio** (mas rapido y mas seguro):

> "Y hoy un chico de sexto me empujo a mi cuando le quite el celular."

Sebastian, mientras se pinta:

> "Miren la tarjeta ahora. Dice: esto no va al SiseVe.
>
> Y no es un error nuestro. Los siete protocolos del Peru protegen al **estudiante**. Cuando la
> agredida es la profesora, la norma manda Reglamento Interno, citacion a los padres y
> derivacion del alumno. Nadie la contiene a ella. Eso no lo cubre ningun protocolo peruano.
>
> Ese hueco es el producto."

---

### 2:20 a 2:45 EL CUADERNO

Carmen toca la burbuja **"Cuaderno de aula 4to B"**. Abre a pantalla completa.

> "Seis semanas de lo que ella le fue contando. Siete de ocho situaciones entre once y doce y
> media, la ultima hora antes del refrigerio. Eso no lo vio nadie, porque nadie lo estaba
> contando.
>
> Y esto (abre la hoja) es lo que se lleva el viernes a la reunion con el padre. Los numeros los
> calcula el codigo desde las filas, no el modelo, asi que no hay un solo dato inventado. Y en
> el pie, siempre: esto es insumo, no es registro oficial y no reemplaza al SiseVe. Porque el
> Libro lo firma el director, no nosotros."

---

### 2:45 a 3:00 CIERRE

> "Un indicador, uno solo: reuniones con padres que llegan con una hoja de datos en vez de una
> queja. Hoy son cero.
>
> El link esta arriba y el codigo esta en GitHub. Y antes de que lo pregunten, se los digo yo:
> el lienzo dice numero propio de WhatsApp y ustedes estan viendo una pagina web. Eso lo
> respondo completo en la primera pregunta, si quieren."

**Si el tiempo alcanza, Sebastian mete la respuesta de WhatsApp aca en vez de esperar.** Texto
completo en `PITCH.md` §3.

---

## 4. Orden de pestanas, y nada mas abierto

Antes de subir al escenario, **exactamente** dos pestanas, en este orden, en el perfil de
Chrome de siempre (nunca incognito):

1. **Pestana 1: `https://opened-phi.vercel.app`**, chat en blanco, ya precalentada con **un
   mensaje real enviado y un audio real grabado**, y despues recargada. Precalentar la pagina
   **no** calienta la funcion: hay que haber mandado un mensaje por cada ruta.
2. **Pestana 2: `http://localhost:3000`** con el dev server corriendo con
   `OPENED_MOCK_MODE=true`, con el guion **completo** ya ejecutado una vez (texto, audio,
   tarjeta, cuaderno) y **dejada asi, con la conversacion arriba**. Esa pestana es el Plan B y
   la prueba de que las rutas ya compilaron.

Nada mas. Ni el correo, ni Slack, ni WhatsApp de escritorio, ni el repo, ni este documento.

## 5. Ajustes de proyector y de laptop

Se hacen **con el HDMI ya conectado**, porque conectarlo cambia la resolucion.

- [ ] Modo Concentracion o No molestar encendido.
- [ ] Protector de pantalla y apagado de pantalla en **Nunca**.
- [ ] WhatsApp de escritorio, Slack y correo **cerrados**, no minimizados.
- [ ] Ajustes del Sistema, Sonido, **Entrada**: el microfono seleccionado es el interno del
      laptop y la barra de nivel se mueve al hablar. Al conectar el HDMI o un dock, macOS puede
      mover la entrada por defecto, y `getUserMedia` **no falla**: entrega un stream en
      silencio, el blob es valido, y la transcripcion vuelve vacia.
- [ ] Permiso de microfono **concedido en los dos origenes**, produccion y localhost, en el
      mismo perfil. El permiso es por origen.
- [ ] Zoom fijado en los dos origenes y **los dos niveles anotados en un post-it pegado al
      laptop**. El zoom tambien es por origen.
- [ ] **La prueba del alto:** con el zoom elegido, mandar el mensaje del caso 1 y verificar que
      **burbuja mas tarjeta mas chip entran en una sola pantalla**. Nadie puede scrollear
      mientras narra. Si no entran, se baja el zoom hasta que entren. Se anota **ese** zoom, no
      el que hace la letra mas grande.
- [ ] **La prueba del fondo:** alguien camina al fondo de la sala y lee **la transcripcion** y
      **el pie de la tarjeta** en voz alta. Si duda una sola palabra, ya fallo. Si falla: la
      transcripcion sube de `#4a5a62` 14 px a `#111b21` 15 o 16 px y el pie de la tarjeta a
      14 px minimo. Es CSS, no arquitectura. La hora de la burbuja puede quedarse gris chica
      porque nadie la tiene que leer.

## 6. Plan B, en el orden en que se usa

| Falla | Que se hace, sin decir nada |
|---|---|
| La transcripcion tarda | Sebastian sigue hablando. El cliente tiene un corte de 8 s contra el fixture, asi que igual aparece texto |
| La transcripcion sale mal o vacia | **No se vuelve a grabar.** Se sigue. Si el texto en pantalla no es el de Carmen, Sebastian dice "eso lo dijo ella hace un segundo" y pasa al caso 2, que es escrito |
| El agente no responde o responde raro | El fixture ya salio. Nadie lo nota porque el fixture dice lo mismo que diria el agente |
| Se cayo el wifi | Nicolas cambia a la **pestana 2** (localhost en mock) y Carmen sigue desde donde estaba. Ahi no hay red en ninguna parte |
| Murio el microfono | Nicolas cambia a la **pestana 2**, que **ya trae la conversacion completa con su audio real**. Sebastian narra lo que esta en pantalla |
| Murio el laptop entero | Sebastian narra el cuaderno de memoria. La hoja del alumno esta impresa en papel en el bolsillo de Mariale. **Llevar una copia impresa** |
| Una tarjeta muestra un digito y alguien lo corrige en voz alta | Sebastian: "puede ser, ese lo teniamos como por contrastar y lo dice la propia tarjeta. Lo que si esta verificado es la ruta". Se sigue. **No se discute un numero con un jurado docente** |

**Lo que nunca se hace:** volver a grabar el audio, recargar la pagina, abrir DevTools, mostrar
la terminal, o decir "normalmente funciona".

## 7. El ensayo minimo obligatorio

Si solo alcanza para una cosa, es esta. **Tres corridas seguidas, cronometradas, sin un solo
commit entre ellas.** Empieza a las 17:00, despues del congelamiento.

**Corrida 1, de diagnostico.** Todo el mundo en su puesto. Mariale cronometra y anota donde se
paso. Se permite parar y corregir el guion hablado, **no el codigo**.

**Corrida 2, de verdad.** Sin parar. Si algo falla, se aplica el Plan B en vivo, que es
justamente lo que hay que practicar. Objetivo: por debajo de 3:00.

**Corrida 3, de sala.** Con el proyector encendido y alguien sentado al fondo. Al terminar, esa
persona responde tres preguntas:

1. Leiste la transcripcion sin dudar?
2. Entendiste por que la segunda tarjeta decia algo distinto de la primera?
3. Que se lleva la profesora a la reunion con el padre?

**Si la tercera pregunta no tiene respuesta, el pitch no funciono** y hay que darle diez
segundos mas al cuaderno quitandoselos al caso 1.

**Y una cosa que no es opcional: Carmen dice sus primeros 25 segundos sin leer.** Si los lee
del celular, el beat mas fuerte del pitch se convierte en el mas debil. Por eso su texto se
escribe **primero**, a las 14:56, no al final.

## 8. Antes de subir, la ultima lista

Nicolas la lee en voz alta y Sebastian contesta si o no. Toma 60 segundos.

- [ ] Las dos pestanas abiertas, en orden, precalentadas con un mensaje real cada una.
- [ ] El zoom del post-it aplicado en la pestana 1.
- [ ] Modo Concentracion encendido y pantalla en Nunca.
- [ ] Microfono probado hace menos de diez minutos, desde esta posicion.
- [ ] La hoja del alumno impresa, en el bolsillo de Mariale.
- [ ] Cronometro de Mariale en cero.
- [ ] Nadie hizo un commit desde las 17:00.
