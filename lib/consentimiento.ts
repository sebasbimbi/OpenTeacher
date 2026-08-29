/**
 * Registro de consentimiento para grabar un aula.
 *
 * Grabar una clase es grabar menores de edad. La Ley 29733 trata los datos
 * de menores como sensibles, asi que el consentimiento no es un checkbox
 * decorativo: se declara que se graba, para que, cuanto se guarda y quien
 * lo ve, y queda registrado quien lo autorizo y cuando.
 *
 * Se persiste junto a la sesion. Sin un registro completo no existe el
 * boton de grabar.
 */

export interface Consentimiento {
  institucion: string;
  aula: string;
  fecha: string;
  responsable: string;
  /** La direccion del colegio autorizo la grabacion. */
  colegio: boolean;
  /** Las familias fueron informadas y dieron su consentimiento. */
  familias: boolean;
  /** Se aviso a los estudiantes, en voz alta, antes de empezar. */
  estudiantes: boolean;
  /** Cuando se registro, en ISO. Lo pone el sistema, no el usuario. */
  otorgadoEn: string;
}

export const CONSENTIMIENTO_VACIO: Consentimiento = {
  institucion: "",
  aula: "",
  fecha: "",
  responsable: "",
  colegio: false,
  familias: false,
  estudiantes: false,
  otorgadoEn: "",
};

/**
 * Un consentimiento vale solo si estan los cuatro datos Y las tres
 * confirmaciones. Si falta una sola cosa, no hay boton de grabar.
 */
export function consentimientoCompleto(c: Consentimiento): boolean {
  const textos = [c.institucion, c.aula, c.fecha, c.responsable];
  if (textos.some((t) => t.trim().length === 0)) return false;
  return c.colegio && c.familias && c.estudiantes;
}

/** Que falta, en palabras, para poder decirselo al docente. */
export function faltantes(c: Consentimiento): string[] {
  const falta: string[] = [];
  if (!c.institucion.trim()) falta.push("la institución educativa");
  if (!c.aula.trim()) falta.push("el aula");
  if (!c.fecha.trim()) falta.push("la fecha");
  if (!c.responsable.trim()) falta.push("quién autoriza");
  if (!c.colegio) falta.push("la autorización del colegio");
  if (!c.familias) falta.push("el consentimiento de las familias");
  if (!c.estudiantes) falta.push("el aviso a los estudiantes");
  return falta;
}

const CLAVE = "opened.consentimiento";

export function guardarConsentimiento(c: Consentimiento): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(c));
  } catch {
    // Modo privado o almacenamiento lleno. El consentimiento sigue valiendo
    // en memoria para esta sesion; solo se pierde al recargar.
  }
}

export function leerConsentimiento(): Consentimiento | null {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return null;
    const c = { ...CONSENTIMIENTO_VACIO, ...JSON.parse(crudo) } as Consentimiento;
    return consentimientoCompleto(c) ? c : null;
  } catch {
    return null;
  }
}

export function borrarConsentimiento(): void {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    // Nada que hacer: si no se puede escribir, tampoco quedo guardado.
  }
}
