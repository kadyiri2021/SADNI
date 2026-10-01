import { supabase } from "@/integrations/supabase/client";

export type EstadoTurno = "en_espera" | "en_atencion" | "atendido";

export interface Turno {
  id: string;
  numero: number;
  nombre: string;
  apellido_inicial: string;
  servicio: string;
  consultorio: string;
  medico: string | null;
  estado: EstadoTurno;
  llamado_at: string | null;
  atendido_at: string | null;
  created_at: string;
}

export interface NuevoTurnoInput {
  nombre: string;
  apellido: string;
  servicio: string;
  medico?: string | null;
}

export const SERVICIOS = [
  "Medicina General",
  "Cardiología",
  "Pediatría",
  "Traumatología",
  "Dermatología",
  "Odontología",
] as const;

const CONSULTORIO_POR_SERVICIO: Record<string, string> = {
  "Medicina General": "Consultorio 3",
  Cardiología: "Consultorio 2",
  Pediatría: "Consultorio 1",
  Traumatología: "Consultorio 4",
  Dermatología: "Consultorio 5",
  Odontología: "Consultorio 2",
};

const MEDICO_POR_SERVICIO: Record<string, string> = {
  "Medicina General": "Dra. Fuentes",
  Cardiología: "Dr. Herrera",
  Pediatría: "Dra. Quispe",
  Traumatología: "Dr. Salazar",
  Dermatología: "Dra. Rojas",
  Odontología: "Dr. Mendoza",
};

export function consultorioPara(servicio: string): string {
  return CONSULTORIO_POR_SERVICIO[servicio] ?? "Consultorio 3";
}

export function medicoPara(servicio: string): string {
  return MEDICO_POR_SERVICIO[servicio] ?? "Dra. Fuentes";
}

export const SEED_TURNOS: Omit<Turno, "id" | "created_at" | "llamado_at" | "atendido_at">[] = [
  { numero: 62, nombre: "María", apellido_inicial: "R.", servicio: "Medicina General", consultorio: "Consultorio 3", medico: "Dra. Fuentes", estado: "en_atencion" },
  { numero: 63, nombre: "Carlos", apellido_inicial: "M.", servicio: "Cardiología", consultorio: "Consultorio 2", medico: "Dr. Herrera", estado: "en_espera" },
  { numero: 64, nombre: "Lucía", apellido_inicial: "P.", servicio: "Pediatría", consultorio: "Consultorio 1", medico: "Dra. Quispe", estado: "en_espera" },
  { numero: 65, nombre: "Jorge", apellido_inicial: "T.", servicio: "Traumatología", consultorio: "Consultorio 4", medico: "Dr. Salazar", estado: "en_espera" },
  { numero: 66, nombre: "Ana", apellido_inicial: "V.", servicio: "Medicina General", consultorio: "Consultorio 3", medico: "Dra. Fuentes", estado: "en_espera" },
  { numero: 67, nombre: "Pedro", apellido_inicial: "S.", servicio: "Dermatología", consultorio: "Consultorio 5", medico: "Dra. Rojas", estado: "en_espera" },
  { numero: 68, nombre: "Rosa", apellido_inicial: "D.", servicio: "Odontología", consultorio: "Consultorio 2", medico: "Dr. Mendoza", estado: "en_espera" },
  { numero: 69, nombre: "Luis", apellido_inicial: "C.", servicio: "Medicina General", consultorio: "Consultorio 3", medico: "Dra. Fuentes", estado: "en_espera" },
  { numero: 70, nombre: "Elena", apellido_inicial: "G.", servicio: "Cardiología", consultorio: "Consultorio 2", medico: "Dr. Herrera", estado: "en_espera" },
  { numero: 71, nombre: "Miguel", apellido_inicial: "A.", servicio: "Pediatría", consultorio: "Consultorio 1", medico: "Dra. Quispe", estado: "en_espera" },
  { numero: 72, nombre: "Carmen", apellido_inicial: "F.", servicio: "Medicina General", consultorio: "Consultorio 3", medico: "Dra. Fuentes", estado: "en_espera" },
  { numero: 73, nombre: "Diego", apellido_inicial: "H.", servicio: "Traumatología", consultorio: "Consultorio 4", medico: "Dr. Salazar", estado: "en_espera" },
  { numero: 74, nombre: "Sofía", apellido_inicial: "B.", servicio: "Dermatología", consultorio: "Consultorio 5", medico: "Dra. Rojas", estado: "en_espera" },
  { numero: 75, nombre: "Raúl", apellido_inicial: "L.", servicio: "Odontología", consultorio: "Consultorio 2", medico: "Dr. Mendoza", estado: "en_espera" },
  { numero: 76, nombre: "Patricia", apellido_inicial: "N.", servicio: "Medicina General", consultorio: "Consultorio 3", medico: "Dra. Fuentes", estado: "en_espera" },
];

export async function fetchTurnos(): Promise<Turno[]> {
  const { data, error } = await supabase
    .from("turnos")
    .select("*")
    .order("numero", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Turno[];
}

export async function addTurno(input: NuevoTurnoInput): Promise<void> {
  const { data } = await supabase
    .from("turnos")
    .select("numero")
    .order("numero", { ascending: false })
    .limit(1);
  const numero = (data?.[0]?.numero ?? 0) + 1;
  const { error } = await supabase.from("turnos").insert({
    numero,
    nombre: input.nombre.trim(),
    apellido_inicial: `${input.apellido.trim().charAt(0).toUpperCase()}.`,
    servicio: input.servicio,
    consultorio: consultorioPara(input.servicio),
    medico: medicoPara(input.servicio),
    estado: "en_espera" as const,
  });
  if (error) throw error;
}

export async function llamarSiguiente(): Promise<Turno | null> {
  const { data: enAtencion } = await supabase
    .from("turnos")
    .select("id")
    .eq("estado", "en_atencion");
  if (enAtencion?.length) {
    const { error } = await supabase
      .from("turnos")
      .update({ estado: "atendido", atendido_at: new Date().toISOString() })
      .in("id", enAtencion.map((t) => t.id));
    if (error) throw error;
  }
  const { data: siguiente } = await supabase
    .from("turnos")
    .select("id")
    .eq("estado", "en_espera")
    .order("numero", { ascending: true })
    .limit(1);
  if (!siguiente?.length) return null;
  const idSiguiente = siguiente[0]!.id;
  const { data: llamado, error } = await supabase
    .from("turnos")
    .update({ estado: "en_atencion", llamado_at: new Date().toISOString() })
    .eq("id", idSiguiente)
    .select()
    .single();
  if (error) throw error;
  return llamado as Turno;
}

export async function finalizarTurno(id: string): Promise<void> {
  const { error } = await supabase
    .from("turnos")
    .update({ estado: "atendido", atendido_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function quitarTurno(id: string): Promise<void> {
  const { error } = await supabase.from("turnos").delete().eq("id", id);
  if (error) throw error;
}

export async function reiniciarDemo(): Promise<void> {
  const { error: del } = await supabase.from("turnos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (del) throw del;
  const { error: ins } = await supabase
    .from("turnos")
    .insert(SEED_TURNOS.map((t) => ({ ...t })));
  if (ins) throw ins;
}

export function formatNumero(n: number): string {
  return String(n).padStart(3, "0");
}

export function nombrePublico(t: Turno): string {
  return `${t.nombre} ${t.apellido_inicial}`;
}
