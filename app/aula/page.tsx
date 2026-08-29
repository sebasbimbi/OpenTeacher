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

import { useEffect, useState } from "react";
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
        OpenEd
      </p>
      <h1 className="text-[28px] font-semibold leading-tight tracking-tight sm:text-[34px]">
        Grabacion de aula
      </h1>
      <p className="mt-2 max-w-[38rem] text-[15px] leading-relaxed text-[#9fb0b9]">
        Graba la clase completa y OpenEd extrae las incidencias solo. La docente
        no tiene que reportar nada ni acordarse de nada al final del dia.
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
          Queda guardado junto a la sesion. Es la constancia de que este colegio
          y estas familias autorizaron esta grabacion en particular.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Institucion educativa" placeholder="IE 1234 Jose Carlos Mariategui" {...campo("institucion")} />
          <Campo etiqueta="Aula" placeholder="4to B" {...campo("aula")} />
          <Campo etiqueta="Fecha" tipo="date" {...campo("fecha")} />
          <Campo etiqueta="Quien autoriza" placeholder="Nombre y cargo" {...campo("responsable")} />
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Casilla {...casilla("colegio")}>
            La direccion del colegio autorizo grabar esta clase.
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
            Todavia falta {falta.join(", ")}. Sin eso completo no se puede grabar.
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
    ["Que se graba", "El audio del aula durante la clase. Solo audio, nunca video ni imagen."],
    ["Para que", "Detectar incidencias de convivencia y devolverle a la docente un reporte por alumno y por aula."],
    ["Donde queda", "En este dispositivo. El audio no se sube a ningun servidor de OpenEd."],
    ["Cuanto se guarda", "Hasta que se borre. Hay un boton de borrar siempre a la mano y borra el audio junto con la sesion."],
    ["Quien lo ve", "La docente que graba y quien ella decida. Nadie mas tiene acceso."],
    ["Que NO se hace", "No se identifica a ningun estudiante por su voz ni se le pone nombre a quien habla."],
  ];

  return (
    <section className="rounded-xl border border-[#22323a] bg-[#152229] p-5 sm:p-6">
      <h2 className="mb-1 text-[17px] font-semibold">Antes de grabar, esto es lo que pasa</h2>
      <p className="mb-5 text-[14px] leading-relaxed text-[#9fb0b9]">
        En esta aula hay menores de edad. La Ley 29733 trata sus datos como
        sensibles, asi que esto se declara antes y no despues.
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

function Consola({
  consentimiento,
  onRevocar,
}: {
  consentimiento: Consentimiento;
  onRevocar: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 pb-12">
      <section className="rounded-xl border border-[#1f4d42] bg-[#10261f] p-5">
        <h2 className="mb-3 text-[15px] font-semibold text-[#7fd4c0]">
          Permiso registrado
        </h2>
        <dl className="grid gap-x-6 gap-y-2 text-[14px] sm:grid-cols-2">
          <Dato titulo="Institucion" valor={consentimiento.institucion} />
          <Dato titulo="Aula" valor={consentimiento.aula} />
          <Dato titulo="Fecha" valor={consentimiento.fecha} />
          <Dato titulo="Autoriza" valor={consentimiento.responsable} />
        </dl>
        <p className="mt-3 text-[13px] text-[#6f9a8e]">
          Registrado el {new Date(consentimiento.otorgadoEn).toLocaleString("es-PE")}
        </p>
      </section>

      <section className="rounded-xl border border-[#22323a] bg-[#152229] p-5">
        <h2 className="text-[17px] font-semibold">Grabar la clase</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#9fb0b9]">
          En construccion. Aqui van el boton de grabar, el aviso permanente
          visible desde el fondo del aula, y la subida de un audio ya grabado.
        </p>
      </section>

      <section className="border-t border-[#22323a] pt-6">
        <button
          type="button"
          onClick={onRevocar}
          className="rounded-lg border border-[#5a2f2f] px-5 py-3 text-[15px] font-medium text-[#f2a08f] transition-colors hover:bg-[#2a1717] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2a08f]"
        >
          Borrar la sesion y su audio
        </button>
        <p className="mt-3 max-w-[34rem] text-[13px] leading-relaxed text-[#7d8f99]">
          Borra el permiso registrado y todo el audio de este dispositivo. No se
          puede deshacer, y esa es la idea.
        </p>
      </section>
    </div>
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
