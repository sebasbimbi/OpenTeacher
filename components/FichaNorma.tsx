"use client";

/**
 * FichaNorma. La tarjeta que hace VISIBLE lo que OpenTeacher sabe de la norma.
 *
 * Es lo unico en pantalla que responde la pregunta del jurado, "esto no es
 * un prompt sobre ChatGPT". Por eso todo el contenido sale de lib/norma.ts,
 * que esta contrastado contra el PDF del Anexo 03, y NADA sale del modelo.
 * El agente emite una clave; los digitos los pone esta tarjeta.
 *
 * Tres estados, que son los tres que existen:
 *  - protocolo   la ley obliga a activar un procedimiento. No basta contener.
 *  - informativa hay marco aplicable pero no protocolo. Es el caso de la
 *                docente agredida, numeral 4.3, y es el corazon del producto.
 *  - sin_norma   conflicto de convivencia. No se activa nada, y decirlo asi
 *                tambien es conocimiento normativo.
 *
 * Se lee a cinco metros en proyector: el dato que decide (numero de
 * protocolo, o su ausencia) es lo mas grande de la tarjeta.
 */

import { useState } from "react";
import {
  citaCorta,
  etiquetaProtocolo,
  resolverNorma,
  type FilaNorma,
  type NivelNorma,
} from "@/lib/norma";

/** Lo que cambia entre estados. Todo lo demas es el mismo esqueleto. */
const ESTILO: Record<
  NivelNorma,
  { banda: string; acento: string; rotulo: string; rotuloAviso: string }
> = {
  protocolo: {
    banda: "bg-[#9c2a21]",
    acento: "text-[#9c2a21]",
    rotulo: "Protocolo obligatorio",
    rotuloAviso: "Excepción de la norma",
  },
  informativa: {
    banda: "bg-[var(--wa-header)]",
    acento: "text-[var(--wa-header)]",
    rotulo: "Norma aplicable, sin protocolo",
    rotuloAviso: "Por qué esto importa",
  },
  sin_norma: {
    banda: "bg-[#54656f]",
    acento: "text-[#54656f]",
    rotulo: "Sin protocolo aplicable",
    rotuloAviso: "Tener en cuenta",
  },
};

export interface FichaNormaProps {
  /** La clave que emitio el agente. Una clave inventada cae en la ficha prudente. */
  clave?: string | null;
  /** O la fila ya resuelta, para el cuaderno y para los checks. */
  fila?: FilaNorma;
  /**
   * Donde se pinta la tarjeta, que es lo que decide cuanto muestra.
   *
   * "chat": en caliente y en un proyector que puede ser de 1024x768. La
   * tarjeta comparte pantalla con la burbuja de contencion, y esa burbuja es
   * la mitad del argumento: si la tarjeta la empuja fuera de vista, parecemos
   * un buscador de protocolos. Asi que aca la tarjeta se aprieta.
   *
   * "cuaderno": hay espacio y se consulta con calma. Sale todo, incluido el
   * cronograma de hitos.
   */
  variante?: "chat" | "cuaderno";
}

/** Cuantos pasos de la ruta se ven de entrada en el chat. */
const PASOS_EN_CHAT = 2;

export default function FichaNorma({ clave, fila, variante = "chat" }: FichaNormaProps) {
  const norma = fila ?? resolverNorma(clave);
  const estilo = ESTILO[norma.nivel];
  const numero = etiquetaProtocolo(norma);
  const esCuaderno = variante === "cuaderno";
  const [rutaAbierta, setRutaAbierta] = useState(false);

  // En el chat la ruta arranca recortada. Lo que queda visible de entrada ya
  // sostiene el argumento: el vacio del numero, el titulo, los primeros pasos,
  // el bloque del porque y la cita de fuente. Nadie tiene que hacer clic
  // durante la demo.
  const todaLaRuta = esCuaderno || rutaAbierta;
  const pasos = todaLaRuta ? norma.ruta : norma.ruta.slice(0, PASOS_EN_CHAT);
  const ocultos = norma.ruta.length - pasos.length;

  return (
    <article
      data-estado={norma.nivel}
      data-clave={norma.clave}
      className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/10"
    >
      <p
        className={`${estilo.banda} px-4 py-1 text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white`}
      >
        {estilo.rotulo}
      </p>

      <div className="px-4 py-3">
        <header className="flex items-start gap-3">
          {/* Cuando no hay protocolo, el hueco se DECLARA. Un guion del tamano
              del numero dice "aqui la ley no puso un procedimiento", que es
              justo el argumento del caso de la docente agredida. Dejarlo en
              blanco lo haria parecer un dato que falta. */}
          <span
            className={`${estilo.acento} shrink-0 text-[38px] font-bold leading-none tabular-nums`}
            aria-label={numero ? `Protocolo ${numero}` : "Sin numero de protocolo"}
          >
            {numero || "\u2014"}
          </span>
          <h3 className="text-[17px] font-semibold leading-tight text-[var(--wa-texto)]">
            {norma.titulo}
          </h3>
        </header>

        {/* En el chat esto lo acaba de decir la burbuja de contencion, y cada
            linea aqui empuja esa burbuja fuera de la pantalla del proyector. */}
        {esCuaderno ? (
          <p className="mt-2 text-[14px] leading-snug text-[#4a5a62]">{norma.cuando}</p>
        ) : null}

        {norma.plazo ? (
          <p
            className={`${estilo.acento} mt-3 w-fit rounded-md bg-black/[0.045] px-2.5 py-1 text-[14px] font-semibold`}
          >
            Plazo de atención: {norma.plazo}
          </p>
        ) : null}

        {esCuaderno ? <Rotulo className="mt-3">Qué corresponde hacer</Rotulo> : null}
        <ol className={`flex flex-col gap-1 ${esCuaderno ? "mt-1" : "mt-2.5"}`}>
          {pasos.map((paso) => (
            <li
              key={paso}
              className="flex gap-2 text-[14.5px] leading-snug text-[var(--wa-texto)]"
            >
              <span aria-hidden className={`${estilo.acento} select-none font-bold`}>
                ·
              </span>
              <span className="flex-1">{paso}</span>
            </li>
          ))}
        </ol>

        {ocultos > 0 ? (
          <button
            type="button"
            onClick={() => setRutaAbierta(true)}
            className={`${estilo.acento} mt-1 text-[13.5px] font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2`}
          >
            Ver los {norma.ruta.length} pasos
          </button>
        ) : null}

        {esCuaderno && norma.hitos.length > 0 ? (
          <>
            <Rotulo>Hitos con plazo</Rotulo>
            <dl className="mt-1.5 flex flex-col divide-y divide-black/[0.07] border-y border-black/[0.07]">
              {norma.hitos.map((hito) => (
                <div key={hito.paso} className="flex items-baseline gap-3 py-1.5">
                  <dt className="flex-1 text-[13.5px] leading-snug text-[#4a5a62]">
                    {hito.paso}
                  </dt>
                  <dd className="shrink-0 text-[13.5px] font-semibold tabular-nums text-[var(--wa-texto)]">
                    {hito.plazo}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        ) : null}

        {norma.noAplica ? (
          <div className="mt-2.5 rounded-lg bg-[#fdf3d3] px-3 py-2">
            {esCuaderno ? <Rotulo className="mt-0">{estilo.rotuloAviso}</Rotulo> : null}
            <p className="mt-0 text-[14px] leading-snug text-[#5b5344]">{norma.noAplica}</p>
          </div>
        ) : null}

        <footer className="mt-3 border-t border-black/10 pt-2">
          {/* La prueba. Se queda completa siempre: sin fuente auditable esto
              es una tarjeta bonita y nada mas. */}
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] leading-snug text-[var(--wa-meta)]">
            <Sello verificado={norma.verificado} />
            <span>
              {citaCorta(norma)} · PDF p. {norma.fuente.paginaPdf}, folio{" "}
              {norma.fuente.paginaDocumento}
            </span>
          </p>
          {/* El descargo va en TODAS las tarjetas, siempre: si una docente cree
              que ya cumplio porque le escribio al bot, el producto le hizo dano.
              En el chat cabe en una linea; en el cuaderno se dice entero. */}
          <p className="mt-1.5 text-[11.5px] leading-snug text-[var(--wa-meta)]">
            {esCuaderno
              ? "Esto es insumo para el Libro de Registro de Incidencias y para la reunión con la familia. No es registro oficial y no reemplaza al SíseVe."
              : "Insumo para el Libro de Incidencias. No es registro oficial."}
          </p>
        </footer>
      </div>
    </article>
  );
}

function Rotulo({ children, className = "mt-3.5" }: { children: string; className?: string }) {
  return (
    <p
      className={`${className} text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--wa-meta)]`}
    >
      {children}
    </p>
  );
}

/**
 * El sello. `por-contrastar` NO se esconde: mostrar que el sistema distingue
 * lo confirmado de lo pendiente es mas fuerte ante un jurado que fingir
 * certeza. Si una docente desmiente una fila, se voltea el campo en la tabla
 * y la tarjeta se degrada sola, sin tocar este componente.
 */
function Sello({ verificado }: { verificado: FilaNorma["verificado"] }) {
  const publicado = verificado === "publicado";
  return (
    <span
      data-sello={verificado}
      className={`rounded px-1.5 py-0.5 text-[11.5px] font-semibold ${
        publicado ? "bg-[#d8f0e4] text-[#1c6b4f]" : "bg-[#fce9c8] text-[#8a5a10]"
      }`}
    >
      {publicado ? "Verificado en fuente" : "Por contrastar"}
    </span>
  );
}
