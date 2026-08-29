"use client";

/**
 * Grabacion larga de una clase, por rotacion de MediaRecorder.
 *
 * POR QUE ROTAR Y NO `recorder.start(timeslice)`:
 * los trozos que emite timeslice despues del primero salen SIN cabecera y no
 * son decodificables por separado. Rotando el recorder cada N minutos, cada
 * segmento sale como un webm completo y valido por si solo. Sin ffmpeg y sin
 * cirugia de cabeceras.
 *
 * UN SOLO getUserMedia: al rotar se para el RECORDER, nunca las pistas del
 * stream. Si se para la pista, el navegador apaga el microfono y el indicador
 * parpadea en cada rotacion, o vuelve a pedir permiso.
 *
 * HONESTIDAD SOBRE LA DURACION: se reporta la suma real de los segmentos
 * capturados, no el reloj de pared. Si el navegador estrangulo los timers en
 * segundo plano, la sesion lo DICE en vez de afirmar 45 minutos que no grabo.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { mensajeDeErrorAudio } from "./audioErrores";
import { elegirMimeType } from "./grabadora";
import {
  guardarSegmento,
  guardarSesion,
  type Segmento,
  type Sesion,
} from "./segmentos";

export const INTERVALO_DEFECTO_MS = 5 * 60 * 1000;

/** Si un segmento dura mucho mas que el intervalo, el navegador lo estrangulo. */
const TOLERANCIA_ESTRANGULAMIENTO = 1.5;
/** Diferencia entre reloj de pared y audio capturado que ya cuenta como hueco. */
const HUECO_MINIMO_MS = 2000;

export interface Opciones {
  intervaloMs?: number;
  /** Se llama apenas cierra cada segmento, para transcribirlo en paralelo. */
  onSegmento?: (segmento: Segmento) => void;
}

export function useGrabadoraLarga({
  intervaloMs = INTERVALO_DEFECTO_MS,
  onSegmento,
}: Opciones = {}) {
  const [grabando, setGrabando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [segmentos, setSegmentos] = useState<Segmento[]>([]);
  const [capturadoMs, setCapturadoMs] = useState(0);
  const [transcurridoMs, setTranscurridoMs] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const sesionRef = useRef<Sesion | null>(null);
  const indiceRef = useRef(0);
  const inicioRef = useRef(0);
  const rotarRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const detenerRef = useRef(false);
  const onSegmentoRef = useRef(onSegmento);
  onSegmentoRef.current = onSegmento;

  const limpiar = useCallback(() => {
    if (rotarRef.current) clearTimeout(rotarRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    rotarRef.current = null;
    tickRef.current = null;
    streamRef.current?.getTracks().forEach((p) => p.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  useEffect(() => limpiar, [limpiar]);

  /**
   * La pestana en segundo plano es lo que de verdad muerde en un aula: el
   * navegador estrangula los timers y la rotacion se desalinea. Se anota el
   * tramo para poder decirlo, no para taparlo.
   */
  useEffect(() => {
    function alCambiarVisibilidad() {
      const sesion = sesionRef.current;
      if (!sesion || !grabando) return;
      if (document.hidden) {
        sesion.interrupciones.push({ desdeEn: Date.now() });
      } else {
        const ultima = sesion.interrupciones[sesion.interrupciones.length - 1];
        if (ultima && ultima.hastaEn === undefined) {
          ultima.hastaEn = Date.now();
          if (ultima.hastaEn - ultima.desdeEn > HUECO_MINIMO_MS) {
            setAviso(
              "La pestana estuvo en segundo plano. El navegador puede haber pausado la grabacion en ese tramo; abajo se ve cuanto audio se capturo de verdad.",
            );
          }
        }
        void guardarSesion(sesion);
      }
    }
    document.addEventListener("visibilitychange", alCambiarVisibilidad);
    return () => document.removeEventListener("visibilitychange", alCambiarVisibilidad);
  }, [grabando]);

  const arrancarSegmento = useCallback(() => {
    const stream = streamRef.current;
    const sesion = sesionRef.current;
    if (!stream || !sesion) return;

    const mimeType = elegirMimeType();
    const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const trozos: Blob[] = [];
    const indice = indiceRef.current++;
    const inicioSeg = Date.now();

    rec.ondataavailable = (e) => {
      if (e.data.size > 0) trozos.push(e.data);
    };

    rec.onerror = () => {
      setError("Se corto la grabacion del aula. Lo grabado hasta ahora esta guardado.");
      detenerRef.current = true;
    };

    rec.onstop = () => {
      const duracionMs = Date.now() - inicioSeg;
      const blob = new Blob(trozos, { type: rec.mimeType || "audio/webm" });

      if (blob.size > 0) {
        const segmento: Segmento = {
          id: `${sesion.id}:${indice}`,
          sesionId: sesion.id,
          indice,
          inicioMs: inicioSeg - inicioRef.current,
          duracionMs,
          mimeType: rec.mimeType || "audio/webm",
          blob,
          estado: "pendiente",
        };
        // Se escribe ANTES de seguir: si la pestana muere aqui, esto ya esta.
        void guardarSegmento(segmento);
        setSegmentos((previos) => [...previos, segmento]);
        setCapturadoMs((ms) => ms + duracionMs);
        onSegmentoRef.current?.(segmento);
      }

      // Un segmento mucho mas largo que el intervalo significa que el
      // navegador estrangulo el timer mientras la pestana estaba oculta.
      if (duracionMs > intervaloMs * TOLERANCIA_ESTRANGULAMIENTO) {
        setAviso(
          "El navegador pauso los temporizadores en algun momento. La duracion real capturada es la que se muestra abajo.",
        );
      }

      if (detenerRef.current) {
        sesion.finEn = Date.now();
        void guardarSesion(sesion);
        limpiar();
        setGrabando(false);
      } else {
        arrancarSegmento();
      }
    };

    rec.start();
    recorderRef.current = rec;
    rotarRef.current = setTimeout(() => {
      if (rec.state === "recording") rec.stop();
    }, intervaloMs);
  }, [intervaloMs, limpiar]);

  const iniciar = useCallback(
    async (datos: Omit<Sesion, "id" | "inicioEn" | "interrupciones">) => {
      setError(null);
      setAviso(null);

      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setError(
          "Este navegador no permite grabar aqui. Necesita una conexion segura (https).",
        );
        return null;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        setError(mensajeDeErrorAudio(err));
        return null;
      }

      // Si el sistema le quita el microfono a la pestana (suspension, otra app
      // que lo toma), la pista termina. Hay que decirlo, no seguir en falso.
      stream.getAudioTracks().forEach((pista) => {
        pista.onended = () => {
          setError(
            "El microfono se desconecto y la grabacion se detuvo. Lo capturado hasta ese momento esta guardado.",
          );
          detenerRef.current = true;
          if (recorderRef.current?.state === "recording") recorderRef.current.stop();
        };
      });

      const sesion: Sesion = {
        ...datos,
        id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        inicioEn: Date.now(),
        interrupciones: [],
      };
      await guardarSesion(sesion);

      streamRef.current = stream;
      sesionRef.current = sesion;
      indiceRef.current = 0;
      inicioRef.current = sesion.inicioEn;
      detenerRef.current = false;
      setSegmentos([]);
      setCapturadoMs(0);
      setTranscurridoMs(0);
      setGrabando(true);

      tickRef.current = setInterval(
        () => setTranscurridoMs(Date.now() - inicioRef.current),
        500,
      );
      arrancarSegmento();
      return sesion;
    },
    [arrancarSegmento],
  );

  const detener = useCallback(() => {
    detenerRef.current = true;
    const rec = recorderRef.current;
    if (rec && rec.state === "recording") {
      if (rotarRef.current) clearTimeout(rotarRef.current);
      rec.stop();
    } else {
      limpiar();
      setGrabando(false);
    }
  }, [limpiar]);

  /**
   * Hueco = lo que paso el reloj menos lo que se capturo de verdad. Es el
   * numero honesto: si da 8 minutos, la clase tiene 8 minutos sin audio.
   */
  const huecoMs = Math.max(0, transcurridoMs - capturadoMs);

  return {
    grabando,
    error,
    aviso,
    segmentos,
    capturadoMs,
    transcurridoMs,
    huecoMs,
    hayHueco: huecoMs > HUECO_MINIMO_MS,
    sesion: sesionRef.current,
    iniciar,
    detener,
    setError,
    setAviso,
  };
}
