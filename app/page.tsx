"use client";

/**
 * Simulador de chat de WhatsApp: el PLAN B de la demo de OpenEd.
 *
 * Corre 100% local con lib/mockData.ts. No llama a ninguna API.
 * Si el WhatsApp real se cae en el escenario, la demo sigue aqui.
 */

import { useEffect, useRef, useState } from "react";
import {
  AUDIO_ECO,
  CONTACTO,
  CONVERSACION_DEMO,
  RESPUESTA_ECO,
  horaAhora,
  type Mensaje,
} from "@/lib/mockData";

const DELAY_RESPUESTA_MS = 1100;

export default function Page() {
  const [mensajes, setMensajes] = useState<Mensaje[]>(CONVERSACION_DEMO);
  const [borrador, setBorrador] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, escribiendo]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  function agregar(mensaje: Omit<Mensaje, "id" | "hora">) {
    setMensajes((previos) => [
      ...previos,
      { ...mensaje, id: `m${previos.length + 1}-${Date.now()}`, hora: horaAhora() },
    ]);
  }

  /** Eco local. Cuando llegue el brief, esto se cambia por la llamada al agente. */
  function responder() {
    setEscribiendo(true);
    timerRef.current = setTimeout(() => {
      setEscribiendo(false);
      agregar({ de: "opened", texto: RESPUESTA_ECO });
    }, DELAY_RESPUESTA_MS);
  }

  function enviarTexto() {
    const texto = borrador.trim();
    if (!texto) return;
    setBorrador("");
    agregar({ de: "docente", texto });
    responder();
  }

  function enviarAudio() {
    agregar(AUDIO_ECO);
    responder();
  }

  const hayTexto = borrador.trim().length > 0;

  return (
    <main className="flex min-h-screen justify-center bg-[#0b141a]">
      <div className="flex h-screen w-full max-w-[440px] flex-col bg-[var(--wa-fondo)] shadow-2xl shadow-black/60">
        <Cabecera />

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <Aviso />
          <ol className="flex flex-col gap-2">
            {mensajes.map((mensaje) => (
              <Burbuja key={mensaje.id} mensaje={mensaje} />
            ))}
            {escribiendo && <Escribiendo />}
          </ol>
          <div ref={finRef} />
        </div>

        <Barra
          borrador={borrador}
          onBorrador={setBorrador}
          onEnviar={enviarTexto}
          onAudio={enviarAudio}
          hayTexto={hayTexto}
        />
      </div>
    </main>
  );
}

function Cabecera() {
  return (
    <header className="flex items-center gap-3 bg-[var(--wa-header)] px-4 py-3 text-white">
      <span
        aria-hidden
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/20 text-[15px] font-semibold tracking-wide"
      >
        {CONTACTO.iniciales}
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-[17px] font-semibold">{CONTACTO.nombre}</span>
        <span className="truncate text-[13px] text-white/75">{CONTACTO.estado}</span>
      </span>
    </header>
  );
}

function Aviso() {
  return (
    <p className="mx-auto mb-4 w-fit rounded-lg bg-[#fdf3d3] px-3 py-1.5 text-center text-[12.5px] text-[#5b5344]">
      Demo local. Ningun mensaje sale de este navegador.
    </p>
  );
}

function Burbuja({ mensaje }: { mensaje: Mensaje }) {
  const propia = mensaje.de === "docente";

  return (
    <li className={propia ? "flex justify-end" : "flex justify-start"}>
      <div
        className={[
          "max-w-[85%] px-3 py-2 text-[16px] leading-[1.45] text-[var(--wa-texto)] shadow-sm",
          propia
            ? "rounded-xl rounded-tr-none bg-[var(--wa-burbuja-propia)]"
            : "rounded-xl rounded-tl-none bg-[var(--wa-burbuja-otra)]",
        ].join(" ")}
      >
        {mensaje.audio ? (
          <NotaDeVoz duracion={mensaje.duracion ?? "0:00"} />
        ) : (
          <p className="whitespace-pre-line">{mensaje.texto}</p>
        )}
        <span className="mt-1 flex items-center justify-end gap-1 text-[11.5px] text-[var(--wa-meta)]">
          {mensaje.hora}
          {propia && <Checks />}
        </span>
      </div>
    </li>
  );
}

function NotaDeVoz({ duracion }: { duracion: string }) {
  return (
    <span className="flex w-56 items-center gap-2.5">
      <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0 fill-[#54656f]" aria-hidden>
        <path d="M8 5v14l11-7z" />
      </svg>
      <span className="flex flex-1 items-center gap-[3px]" aria-hidden>
        {[9, 15, 22, 12, 26, 18, 10, 20, 14, 24, 11, 17, 8, 21, 13].map((alto, i) => (
          <span
            key={i}
            className="w-[3px] rounded-full bg-[#9aa4a9]"
            style={{ height: `${alto}px` }}
          />
        ))}
      </span>
      <span className="shrink-0 text-[12px] text-[var(--wa-meta)]">{duracion}</span>
    </span>
  );
}

function Checks() {
  return (
    <svg viewBox="0 0 20 12" className="h-3.5 w-4 fill-[#53bdeb]" aria-label="leido">
      <path d="M6.6 11.2 1.4 6l1.2-1.2 4 4L14.4.8l1.2 1.2z" />
      <path d="M11.4 11.2 10.2 10l1.2-1.2 1.2 1.2zM19.2 2 12 9.2 10.8 8 18 .8z" />
    </svg>
  );
}

function Escribiendo() {
  return (
    <li className="flex justify-start" aria-label="OpenEd esta escribiendo">
      <span className="flex gap-1.5 rounded-xl rounded-tl-none bg-[var(--wa-burbuja-otra)] px-4 py-3.5 shadow-sm">
        {[0, 150, 300].map((retraso) => (
          <span
            key={retraso}
            className="h-2 w-2 animate-bounce rounded-full bg-[#9aa4a9]"
            style={{ animationDelay: `${retraso}ms` }}
          />
        ))}
      </span>
    </li>
  );
}

function Barra({
  borrador,
  onBorrador,
  onEnviar,
  onAudio,
  hayTexto,
}: {
  borrador: string;
  onBorrador: (valor: string) => void;
  onEnviar: () => void;
  onAudio: () => void;
  hayTexto: boolean;
}) {
  return (
    <form
      className="flex items-center gap-2 bg-[var(--wa-barra)] px-3 py-2.5"
      onSubmit={(e) => {
        e.preventDefault();
        onEnviar();
      }}
    >
      <input
        value={borrador}
        onChange={(e) => onBorrador(e.target.value)}
        placeholder="Cuenteme que paso en el aula"
        aria-label="Mensaje"
        className="min-w-0 flex-1 rounded-full bg-white px-4 py-3 text-[16px] text-[var(--wa-texto)] outline-none placeholder:text-[#8696a0] focus:ring-2 focus:ring-[var(--wa-accion)]"
      />
      <button
        type={hayTexto ? "submit" : "button"}
        onClick={hayTexto ? undefined : onAudio}
        aria-label={hayTexto ? "Enviar mensaje" : "Enviar nota de voz"}
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--wa-accion)] text-white transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wa-header)]"
      >
        {hayTexto ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden>
            <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden>
            <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3z" />
            <path d="M18 12a6 6 0 0 1-12 0H4a8 8 0 0 0 7 7.93V22h2v-2.07A8 8 0 0 0 20 12z" />
          </svg>
        )}
      </button>
    </form>
  );
}
