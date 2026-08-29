/**
 * FichaNorma. La tarjeta que hace VISIBLE lo que OpenEd sabe de la norma.
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
   * El cronograma de hitos. Apagado en el chat a proposito: en caliente la
   * docente necesita QUE HACER AHORA, no la linea de tiempo de treinta dias,
   * y una tarjeta de protocolo completa se desborda en un proyector de
   * 1024x768. El cronograma se consulta con calma en el cuaderno, que es
   * quien enciende esto.
   */
  mostrarHitos?: boolean;
}

export default function FichaNorma({ clave, fila, mostrarHitos = false }: FichaNormaProps) {
  const norma = fila ?? resolverNorma(clave);
  const estilo = ESTILO[norma.nivel];
  const numero = etiquetaProtocolo(norma);

  return (
    <article
      data-estado={norma.nivel}
      data-clave={norma.clave}
      className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/10"
    >
      <p
        className={`${estilo.banda} px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white`}
      >
        {estilo.rotulo}
      </p>

      <div className="px-4 py-3.5">
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

        <p className="mt-2.5 text-[14px] leading-snug text-[#4a5a62]">{norma.cuando}</p>

        {norma.plazo ? (
          <p
            className={`${estilo.acento} mt-3 w-fit rounded-md bg-black/[0.045] px-2.5 py-1 text-[14px] font-semibold`}
          >
            Plazo de atención: {norma.plazo}
          </p>
        ) : null}

        <Rotulo>Qué corresponde hacer</Rotulo>
        <ol className="mt-1.5 flex flex-col gap-1.5">
          {norma.ruta.map((paso) => (
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

        {mostrarHitos && norma.hitos.length > 0 ? (
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
          <div className="mt-3.5 rounded-lg bg-[#fdf3d3] px-3 py-2.5">
            <Rotulo className="mt-0">{estilo.rotuloAviso}</Rotulo>
            <p className="mt-1 text-[14px] leading-snug text-[#5b5344]">{norma.noAplica}</p>
          </div>
        ) : null}

        <footer className="mt-3.5 border-t border-black/10 pt-2.5">
          <p className="text-[12.5px] leading-snug text-[var(--wa-meta)]">{citaCorta(norma)}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[var(--wa-meta)]">
            <Sello verificado={norma.verificado} />
            <span>
              PDF p. {norma.fuente.paginaPdf}, folio {norma.fuente.paginaDocumento}
            </span>
          </p>
          <p className="mt-2 text-[11.5px] leading-snug text-[var(--wa-meta)]">
            Esto es insumo para el Libro de Registro de Incidencias y para la reunión con la
            familia. No es registro oficial y no reemplaza al SíseVe.
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
