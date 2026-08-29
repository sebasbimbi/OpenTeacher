"use client";

/**
 * Simulador de chat de WhatsApp. Es EL producto de la demo: lo unico que
 * el jurado ve. No hay numero real de WhatsApp hoy.
 *
 * El texto corre 100% local con lib/mockData.ts. El audio se graba en el
 * navegador con MediaRecorder y se transcribe en /api/transcribir, que
 * tambien tiene modo mock. Nada del flujo depende de una llamada en vivo.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import FichaNorma from "@/components/FichaNorma";
import { extensionDeMime, formatearDuracion } from "@/lib/audioErrores";
import { useGrabadora, type Grabacion } from "@/lib/grabadora";
import {
  CONTACTO,
  CONVERSACION_DEMO,
  RESPUESTA_ECO,
  horaAhora,
  type Mensaje,
} from "@/lib/mockData";

const DELAY_RESPUESTA_MS = 1100;
const BARRAS = [9, 15, 22, 12, 26, 18, 10, 20, 14, 24, 11, 17, 8, 21, 13];


export default function Page() {
  const [mensajes, setMensajes] = useState<Mensaje[]>(CONVERSACION_DEMO);
  const [borrador, setBorrador] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const urlsRef = useRef<string[]>([]);
  // Arranca con el saludo ya dentro: es parte de la conversacion que ve el agente.
  const historialRef = useRef<{ rol: "docente" | "opened"; texto: string }[]>(
    CONVERSACION_DEMO.map((m) => ({ rol: m.de, texto: m.texto })),
  );

  const grabadora = useGrabadora();

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, escribiendo, grabadora.grabando]);

  // Los object URL de las notas grabadas se sueltan al salir.
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const agregar = useCallback((mensaje: Omit<Mensaje, "id" | "hora">) => {
    const id = `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    if (mensaje.url) urlsRef.current.push(mensaje.url);
    // Una nota de voz sin transcribir todavia no aporta texto al agente: entra
    // al historial recien cuando llega su transcripcion.
    if (!mensaje.audio && mensaje.texto.trim()) {
      historialRef.current.push({ rol: mensaje.de, texto: mensaje.texto });
    }
    setMensajes((previos) => [...previos, { ...mensaje, id, hora: horaAhora() }]);
    return id;
  }, []);

  const actualizar = useCallback((id: string, cambios: Partial<Mensaje>) => {
    setMensajes((previos) =>
      previos.map((m) => (m.id === id ? { ...m, ...cambios } : m)),
    );
  }, []);

  const esperar = (ms: number) =>
    new Promise<void>((r) => {
      timerRef.current = setTimeout(r, ms);
    });

  /**
   * Llama al agente y pinta DOS burbujas, como un colega que manda dos
   * mensajes: primero la contencion, despues la accion o la ruta.
   *
   * Nunca deja el chat mudo. Si la ruta falla, el servidor ya devuelve el
   * fixture; si falla la red entera, se pinta el fixture desde aca.
   */
  const responder = useCallback(async () => {
    setEscribiendo(true);
    try {
      const respuesta = await fetch("/api/responder", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ historial: historialRef.current }),
      });
      const datos = (await respuesta.json().catch(() => null)) as {
        bloque_1?: string;
        bloque_2?: string;
        clave_norma?: string;
      } | null;

      const bloque1 = datos?.bloque_1?.trim() || RESPUESTA_ECO.split("\n\n")[0];
      const bloque2 = datos?.bloque_2?.trim() ?? "";
      const clave = datos?.clave_norma;

      setEscribiendo(false);
      // La tarjeta cuelga de la burbuja que lleva la ruta, o sea la segunda.
      agregar({ de: "opened", texto: bloque1, claveNorma: bloque2 ? undefined : clave });

      if (bloque2) {
        // La pausa entre burbujas es lo que hace que se lea como una persona
        // y no como un muro de texto.
        setEscribiendo(true);
        await esperar(DELAY_RESPUESTA_MS);
        setEscribiendo(false);
        agregar({ de: "opened", texto: bloque2, claveNorma: clave });
      }
    } catch {
      setEscribiendo(false);
      agregar({ de: "opened", texto: RESPUESTA_ECO });
    }
  }, [agregar]);

  function enviarTexto() {
    const texto = borrador.trim();
    if (!texto) return;
    setBorrador("");
    agregar({ de: "docente", texto });
    void responder();
  }

  async function transcribir(id: string, grabacion: Grabacion) {
    try {
      const cuerpo = new FormData();
      cuerpo.append("audio", grabacion.blob, `nota.${extensionDeMime(grabacion.mimeType)}`);

      const respuesta = await fetch("/api/transcribir", { method: "POST", body: cuerpo });
      const datos = (await respuesta.json().catch(() => null)) as
        | { texto?: string; error?: string }
        | null;

      actualizar(id, { transcribiendo: false });

      if (!respuesta.ok || !datos?.texto) {
        grabadora.setError(
          datos?.error ?? "No pude transcribir el audio. Escribeme el mensaje.",
        );
        void responder();
        return;
      }

      actualizar(id, { transcripcion: datos.texto });
      historialRef.current.push({ rol: "docente", texto: datos.texto });
      void responder();
    } catch {
      actualizar(id, { transcribiendo: false });
      grabadora.setError("No pude transcribir el audio. Escribeme el mensaje.");
      void responder();
    }
  }

  async function alternarGrabacion() {
    if (!grabadora.grabando) {
      await grabadora.iniciar();
      return;
    }
    const grabacion = await grabadora.detener();
    if (!grabacion) return; // muy corto, o fallo: el mensaje ya esta en pantalla

    const id = agregar({
      de: "docente",
      texto: "Nota de voz",
      audio: true,
      duracion: formatearDuracion(grabacion.duracionMs),
      duracionMs: grabacion.duracionMs,
      url: grabacion.url,
      transcribiendo: true,
    });
    transcribir(id, grabacion);
  }

  return (
    <main className="flex min-h-dvh justify-center bg-[#0b141a]">
      <div className="flex h-dvh w-full max-w-[440px] flex-col bg-[var(--wa-fondo)] shadow-2xl shadow-black/60">
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

        {grabadora.error && (
          <AvisoError texto={grabadora.error} onCerrar={() => grabadora.setError(null)} />
        )}

        <Barra
          borrador={borrador}
          onBorrador={setBorrador}
          onEnviar={enviarTexto}
          onMicrofono={alternarGrabacion}
          onCancelar={() => grabadora.cancelar()}
          grabando={grabadora.grabando}
          transcurridoMs={grabadora.transcurridoMs}
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
      Simulador. Mismo agente, sin el número.
    </p>
  );
}

function AvisoError({ texto, onCerrar }: { texto: string; onCerrar: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 bg-[#fdecea] px-4 py-3 text-[14px] text-[#8b2c22]"
    >
      <span className="flex-1 leading-snug">{texto}</span>
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar aviso"
        className="shrink-0 rounded px-1 text-[18px] leading-none text-[#8b2c22]/70 hover:text-[#8b2c22] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8b2c22]"
      >
        ×
      </button>
    </div>
  );
}

function Burbuja({ mensaje }: { mensaje: Mensaje }) {
  const propia = mensaje.de === "docente";

  return (
    <li className={propia ? "flex flex-col items-end" : "flex flex-col items-start"}>
      <div
        className={[
          "max-w-[85%] px-3 py-2 text-[16px] leading-[1.45] text-[var(--wa-texto)] shadow-sm",
          propia
            ? "rounded-xl rounded-tr-none bg-[var(--wa-burbuja-propia)]"
            : "rounded-xl rounded-tl-none bg-[var(--wa-burbuja-otra)]",
        ].join(" ")}
      >
        {mensaje.audio ? (
          <>
            <NotaDeVoz
              duracion={mensaje.duracion ?? "0:00"}
              duracionMs={mensaje.duracionMs}
              url={mensaje.url}
            />
            <Transcripcion mensaje={mensaje} />
          </>
        ) : (
          <p className="whitespace-pre-line">{mensaje.texto}</p>
        )}
        <span className="mt-1 flex items-center justify-end gap-1 text-[11.5px] text-[var(--wa-meta)]">
          {mensaje.hora}
          {propia && <Checks />}
        </span>
      </div>

      {/* La tarjeta pone los digitos que el agente tiene prohibido escribir. */}
      {mensaje.claveNorma && (
        <div className="mt-1.5 w-full">
          <FichaNorma clave={mensaje.claveNorma} />
        </div>
      )}
    </li>
  );
}

function Transcripcion({ mensaje }: { mensaje: Mensaje }) {
  if (!mensaje.transcribiendo && !mensaje.transcripcion) return null;

  return (
    <p className="mt-2 border-t border-black/10 pt-2 text-[14px] leading-snug text-[#4a5a62]">
      {mensaje.transcribiendo ? (
        <span className="italic text-[var(--wa-meta)]">Transcribiendo...</span>
      ) : (
        mensaje.transcripcion
      )}
    </p>
  );
}

function NotaDeVoz({
  duracion,
  duracionMs,
  url,
}: {
  duracion: string;
  duracionMs?: number;
  url?: string;
}) {
  const [reproduciendo, setReproduciendo] = useState(false);
  const [avance, setAvance] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  /*
   * El avance se calcula contra la duracion que medimos al grabar, no
   * contra audio.duration. Chrome actual si reporta duracion finita en el
   * webm de MediaRecorder (medido: 2.4s), pero llega recien con
   * loadedmetadata y otros navegadores dan Infinity en ese contenedor.
   * La duracion medida ya la tenemos desde el segundo cero.
   */
  const totalMs = duracionMs && duracionMs > 0 ? duracionMs : 0;

  function alternar() {
    const audio = audioRef.current;
    if (!audio || !url) return;
    if (reproduciendo) {
      audio.pause();
      return;
    }
    if (avance >= 1) audio.currentTime = 0;
    audio.play().catch(() => setReproduciendo(false));
  }

  const llenas = Math.round(avance * BARRAS.length);

  return (
    <span className="flex w-56 items-center gap-2.5">
      <button
        type="button"
        onClick={alternar}
        disabled={!url}
        aria-label={reproduciendo ? "Pausar nota de voz" : "Reproducir nota de voz"}
        className="shrink-0 rounded-full text-[#54656f] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wa-header)]"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden>
          {reproduciendo ? (
            <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
          ) : (
            <path d="M8 5v14l11-7z" />
          )}
        </svg>
      </button>

      <span className="flex flex-1 items-center gap-[3px]" aria-hidden>
        {BARRAS.map((alto, i) => (
          <span
            key={i}
            className={`w-[3px] rounded-full ${i < llenas ? "bg-[#4fa3d1]" : "bg-[#9aa4a9]"}`}
            style={{ height: `${alto}px` }}
          />
        ))}
      </span>

      <span className="shrink-0 text-[12px] text-[var(--wa-meta)]">{duracion}</span>

      {url && (
        <audio
          ref={audioRef}
          src={url}
          preload="metadata"
          onPlay={() => setReproduciendo(true)}
          onPause={() => setReproduciendo(false)}
          onEnded={() => {
            setReproduciendo(false);
            setAvance(1);
          }}
          onTimeUpdate={(e) => {
            if (!totalMs) return;
            setAvance(Math.min(1, (e.currentTarget.currentTime * 1000) / totalMs));
          }}
        />
      )}
    </span>
  );
}

function Checks() {
  return (
    <svg viewBox="0 0 20 12" className="h-3.5 w-4 fill-[#53bdeb]" aria-label="leído">
      <path d="M6.6 11.2 1.4 6l1.2-1.2 4 4L14.4.8l1.2 1.2z" />
      <path d="M11.4 11.2 10.2 10l1.2-1.2 1.2 1.2zM19.2 2 12 9.2 10.8 8 18 .8z" />
    </svg>
  );
}

function Escribiendo() {
  return (
    <li className="flex justify-start" aria-label="OpenEd está escribiendo">
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
  onMicrofono,
  onCancelar,
  grabando,
  transcurridoMs,
}: {
  borrador: string;
  onBorrador: (valor: string) => void;
  onEnviar: () => void;
  onMicrofono: () => void;
  onCancelar: () => void;
  grabando: boolean;
  transcurridoMs: number;
}) {
  const hayTexto = borrador.trim().length > 0;

  return (
    <form
      className="flex items-center gap-2 bg-[var(--wa-barra)] px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]"
      onSubmit={(e) => {
        e.preventDefault();
        onEnviar();
      }}
    >
      {grabando ? (
        <>
          <button
            type="button"
            onClick={onCancelar}
            aria-label="Cancelar grabación"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-[#8696a0] hover:text-[#54656f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wa-header)]"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden>
              <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z" />
            </svg>
          </button>
          <span className="flex min-w-0 flex-1 items-center gap-2 px-1 text-[16px] text-[var(--wa-texto)]">
            <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-[#e02f2f]" />
            Grabando {formatearDuracion(transcurridoMs)}
          </span>
        </>
      ) : (
        <input
          value={borrador}
          onChange={(e) => onBorrador(e.target.value)}
          placeholder="Cuénteme qué pasó en el aula"
          aria-label="Mensaje"
          className="min-w-0 flex-1 rounded-full bg-white px-4 py-3 text-[16px] text-[var(--wa-texto)] outline-none placeholder:text-[#8696a0] focus:ring-2 focus:ring-[var(--wa-accion)]"
        />
      )}

      <button
        type={hayTexto && !grabando ? "submit" : "button"}
        onClick={hayTexto && !grabando ? undefined : onMicrofono}
        aria-label={
          grabando
            ? "Terminar y enviar nota de voz"
            : hayTexto
              ? "Enviar mensaje"
              : "Grabar nota de voz"
        }
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-white transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--wa-header)] ${
          grabando ? "bg-[#e02f2f]" : "bg-[var(--wa-accion)]"
        }`}
      >
        {grabando ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
            <rect x="5" y="5" width="14" height="14" rx="2" />
          </svg>
        ) : hayTexto ? (
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
