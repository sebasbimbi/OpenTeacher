"use client";

/**
 * El cuaderno del aula, como un adjunto de WhatsApp.
 *
 * Se abre desde una burbuja tipo documento DENTRO del chat, ocupa la
 * pantalla entera y cierra de vuelta al chat. Sin cambio de ruta y sin
 * barra de URL en el proyector, que es la razon de que no sea una pagina.
 *
 * Dos vistas dentro del MISMO overlay:
 *  - aula, el resumen de las seis semanas,
 *  - hoja, lo que la docente se lleva impreso a la reunion con la familia.
 *
 * MONTAJE, una sola linea en app/page.tsx:
 *   import BurbujaCuaderno from "@/components/CuadernoOverlay";
 *   <BurbujaCuaderno />
 * El componente se administra solo: la burbuja, el estado y el overlay.
 *
 * Los numeros salen de lib/cuaderno.ts. La prosa la escriben las docentes.
 * Este archivo no calcula ni redacta nada por su cuenta.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AULA,
  PENDIENTE,
  PERIODO,
  prosaDe,
  resumenAlumno,
  resumenAula,
  type ResumenAlumno,
} from "@/lib/cuaderno";
import { citaCorta } from "@/lib/norma";
import FichaNorma from "@/components/FichaNorma";

const FECHA_HOJA = "29 de agosto de 2026";

/**
 * El CSS de impresion. Va en un <style> propio y no en globals.css a
 * proposito: este componente se mergea desde otra rama y no quiero tocar
 * una hoja compartida por dos carriles a dos horas del pitch.
 */
const CSS_IMPRESION = `
@page { size: A4 portrait; margin: 18mm 16mm; }
@media print {
  /* visibility:hidden NO sirve aca: oculta pero conserva el alto, y el
     chat detras seguia generando tres paginas en blanco antes de la hoja.
     Se comprobo imprimiendo de verdad. Por eso el overlay se monta con un
     portal en <body>, y en papel se apaga todo lo que no sea el. */
  body { background: #fff !important; }
  body > *:not([data-overlay="cuaderno"]) { display: none !important; }
  [data-overlay="cuaderno"] {
    position: static !important; height: auto !important; overflow: visible !important;
    background: #fff !important;
  }
  [data-overlay="cuaderno"] > div { overflow: visible !important; height: auto !important; }
  .no-imprimir { display: none !important; }
  .hoja-a4 {
    box-shadow: none !important; border: 0 !important; border-radius: 0 !important;
    padding: 0 !important; margin: 0 !important; background: #fff !important;
    color: #000 !important; max-width: none !important;
    font-size: 11.5pt; line-height: 1.45;
  }
  .hoja-a4 h2 { font-size: 15pt; }
  .hoja-a4 h3 { font-size: 10.5pt; letter-spacing: 0.08em; }
  .hoja-a4 section { break-inside: avoid; }
}
`;

export default function BurbujaCuaderno() {
  const [abierto, setAbierto] = useState(false);
  const aula = resumenAula();

  return (
    <>
      <style>{CSS_IMPRESION}</style>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-haspopup="dialog"
        className="no-imprimir flex w-full max-w-[85%] items-center gap-3 rounded-xl rounded-tl-none bg-[var(--wa-burbuja-otra)] px-3 py-2.5 text-left shadow-sm transition-transform active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wa-header)]"
      >
        <span
          aria-hidden
          className="grid h-11 w-9 shrink-0 place-items-center rounded bg-[#f0f2f5] text-[11px] font-bold tracking-wide text-[#8696a0] ring-1 ring-black/10"
        >
          PDF
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[15px] font-semibold text-[var(--wa-texto)]">
            Cuaderno de aula {AULA}
          </span>
          <span className="truncate text-[12.5px] text-[var(--wa-meta)]">
            {aula.total} registros · {aula.periodo}
          </span>
        </span>
        <span className="shrink-0 text-[13px] font-semibold text-[var(--wa-accion)]">Abrir</span>
      </button>

      {abierto ? <Overlay alCerrar={() => setAbierto(false)} /> : null}
    </>
  );
}

function Overlay({ alCerrar }: { alCerrar: () => void }) {
  const [alumnoId, setAlumnoId] = useState<string | null>(null);
  const [montado, setMontado] = useState(false);
  const cajaRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMontado(true), []);

  const volver = useCallback(() => {
    if (alumnoId) setAlumnoId(null);
    else alCerrar();
  }, [alumnoId, alCerrar]);

  // El foco entra al overlay. Si se queda en la burbuja de atras, el teclado
  // sigue operando el chat y en proyector se lee como que no abrio nada.
  useEffect(() => {
    cajaRef.current?.focus();
  }, []);

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") volver();
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [volver]);

  if (!montado) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Cuaderno de aula ${AULA}`}
      data-overlay="cuaderno"
      ref={cajaRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex flex-col bg-[var(--wa-fondo)] outline-none"
    >
      <header className="no-imprimir flex items-center gap-3 bg-[var(--wa-header)] px-3 py-3 text-white">
        <button
          type="button"
          onClick={volver}
          aria-label={alumnoId ? "Volver al resumen del aula" : "Cerrar el cuaderno"}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden>
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z" />
          </svg>
        </button>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[17px] font-semibold">
            {alumnoId ? "Hoja de seguimiento" : `Cuaderno de aula ${AULA}`}
          </span>
          <span className="truncate text-[12.5px] text-white/75">{PERIODO.etiqueta}</span>
        </span>
      </header>

      <div className="flex-1 overflow-y-auto">
        {alumnoId ? (
          <Hoja resumen={resumenAlumno(alumnoId)} />
        ) : (
          <VistaAula alElegir={setAlumnoId} />
        )}
      </div>
    </div>,
    document.body,
  );
}

// --- Vista 1: el aula ---------------------------------------------------------

function VistaAula({ alElegir }: { alElegir: (id: string) => void }) {
  const aula = resumenAula();
  const mayor = Math.max(...aula.porAlumno.map((f) => f.total), 1);

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 py-5">
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Dato etiqueta="Registros" valor={aula.total} />
        <Dato etiqueta="Días de clase" valor={aula.diasDeClase} />
        <Dato etiqueta="Convivencia" valor={aula.convivencia} />
        <Dato etiqueta="Violencia" valor={aula.violencia} />
      </dl>

      <p className="mt-3 rounded-lg bg-[#fdf3d3] px-3 py-2.5 text-[14px] leading-snug text-[#5b5344]">
        De esos registros, {aula.contraLaDocente} tuvo como agredida a la docente. Ese caso no
        tiene ruta en el Portal SíseVe, que registra violencia contra estudiantes.
      </p>

      <h2 className="mt-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--wa-meta)]">
        Por estudiante
      </h2>
      <ul className="mt-2 flex flex-col gap-1.5">
        {aula.porAlumno.map(({ alumno, total }) => (
          <li key={alumno.id}>
            <button
              type="button"
              onClick={() => alElegir(alumno.id)}
              className="flex w-full items-center gap-3 rounded-lg bg-white px-3 py-3 text-left shadow-sm ring-1 ring-black/[0.06] transition-transform active:scale-[0.995] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wa-header)]"
            >
              <span className="w-[92px] shrink-0 text-[16px] font-semibold tabular-nums text-[var(--wa-texto)]">
                {alumno.iniciales}
              </span>
              <span aria-hidden className="h-2.5 flex-1 rounded-full bg-black/[0.06]">
                <span
                  className="block h-full rounded-full bg-[var(--wa-header)]"
                  style={{ width: `${Math.round((total / mayor) * 100)}%` }}
                />
              </span>
              <span className="w-16 shrink-0 text-right text-[14px] text-[var(--wa-meta)]">
                {total} {total === 1 ? "registro" : "registros"}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[12.5px] leading-snug text-[var(--wa-meta)]">
        Los estudiantes van por iniciales. Este cuaderno es insumo para el Libro de Registro de
        Incidencias y para la reunión con la familia. No es registro oficial.
      </p>
    </div>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: number }) {
  return (
    <div className="rounded-lg bg-white px-3 py-2.5 shadow-sm ring-1 ring-black/[0.06]">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--wa-meta)]">
        {etiqueta}
      </dt>
      <dd className="mt-0.5 text-[26px] font-bold leading-none tabular-nums text-[var(--wa-texto)]">
        {valor}
      </dd>
    </div>
  );
}

// --- Vista 2: la hoja A4 -------------------------------------------------------

function Hoja({ resumen }: { resumen: ResumenAlumno }) {
  const { alumno, total, diasDeClase, enFranja, antesDelCambio, despuesDelCambio } = resumen;
  const prosa = prosaDe(alumno.id);

  return (
    <div className="mx-auto w-full max-w-[820px] px-4 py-5">
      <button
        type="button"
        onClick={() => window.print()}
        className="no-imprimir mb-3 rounded-lg bg-[var(--wa-header)] px-4 py-2.5 text-[14px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wa-texto)]"
      >
        Imprimir la hoja
      </button>

      <article className="hoja-a4 rounded-lg bg-white px-6 py-6 text-[var(--wa-texto)] shadow-sm ring-1 ring-black/10">
        <h2 className="text-[19px] font-bold leading-tight">Reporte de seguimiento en aula</h2>
        <p className="mt-1.5 text-[13.5px] text-[#4a5a62]">
          Estudiante: {alumno.iniciales} · {alumno.aula}
          <br />
          Periodo: {PERIODO.etiqueta} ({diasDeClase} días de clase)
          <br />
          Fecha: {FECHA_HOJA}
        </p>

        <Seccion titulo="Para qué es este documento">{prosa.paraQueEs}</Seccion>

        {/* Lo unico que calcula el codigo. Todo lo demas lo escriben ellas. */}
        <section className="mt-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--wa-meta)]">
            Lo que observamos
          </h3>
          <p className="mt-1.5 text-[14.5px] leading-snug">
            En {diasDeClase} días de clase se registraron {total}{" "}
            {total === 1 ? "situación" : "situaciones"}:
          </p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {resumen.porConducta.map((c) => (
              <li key={c.descripcion} className="flex gap-2 text-[14.5px] leading-snug">
                <span aria-hidden className="select-none">
                  ·
                </span>
                <span className="flex-1">
                  En {c.veces}, {c.descripcion}.
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[14.5px] leading-snug">
            {enFranja} de las {total} ocurrieron en la última hora antes del refrigerio.{" "}
            {antesDelCambio > despuesDelCambio
              ? `Antes del cambio de ubicación hubo ${antesDelCambio}; después, ${despuesDelCambio}.`
              : null}
          </p>
        </section>

        <Seccion titulo="Lo que ya hicimos en el colegio">{prosa.loQueYaHicimos}</Seccion>
        <Seccion titulo="Lo que está funcionando">{prosa.loQueEstaFuncionando}</Seccion>
        <Seccion titulo="Lo que también vemos">{prosa.loQueTambienVemos}</Seccion>
        <Seccion titulo="Lo que les pedimos">{prosa.loQuePedimos}</Seccion>
        <Seccion titulo="Cómo seguimos">{prosa.comoSeguimos}</Seccion>

        {resumen.conNorma.length > 0 ? (
          <section className="no-imprimir mt-5 border-t border-black/10 pt-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--wa-meta)]">
              Para la dirección, no para la familia
            </h3>
            <p className="mt-1.5 text-[13px] leading-snug text-[#4a5a62]">
              Esto no se imprime en la hoja que se lleva la familia. Aquí sí va el cronograma
              completo: el cuaderno se consulta con calma, a diferencia del chat.
            </p>
            <ul className="mt-2 flex flex-col gap-3">
              {resumen.conNorma.map(({ incidencia, norma }) => (
                <li key={incidencia.id}>
                  <p className="mb-1 text-[12.5px] text-[var(--wa-meta)]">
                    {incidencia.fecha} · {citaCorta(norma)}
                  </p>
                  <FichaNorma fila={norma} mostrarHitos />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="mt-5 border-t border-black/10 pt-3 text-[12px] leading-snug text-[var(--wa-meta)]">
          Documento de trabajo del aula. Es insumo para el Libro de Registro de Incidencias y para
          la reunión con la familia. No es registro oficial y no reemplaza al Portal SíseVe. No se
          comparte con otras familias.
        </p>
      </article>
    </div>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: string }) {
  const pendiente = children.includes(PENDIENTE);
  return (
    <section className="mt-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--wa-meta)]">
        {titulo}
      </h3>
      <p
        data-pendiente={pendiente ? "si" : undefined}
        className={
          pendiente
            ? "mt-1.5 rounded bg-[#fce9c8] px-2 py-1.5 text-[13.5px] leading-snug text-[#8a5a10]"
            : "mt-1.5 whitespace-pre-line text-[14.5px] leading-snug"
        }
      >
        {pendiente ? `${PENDIENTE}: lo escriben ellas, en su voz.` : children}
      </p>
    </section>
  );
}
