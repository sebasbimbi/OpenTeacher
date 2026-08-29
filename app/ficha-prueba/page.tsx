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

import FichaNorma from "@/components/FichaNorma";
import { NORMA } from "@/lib/norma";

// Un caso por estado. El de la docente agredida va primero a proposito:
// es el que se demuestra en escena.
const CASOS = ["docente_agredido", "protocolo_03", "sin_protocolo"];

export default function Page() {
  return (
    <main className="flex min-h-dvh justify-center bg-[#0b141a]">
      <div className="flex w-full max-w-[440px] flex-col gap-4 bg-[var(--wa-fondo)] px-3 py-4">
        {CASOS.map((clave) => (
          <FichaNorma key={clave} clave={clave} />
        ))}

        {/* Como la ve el cuaderno: con el cronograma de hitos encendido. */}
        <FichaNorma clave="protocolo_03" mostrarHitos />

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
