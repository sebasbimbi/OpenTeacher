"use client";

/**
 * Grabacion de audio en el navegador con MediaRecorder.
 *
 * Toggle: un toque empieza, otro toque termina. Mas limpio que mantener
 * pulsado en proyector (no depende de que el mouse siga presionado) y
 * funciona igual en movil.
 *
 * Los tres modos de falla que importan (permiso denegado, microfono
 * ocupado, grabacion de menos de un segundo) degradan con mensaje y
 * dejan la pagina usable. Nunca se cuelga: pase lo que pase se sueltan
 * las pistas del stream y el estado vuelve a inactivo.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { DURACION_MINIMA_MS, mensajeDeErrorAudio } from "./audioErrores";

export interface Grabacion {
  blob: Blob;
  url: string;
  duracionMs: number;
  mimeType: string;
}

/**
 * Orden de preferencia. Chrome y Edge dan webm/opus, Safari da mp4/aac.
 * Whisper acepta los cuatro directo, sin conversion.
 */
const TIPOS_PREFERIDOS = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
];

export function elegirMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return TIPOS_PREFERIDOS.find((tipo) => MediaRecorder.isTypeSupported(tipo));
}

export function useGrabadora() {
  const [grabando, setGrabando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcurridoMs, setTranscurridoMs] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trozosRef = useRef<Blob[]>([]);
  const inicioRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resolverRef = useRef<((g: Grabacion | null) => void) | null>(null);
  const descartarRef = useRef(false);

  const soltarStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((pista) => pista.stop());
    streamRef.current = null;
    recorderRef.current = null;
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  // Si el componente se desmonta a mitad de una grabacion, no dejamos el
  // microfono tomado ni el indicador del navegador encendido.
  useEffect(() => soltarStream, [soltarStream]);

  const iniciar = useCallback(async () => {
    setError(null);

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError(
        "Este navegador no permite grabar audio aquí. Necesita una conexión segura (https). Escríbeme el mensaje.",
      );
      return false;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      setError(mensajeDeErrorAudio(err));
      return false;
    }

    let recorder: MediaRecorder;
    try {
      const mimeType = elegirMimeType();
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    } catch (err) {
      stream.getTracks().forEach((pista) => pista.stop());
      setError(mensajeDeErrorAudio(err));
      return false;
    }

    trozosRef.current = [];
    descartarRef.current = false;
    inicioRef.current = Date.now();

    recorder.ondataavailable = (evento) => {
      if (evento.data.size > 0) trozosRef.current.push(evento.data);
    };

    recorder.onerror = () => {
      soltarStream();
      setGrabando(false);
      setTranscurridoMs(0);
      setError("Se cortó la grabación. Vuelve a intentar o escríbeme el mensaje.");
      resolverRef.current?.(null);
      resolverRef.current = null;
    };

    recorder.onstop = () => {
      const duracionMs = Date.now() - inicioRef.current;
      const mimeType = recorder.mimeType || "audio/webm";
      const blob = new Blob(trozosRef.current, { type: mimeType });

      soltarStream();
      setGrabando(false);
      setTranscurridoMs(0);

      const resolver = resolverRef.current;
      resolverRef.current = null;

      if (descartarRef.current) {
        resolver?.(null);
        return;
      }
      if (duracionMs < DURACION_MINIMA_MS || blob.size === 0) {
        setError("Muy corto. Mantén la grabación al menos un segundo.");
        resolver?.(null);
        return;
      }

      resolver?.({ blob, url: URL.createObjectURL(blob), duracionMs, mimeType });
    };

    streamRef.current = stream;
    recorderRef.current = recorder;
    recorder.start();
    setGrabando(true);
    setTranscurridoMs(0);
    tickRef.current = setInterval(() => {
      setTranscurridoMs(Date.now() - inicioRef.current);
    }, 200);

    return true;
  }, [soltarStream]);

  const terminar = useCallback(
    (descartar: boolean) =>
      new Promise<Grabacion | null>((resolve) => {
        const recorder = recorderRef.current;
        if (!recorder || recorder.state === "inactive") {
          soltarStream();
          setGrabando(false);
          setTranscurridoMs(0);
          resolve(null);
          return;
        }
        descartarRef.current = descartar;
        resolverRef.current = resolve;
        recorder.stop();
      }),
    [soltarStream],
  );

  const detener = useCallback(() => terminar(false), [terminar]);
  const cancelar = useCallback(() => terminar(true), [terminar]);

  return { grabando, error, setError, transcurridoMs, iniciar, detener, cancelar };
}
