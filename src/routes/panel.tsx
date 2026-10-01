import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addTurno,
  fetchTurnos,
  finalizarTurno,
  formatNumero,
  llamarSiguiente,
  medicoPara,
  nombrePublico,
  quitarTurno,
  reiniciarDemo,
  SERVICIOS,
  type NuevoTurnoInput,
} from "@/lib/turnos";

export const Route = createFileRoute("/panel")({
  head: () => ({
    meta: [
      { title: "Panel del Personal — KALDELUZ" },
      {
        name: "description",
        content:
          "Panel para gestionar la cola de la sala de espera del centro de salud KALDELUZ: registrar pacientes, llamar el siguiente turno y finalizar atenciones.",
      },
      { property: "og:title", content: "Panel del Personal — KALDELUZ" },
      {
        property: "og:description",
        content:
          "Registra pacientes, llama el siguiente turno y finaliza atenciones en la sala de espera de KALDELUZ.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PanelPersonal,
});

function PanelPersonal() {
  const queryClient = useQueryClient();
  const { data: turnos = [], isPending } = useQuery({
    queryKey: ["turnos"],
    queryFn: fetchTurnos,
    refetchInterval: 5000,
  });

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [servicio, setServicio] = useState<string>(SERVICIOS[0]);

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["turnos"] });

  const agregar = useMutation({
    mutationFn: (input: NuevoTurnoInput) => addTurno(input),
    onSuccess: () => {
      setNombre("");
      setApellido("");
      invalidar();
    },
  });

  const llamar = useMutation({
    mutationFn: llamarSiguiente,
    onSuccess: invalidar,
  });

  const finalizar = useMutation({
    mutationFn: (id: string) => finalizarTurno(id),
    onSuccess: invalidar,
  });

  const quitar = useMutation({
    mutationFn: (id: string) => quitarTurno(id),
    onSuccess: invalidar,
  });

  const reiniciar = useMutation({
    mutationFn: reiniciarDemo,
    onSuccess: invalidar,
  });

  const enAtencion = turnos.find((t) => t.estado === "en_atencion");
  const enEspera = turnos.filter((t) => t.estado === "en_espera");
  const atendidos = turnos.filter((t) => t.estado === "atendido");

  const puedeRegistrar = nombre.trim().length > 0 && apellido.trim().length > 0;

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!puedeRegistrar || agregar.isPending) return;
    agregar.mutate({ nombre, apellido, servicio, medico: medicoPara(servicio) });
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div
        className="blob blob-brand -top-40 -right-32 size-[480px]"
        style={{ animation: "floaty 16s ease-in-out infinite" }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="glass-card grid size-11 place-items-center rounded-2xl">
              <span className="font-display text-lg font-bold text-primary">K</span>
            </div>
            <div>
              <p className="font-display text-lg font-bold leading-none tracking-tight text-foreground">
                Panel del Personal
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                KALDELUZ · Gestión de turnos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-ghost"
              disabled={reiniciar.isPending}
              onClick={() => reiniciar.mutate()}
            >
              {reiniciar.isPending ? "Reiniciando…" : "Reiniciar demo"}
            </button>
            <Link to="/" className="btn btn-primary">
              Ver pantalla
            </Link>
          </div>
        </header>

        <main className="mt-6 grid grid-cols-12 gap-5">
          {/* Registrar paciente */}
          <section className="glass-card col-span-12 rounded-4xl p-6 lg:col-span-5">
            <h2 className="font-display text-lg font-bold text-foreground">Registrar paciente</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              En pantalla solo se muestra el nombre y la inicial del apellido.
            </p>
            <form className="mt-5 flex flex-col gap-4" onSubmit={enviar}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-field" htmlFor="nombre">
                    Nombre
                  </label>
                  <input
                    id="nombre"
                    className="input-field"
                    placeholder="María"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label-field" htmlFor="apellido">
                    Apellido
                  </label>
                  <input
                    id="apellido"
                    className="input-field"
                    placeholder="Ramírez"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="label-field" htmlFor="servicio">
                  Servicio
                </label>
                <select
                  id="servicio"
                  className="input-field"
                  value={servicio}
                  onChange={(e) => setServicio(e.target.value)}
                >
                  {SERVICIOS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" disabled={!puedeRegistrar || agregar.isPending}>
                {agregar.isPending ? "Registrando…" : "Registrar y asignar turno"}
              </button>
              {agregar.isError && (
                <p className="text-sm text-destructive">No se pudo registrar el paciente.</p>
              )}
            </form>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="glass-soft rounded-2xl p-3 text-center">
                <p className="font-display text-2xl font-bold tabular-nums text-foreground">
                  {enEspera.length}
                </p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  En espera
                </p>
              </div>
              <div className="glass-soft rounded-2xl p-3 text-center">
                <p className="font-display text-2xl font-bold tabular-nums text-foreground">
                  {atendidos.length}
                </p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Atendidos
                </p>
              </div>
              <div className="glass-soft rounded-2xl p-3 text-center">
                <p className="font-display text-2xl font-bold tabular-nums text-primary">
                  {turnos.length ? formatNumero(turnos[turnos.length - 1]!.numero) : "—"}
                </p>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Último turno
                </p>
              </div>
            </div>
          </section>

          {/* Atención actual + cola */}
          <div className="col-span-12 flex flex-col gap-5 lg:col-span-7">
            <section className="glass-card rounded-4xl p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-foreground">En atención</h2>
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary"
                    disabled={llamar.isPending || enEspera.length === 0}
                    onClick={() => llamar.mutate()}
                  >
                    {llamar.isPending
                      ? "Llamando…"
                      : enAtencion
                        ? "Finalizar y llamar siguiente"
                        : "Llamar siguiente"}
                  </button>
                  {enAtencion && (
                    <button
                      className="btn btn-soft"
                      disabled={finalizar.isPending}
                      onClick={() => finalizar.mutate(enAtencion.id)}
                    >
                      Finalizar turno
                    </button>
                  )}
                </div>
              </div>

              {enAtencion ? (
                <div className="mt-4 flex items-center gap-5 rounded-2xl glass-soft p-4">
                  <span className="font-display text-5xl font-bold tabular-nums text-primary">
                    {formatNumero(enAtencion.numero)}
                  </span>
                  <div className="h-10 w-px bg-border" />
                  <div className="flex-1">
                    <p className="font-display text-xl font-bold text-foreground">
                      {nombrePublico(enAtencion)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {enAtencion.servicio} · {enAtencion.consultorio}
                      {enAtencion.medico ? ` · ${enAtencion.medico}` : ""}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  No hay turno en atención. Usa “Llamar siguiente” para iniciar.
                </p>
              )}
            </section>

            <section className="glass-card flex-1 rounded-4xl p-6">
              <h2 className="font-display text-lg font-bold text-foreground">
                Cola de espera ({enEspera.length})
              </h2>
              {isPending ? (
                <p className="mt-4 text-sm text-muted-foreground">Cargando…</p>
              ) : enEspera.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  No hay pacientes en espera. Registra uno a la izquierda.
                </p>
              ) : (
                <ul className="mt-4 flex flex-col gap-2">
                  {enEspera.map((t) => (
                    <li key={t.id} className="glass-soft flex items-center gap-4 rounded-2xl p-3">
                      <span className="font-display text-xl font-bold tabular-nums text-primary">
                        {formatNumero(t.numero)}
                      </span>
                      <div className="h-8 w-px bg-border" />
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{nombrePublico(t)}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.servicio} · {t.consultorio}
                        </p>
                      </div>
                      <button
                        className="rounded-lg px-2 py-1 text-sm font-semibold text-destructive transition hover:bg-destructive/10"
                        onClick={() => quitar.mutate(t.id)}
                        disabled={quitar.isPending}
                        aria-label={`Quitar a ${nombrePublico(t)} de la cola`}
                      >
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </main>

        <footer className="mt-6 text-xs text-muted-foreground">
          KALDELUZ · Panel del Personal — prototipo de sala de espera
        </footer>
      </div>
    </div>
  );
}
