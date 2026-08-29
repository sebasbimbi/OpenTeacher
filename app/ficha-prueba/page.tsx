/**
 * BANCO DE PRUEBA de FichaNorma. NO es parte de la demo y no se proyecta.
 *
 * Existe porque `app/page.tsx` es del otro carril y no lo toco: sin esto,
 * los tres estados de la tarjeta no se pueden verificar en el DOM ni mirar
 * en un proyector antes de montarlos. `scripts/ficha.test.mjs` corre contra
 * esta ruta.
 *
 * Se puede borrar entero despues del pitch sin tocar nada mas.
 */

import BurbujaCuaderno from "@/components/CuadernoOverlay";
import FichaNorma from "@/components/FichaNorma";
import { NORMA } from "@/lib/norma";

// Un caso por estado. El de la docente agredida va primero a proposito:
// es el que se demuestra en escena.
const CASOS = ["docente_agredido", "protocolo_03", "sin_protocolo"];

/** Lo que dice el agente antes de la tarjeta, para medir la escena completa. */
const CONTENCION_1 = "Profe, respire. Lo que le hizo ese chico no está bien, y que se le haya movido el piso no la hace mala docente: la hace humana.";
const CONTENCION_2 = "Antes de nada: ¿está bien? Si necesita cinco minutos fuera del aula, tómelos. Cuando pueda, le digo qué corresponde hacer.";

export default function Page() {
  return (
    <main className="flex min-h-dvh flex-col items-center bg-[#0b141a]">
      {/*
        LA ESCENA DEL PITCH, a la altura real del chat.
        Aca se mide lo unico que importa a las 17:00: que la burbuja de
        contencion, la tarjeta y el chip entren JUNTOS en una pantalla de
        proyector de 1024x768 sin scroll. Si la tarjeta empuja la burbuja
        fuera de vista, perdemos la mitad emocional del argumento y parecemos
        un buscador de protocolos.
      */}
      <section
        data-escena="demo"
        className="flex h-dvh w-full max-w-[440px] flex-col gap-2 overflow-hidden bg-[var(--wa-fondo)] px-3 py-3"
      >
        <Burbuja>{CONTENCION_1}</Burbuja>
        <Burbuja>{CONTENCION_2}</Burbuja>
        <FichaNorma clave="docente_agredido" />
        <p
          data-chip="cuaderno"
          className="w-fit rounded-full bg-white/70 px-3 py-1 text-[12.5px] text-[var(--wa-meta)] ring-1 ring-black/[0.06]"
        >
          Guardado en el cuaderno de 4.º B
        </p>
      </section>

      {/* Debajo, el resto de estados para mirarlos sueltos. */}
      <div className="flex w-full max-w-[440px] flex-col gap-4 bg-[var(--wa-fondo)] px-3 py-4">
        <BurbujaCuaderno />

        {CASOS.map((clave) => (
          <FichaNorma key={clave} clave={clave} />
        ))}

        {/* Como la ve el cuaderno: con el cronograma de hitos encendido. */}
        <FichaNorma clave="protocolo_03" variante="cuaderno" />

        {/* Una fila con el sello volteado, para ver como degrada la tarjeta
            si una docente desmiente un dato a ultima hora. */}
        <FichaNorma
          fila={{
            ...NORMA[0],
            clave: "prueba_por_contrastar",
            verificado: "por-contrastar",
          }}
        />
      </div>
    </main>
  );
}

function Burbuja({ children }: { children: string }) {
  return (
    <p
      data-burbuja="contencion"
      className="w-fit max-w-[85%] rounded-xl rounded-tl-none bg-[var(--wa-burbuja-otra)] px-3 py-2 text-[15px] leading-snug text-[var(--wa-texto)] shadow-sm"
    >
      {children}
    </p>
  );
}
