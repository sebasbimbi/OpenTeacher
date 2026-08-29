"use client";

/**
 * /aula: captura ambiental de una clase.
 *
 * Ruta separada del simulador de WhatsApp a proposito. El chat es la
 * docente reportando lo que recuerda; esto es la clase entera, de donde
 * salen los patrones que nadie reporta.
 *
 * REGLA DURA: aqui se graban menores de edad. El boton de grabar no se
 * RENDERIZA hasta que el consentimiento esta completo. Deshabilitado no
 * sirve: un boton gris igual invita a buscarle la vuelta.
 */

import { useCallback, useEffect, useState } from "react";
import { formatearDuracion } from "@/lib/audioErrores";
import { INTERVALO_DEFECTO_MS, useGrabadoraLarga } from "@/lib/grabadoraLarga";
import { borrarSesion, borrarTodo, leerSegmentos, ultimaSesion, type Segmento, type Sesion } from "@/lib/segmentos";
import {
  CONSENTIMIENTO_VACIO,
  borrarConsentimiento,
  consentimientoCompleto,
  faltantes,
  guardarConsentimiento,
  leerConsentimiento,
  type Consentimiento,
} from "@/lib/consentimiento";

export default function Aula() {
  const [consentimiento, setConsentimiento] = useState<Consentimiento | null>(null);
  const [cargado, setCargado] = useState(false);

  // El consentimiento guardado se lee despues del montaje: localStorage no
  // existe en el servidor y leerlo antes rompe la hidratacion.
  useEffect(() => {
    setConsentimiento(leerConsentimiento());
    setCargado(true);
  }, []);

  function otorgar(c: Consentimiento) {
    const conSello = { ...c, otorgadoEn: new Date().toISOString() };
    guardarConsentimiento(conSello);
    setConsentimiento(conSello);
  }

  function revocar() {
    borrarConsentimiento();
    setConsentimiento(null);
  }

  if (!cargado) return <Cargando />;

  return (
    <main className="min-h-dvh bg-[#0f1a1f] text-[#e8eef1]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[46rem] flex-col px-5 py-8 sm:px-8">
        <Encabezado />
        {consentimiento ? (
          <Consola consentimiento={consentimiento} onRevocar={revocar} />
        ) : (
          <Puerta onOtorgar={otorgar} />
        )}
      </div>
    </main>
  );
}

function Cargando() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#0f1a1f] text-[#7d8f99]">
      <p className="text-[15px]">Cargando...</p>
    </main>
  );
}

function Encabezado() {
  return (
    <header className="mb-8 border-b border-[#22323a] pb-6">
      <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#4db6a4]">
        OpenTeacher
      </p>
      <h1 className="text-[28px] font-semibold leading-tight tracking-tight sm:text-[34px]">
        Grabación de aula
      </h1>
      <p className="mt-2 max-w-[38rem] text-[15px] leading-relaxed text-[#9fb0b9]">
        Graba la clase completa y OpenTeacher extrae las incidencias solo. La docente
        no tiene que reportar nada ni acordarse de nada al final del día.
      </p>
    </header>
  );
}

/* ------------------------------------------------------------------ puerta */

function Puerta({ onOtorgar }: { onOtorgar: (c: Consentimiento) => void }) {
  const [c, setC] = useState<Consentimiento>(() => ({
    ...CONSENTIMIENTO_VACIO,
    fecha: new Date().toISOString().slice(0, 10),
  }));
  const [intentado, setIntentado] = useState(false);

  const completo = consentimientoCompleto(c);
  const falta = faltantes(c);

  const campo = (k: keyof Consentimiento) => ({
    value: String(c[k]),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setC({ ...c, [k]: e.target.value }),
  });

  const casilla = (k: "colegio" | "familias" | "estudiantes") => ({
    checked: c[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setC({ ...c, [k]: e.target.checked }),
  });

  return (
    <div className="flex flex-col gap-8 pb-12">
      <Declaracion />

      <section>
        <h2 className="mb-1 text-[17px] font-semibold">Registro del permiso</h2>
        <p className="mb-5 text-[14px] leading-relaxed text-[#9fb0b9]">
          Queda guardado junto a la sesión. Es la constancia de que este colegio
          y estas familias autorizaron esta grabación en particular.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Institución educativa" placeholder="IE 1234 José Carlos Mariátegui" {...campo("institucion")} />
          <Campo etiqueta="Aula" placeholder="4to B" {...campo("aula")} />
          <Campo etiqueta="Fecha" tipo="date" {...campo("fecha")} />
          <Campo etiqueta="Quién autoriza" placeholder="Nombre y cargo" {...campo("responsable")} />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Casilla {...casilla("colegio")}>
            La dirección del colegio autorizó grabar esta clase.
          </Casilla>
          <Casilla {...casilla("familias")}>
            Las familias fueron informadas y dieron su consentimiento.
          </Casilla>
          <Casilla {...casilla("estudiantes")}>
            Voy a avisar en voz alta a los estudiantes antes de empezar.
          </Casilla>
        </div>
      </section>

      <section className="border-t border-[#22323a] pt-6">
        {/*
          El boton de grabar no vive aqui. Aqui solo se registra el permiso.
          Solo cuando el registro esta completo aparece la consola con el
          boton, en la otra pantalla.
        */}
        <button
          type="button"
          onClick={() => (completo ? onOtorgar(c) : setIntentado(true))}
          className="w-full rounded-lg bg-[#00a884] px-6 py-4 text-[16px] font-semibold text-[#06231d] transition-colors hover:bg-[#0abd97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4db6a4] sm:w-auto"
        >
          Registrar el permiso y continuar
        </button>

        {intentado && !completo && (
          <p role="alert" className="mt-4 text-[14px] leading-relaxed text-[#f2a08f]">
            Todavía falta {falta.join(", ")}. Sin eso completo no se puede grabar.
          </p>
        )}
        {!completo && !intentado && (
          <p className="mt-4 text-[13px] text-[#7d8f99]">
            Faltan {falta.length} {falta.length === 1 ? "dato" : "datos"} por completar.
          </p>
        )}
      </section>
    </div>
  );
}

function Declaracion() {
  const filas = [
    ["Qué se graba", "El audio del aula durante la clase. Solo audio, nunca video ni imagen."],
    ["Para qué", "Detectar incidencias de convivencia y devolverle a la docente un reporte por alumno y por aula."],
    ["Dónde queda", "En este dispositivo. El audio no se sube a ningún servidor de OpenTeacher."],
    ["Cuánto se guarda", "Hasta que se borre. Hay un botón de borrar siempre a la mano y borra el audio junto con la sesión."],
    ["Quién lo ve", "La docente que graba y quien ella decida. Nadie más tiene acceso."],
    ["Qué NO se hace", "No se identifica a ningún estudiante por su voz ni se le pone nombre a quien habla."],
  ];

  return (
    <section className="rounded-xl border border-[#22323a] bg-[#152229] p-5 sm:p-6">
      <h2 className="mb-1 text-[17px] font-semibold">Antes de grabar, esto es lo que pasa</h2>
      <p className="mb-5 text-[14px] leading-relaxed text-[#9fb0b9]">
        En esta aula hay menores de edad. La Ley 29733 trata sus datos como
        sensibles, así que esto se declara antes y no después.
      </p>
      <dl className="flex flex-col gap-3.5">
        {filas.map(([titulo, texto]) => (
          <div key={titulo} className="grid gap-0.5 sm:grid-cols-[11rem_1fr] sm:gap-4">
            <dt className="text-[14px] font-semibold text-[#cfdae0]">{titulo}</dt>
            <dd className="text-[14px] leading-relaxed text-[#9fb0b9]">{texto}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Campo({
  etiqueta,
  tipo = "text",
  placeholder,
  value,
  onChange,
}: {
  etiqueta: string;
  tipo?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-[#cfdae0]">{etiqueta}</span>
      <input
        type={tipo}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="rounded-lg border border-[#2b3d46] bg-[#0b151a] px-3.5 py-3 text-[16px] text-[#e8eef1] outline-none placeholder:text-[#5d707a] focus:border-[#4db6a4] focus:ring-1 focus:ring-[#4db6a4]"
      />
    </label>
  );
}

function Casilla({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-relaxed text-[#cfdae0]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[#00a884]"
      />
      <span>{children}</span>
    </label>
  );
}

/* ------------------------------------------------------------------ consola */

/** Minutos a m:ss para duraciones largas, con horas cuando hace falta. */
function largo(ms: number): string {
  const total = Math.round(ms / 1000);
  if (total < 3600) return formatearDuracion(ms);
  const h = Math.floor(total / 3600);
  return `${h}:${String(Math.floor((total % 3600) / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function Consola({
  consentimiento,
  onRevocar,
}: {
  consentimiento: Consentimiento;
  onRevocar: () => void;
}) {
  const [intervaloMs, setIntervaloMs] = useState(INTERVALO_DEFECTO_MS);
  const [previa, setPrevia] = useState<{ sesion: Sesion; segmentos: Segmento[] } | null>(null);

  // Gancho de prueba: ?seg=5 rota cada 5 segundos en vez de cada 5 minutos.
  // Sin esto, verificar la rotacion cuesta 15 minutos de reloj por corrida.
  useEffect(() => {
    const seg = Number(new URLSearchParams(location.search).get("seg"));
    if (Number.isFinite(seg) && seg > 0) setIntervaloMs(seg * 1000);
  }, []);

  // Una sesion anterior en el dispositivo se retoma al recargar: es lo que
  // hace que cerrar la pestana en el minuto 40 no pierda nada.
  const recargarPrevia = useCallback(async () => {
    try {
      const sesion = await ultimaSesion();
      if (!sesion) return setPrevia(null);
      setPrevia({ sesion, segmentos: await leerSegmentos(sesion.id) });
    } catch {
      setPrevia(null);
    }
  }, []);

  const grabadora = useGrabadoraLarga({ intervaloMs });
  const { grabando, segmentos, capturadoMs, transcurridoMs, huecoMs, hayHueco } = grabadora;

  useEffect(() => {
    if (!grabando) void recargarPrevia();
  }, [grabando, recargarPrevia]);

  async function empezar() {
    await grabadora.iniciar({
      institucion: consentimiento.institucion,
      aula: consentimiento.aula,
      fecha: consentimiento.fecha,
      responsable: consentimiento.responsable,
    });
  }

  async function borrarTodoYRevocar() {
    try {
      await borrarTodo();
    } catch {
      // Si IndexedDB no responde igual se revoca el permiso: sin permiso no
      // se puede volver a grabar, que es lo que importa.
    }
    setPrevia(null);
    onRevocar();
  }

  async function borrarPrevia() {
    if (!previa) return;
    try {
      await borrarSesion(previa.sesion.id);
    } catch {
      // idem
    }
    await recargarPrevia();
  }

  const mostrar = grabando || segmentos.length > 0 ? { segmentos, capturadoMs } : null;

  return (
    <div className="flex flex-col gap-6 pb-12">
      {grabando && <AvisoGrabando transcurridoMs={transcurridoMs} />}

      <section className="rounded-xl border border-[#1f4d42] bg-[#10261f] p-5">
        <h2 className="mb-3 text-[15px] font-semibold text-[#7fd4c0]">Permiso registrado</h2>
        <dl className="grid gap-x-6 gap-y-2 text-[14px] sm:grid-cols-2">
          <Dato titulo="Institución" valor={consentimiento.institucion} />
          <Dato titulo="Aula" valor={consentimiento.aula} />
          <Dato titulo="Fecha" valor={consentimiento.fecha} />
          <Dato titulo="Autoriza" valor={consentimiento.responsable} />
        </dl>
        <p className="mt-3 text-[13px] text-[#6f9a8e]">
          Registrado el {new Date(consentimiento.otorgadoEn).toLocaleString("es-PE")}
        </p>
      </section>

      {grabadora.error && (
        <p role="alert" className="rounded-lg border border-[#5a2f2f] bg-[#2a1717] px-4 py-3 text-[14px] leading-relaxed text-[#f2a08f]">
          {grabadora.error}
        </p>
      )}
      {grabadora.aviso && !grabadora.error && (
        <p role="status" className="rounded-lg border border-[#5c4a1f] bg-[#2a2413] px-4 py-3 text-[14px] leading-relaxed text-[#e8c98a]">
          {grabadora.aviso}
        </p>
      )}

      <section className="rounded-xl border border-[#22323a] bg-[#152229] p-5">
        <h2 className="text-[17px] font-semibold">Grabar la clase</h2>
        <p className="mt-2 max-w-[36rem] text-[14px] leading-relaxed text-[#9fb0b9]">
          El audio se corta en segmentos de {largo(intervaloMs)} y cada uno se guarda
          apenas cierra. Si se cierra la pestaña a mitad de la clase, lo grabado
          hasta ahí no se pierde.
        </p>

        <div className="mt-5">
          {grabando ? (
            <button
              type="button"
              onClick={grabadora.detener}
              className="w-full rounded-lg bg-[#e02f2f] px-6 py-4 text-[16px] font-semibold text-white transition-colors hover:bg-[#f04545] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2a08f] sm:w-auto"
            >
              Terminar la clase
            </button>
          ) : (
            <button
              type="button"
              onClick={empezar}
              className="w-full rounded-lg bg-[#00a884] px-6 py-4 text-[16px] font-semibold text-[#06231d] transition-colors hover:bg-[#0abd97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4db6a4] sm:w-auto"
            >
              Empezar a grabar la clase
            </button>
          )}
        </div>

        {mostrar && (
          <Resumen
            segmentos={mostrar.segmentos}
            capturadoMs={mostrar.capturadoMs}
            transcurridoMs={transcurridoMs}
            huecoMs={huecoMs}
            hayHueco={hayHueco}
            grabando={grabando}
          />
        )}
      </section>

      {previa && !grabando && segmentos.length === 0 && previa.segmentos.length > 0 && (
        <SesionPrevia previa={previa} onBorrar={borrarPrevia} />
      )}

      <section className="border-t border-[#22323a] pt-6">
        <button
          type="button"
          onClick={borrarTodoYRevocar}
          className="rounded-lg border border-[#5a2f2f] px-5 py-3 text-[15px] font-medium text-[#f2a08f] transition-colors hover:bg-[#2a1717] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2a08f]"
        >
          Borrar la sesión y su audio
        </button>
        <p className="mt-3 max-w-[34rem] text-[13px] leading-relaxed text-[#7d8f99]">
          Borra el permiso registrado y todo el audio de este dispositivo. No se
          puede deshacer, y esa es la idea.
        </p>
      </section>
    </div>
  );
}

/**
 * Aviso permanente mientras graba. Tiene que leerse desde el fondo del aula,
 * asi que va arriba de todo, en rojo, con texto grande y punto pulsante.
 */
function AvisoGrabando({ transcurridoMs }: { transcurridoMs: number }) {
  return (
    <div
      role="status"
      className="sticky top-0 z-10 -mx-5 flex items-center gap-4 bg-[#c62828] px-5 py-4 text-white shadow-lg sm:-mx-8 sm:px-8"
    >
      <span className="h-4 w-4 shrink-0 animate-pulse rounded-full bg-white" aria-hidden />
      <span className="text-[20px] font-bold uppercase tracking-wide sm:text-[24px]">
        Grabando
      </span>
      <span className="ml-auto text-[20px] font-semibold tabular-nums sm:text-[24px]">
        {largo(transcurridoMs)}
      </span>
    </div>
  );
}

function Resumen({
  segmentos,
  capturadoMs,
  transcurridoMs,
  huecoMs,
  hayHueco,
  grabando,
}: {
  segmentos: Segmento[];
  capturadoMs: number;
  transcurridoMs: number;
  huecoMs: number;
  hayHueco: boolean;
  grabando: boolean;
}) {
  return (
    <div className="mt-6 border-t border-[#22323a] pt-5">
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Metrica titulo="Segmentos guardados" valor={String(segmentos.length)} />
        <Metrica titulo="Audio capturado" valor={largo(capturadoMs)} />
        <Metrica titulo="Reloj de la clase" valor={largo(transcurridoMs)} />
      </dl>

      {hayHueco && (
        <p className="mt-4 rounded-lg border border-[#5c4a1f] bg-[#2a2413] px-4 py-3 text-[14px] leading-relaxed text-[#e8c98a]">
          Hay {largo(huecoMs)} sin audio entre el inicio y ahora. La clase corrió más
          tiempo del que se alcanzó a grabar, casi siempre porque la pestaña quedó en
          segundo plano. El reporte va a usar el audio capturado, no el reloj.
        </p>
      )}

      {segmentos.length > 0 && (
        <ol className="mt-4 flex flex-col gap-1.5">
          {segmentos.map((s) => (
            <li
              key={s.id}
              className="flex items-baseline gap-3 rounded-md bg-[#0f1b21] px-3 py-2 text-[13px]"
            >
              <span className="font-semibold tabular-nums text-[#7fd4c0]">
                {largo(s.inicioMs)}
              </span>
              <span className="text-[#9fb0b9]">dura {largo(s.duracionMs)}</span>
              <span className="ml-auto text-[#6f8089]">
                {(s.blob.size / 1024).toFixed(0)} KB
              </span>
            </li>
          ))}
        </ol>
      )}

      {grabando && (
        <p className="mt-3 text-[13px] text-[#7d8f99]">
          El segmento en curso aparece cuando cierre.
        </p>
      )}
    </div>
  );
}

function Metrica({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[12px] uppercase tracking-wide text-[#6f8089]">{titulo}</dt>
      <dd className="text-[22px] font-semibold tabular-nums text-[#e8eef1]">{valor}</dd>
    </div>
  );
}

function SesionPrevia({
  previa,
  onBorrar,
}: {
  previa: { sesion: Sesion; segmentos: Segmento[] };
  onBorrar: () => void;
}) {
  const total = previa.segmentos.reduce((suma, s) => suma + s.duracionMs, 0);
  return (
    <section className="rounded-xl border border-[#22323a] bg-[#152229] p-5">
      <h2 className="text-[17px] font-semibold">Clase anterior recuperada</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-[#9fb0b9]">
        {previa.sesion.aula} el {previa.sesion.fecha}. Quedaron{" "}
        {previa.segmentos.length}{" "}
        {previa.segmentos.length === 1 ? "segmento" : "segmentos"} con {largo(total)} de
        audio guardado en este dispositivo.
      </p>
      <button
        type="button"
        onClick={onBorrar}
        className="mt-4 rounded-lg border border-[#3a4a52] px-4 py-2.5 text-[14px] text-[#cfdae0] transition-colors hover:bg-[#1c2b33] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4db6a4]"
      >
        Borrar esta clase
      </button>
    </section>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[12px] uppercase tracking-wide text-[#6f9a8e]">{titulo}</dt>
      <dd className="text-[15px] text-[#dbe7ea]">{valor}</dd>
    </div>
  );
}
