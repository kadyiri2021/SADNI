import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import sadniMark from "@/assets/sadni-mark.png";
import { fetchTurnos, formatNumero, nombrePublico, type Turno } from "@/lib/turnos";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sala de Espera — SADNI" },
      {
        name: "description",
        content:
          "Pantalla de turnos en tiempo real de la sala de espera del centro de salud SADNI: turno en atención, próximos pacientes y avisos.",
      },
      { property: "og:title", content: "Sala de Espera — SADNI" },
      {
        property: "og:description",
        content:
          "Turno en atención y próximos pacientes del centro de salud SADNI. Los turnos se muestran con nombre e inicial del apellido por privacidad.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SalaEspera,
});

function useReloj() {
  const [ahora, setAhora] = useState<Date | null>(null);
  useEffect(() => {
    setAhora(new Date());
    const t = setInterval(() => setAhora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return ahora;
}

function hora(d: Date): string {
  return d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function fecha(d: Date): string {
  const s = d.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function SalaEspera() {
  const ahora = useReloj();
  const { data: turnos = [] } = useQuery({
    queryKey: ["turnos"],
    queryFn: fetchTurnos,
    refetchInterval: 5000,
  });

  const enAtencion = turnos.find((t) => t.estado === "en_atencion");
  const enEspera = turnos.filter((t) => t.estado === "en_espera");
  const atendidos = turnos.filter((t) => t.estado === "atendido");
  const proximos = enEspera.slice(0, 5);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Luz ambiental */}
      <div
        className="blob blob-brand -top-40 -left-32 size-[520px]"
        style={{ animation: "floaty 14s ease-in-out infinite" }}
      />
      <div
        className="blob blob-accent -bottom-48 -right-32 size-[560px]"
        style={{ animation: "floaty2 18s ease-in-out infinite" }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1400px] flex-col px-6 py-6 lg:px-10 lg:py-8">
        {/* Encabezado */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="glass-card grid size-14 place-items-center rounded-2xl p-1.5">
              <img src={sadniMark} alt="Logo SADNI" className="size-full object-contain" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold leading-none tracking-tight text-foreground">
                SADNI
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Centro de Salud · Sala de Espera
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass-soft hidden items-center gap-2 rounded-full px-4 py-2 sm:flex">
              <span className="pulse-dot size-2.5 rounded-full bg-success" />
              <span className="text-sm font-medium text-muted-foreground">
                {enAtencion ? "Atendiendo ahora" : "En espera de pacientes"}
              </span>
            </div>
            <div className="glass-card rounded-2xl px-5 py-3 text-right">
              <p className="font-display text-3xl font-bold leading-none tabular-nums text-foreground">
                {ahora ? hora(ahora) : "--:--"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {ahora ? fecha(ahora) : " "}
              </p>
            </div>
          </div>
        </header>

        {/* Principal */}
        <main className="mt-6 grid flex-1 grid-cols-12 gap-5">
          {/* Turno en atención */}
          <section className="glass-card col-span-12 flex flex-col justify-between rounded-4xl p-8 lg:col-span-8 lg:p-10">
            <div className="flex items-center justify-between">
              <span className="pill-chip inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold">
                <span className="size-2 rounded-full bg-primary" />
                Turno en atención
              </span>
              {enAtencion && (
                <span className="text-sm text-muted-foreground">{enAtencion.consultorio}</span>
              )}
            </div>

            {enAtencion ? (
              <div className="my-6 flex flex-wrap items-center gap-8">
                <div
                  key={enAtencion.id}
                  className="gradient-tile anim-number-flash grid place-items-center rounded-3xl px-10 py-6 lg:px-12 lg:py-8"
                >
                  <span className="font-display text-[6rem] font-bold leading-none tabular-nums text-primary-foreground lg:text-[9rem]">
                    {formatNumero(enAtencion.numero)}
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="glass-soft grid size-16 place-items-center rounded-2xl font-display text-2xl font-bold text-primary">
                      {enAtencion.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-display text-3xl font-bold leading-none text-foreground lg:text-4xl">
                        {nombrePublico(enAtencion)}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {enAtencion.servicio}
                        {enAtencion.medico ? ` · ${enAtencion.medico}` : ""}
                      </p>
                    </div>
                  </div>
                  {enAtencion.llamado_at && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="pulse-dot size-2 rounded-full bg-success" />
                      Llamado a las{" "}
                      {hora(new Date(enAtencion.llamado_at))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="my-10 flex flex-col items-center justify-center gap-3 text-center">
                <p className="font-display text-4xl font-bold text-foreground">
                  No hay turno en atención
                </p>
                <p className="text-muted-foreground">
                  Los pacientes serán llamados por el personal de salud.
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="glass-soft rounded-2xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  En espera
                </p>
                <p className="mt-1 font-display text-3xl font-bold text-foreground tabular-nums">
                  {enEspera.length}
                </p>
              </div>
              <div className="glass-soft rounded-2xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Atendidos hoy
                </p>
                <p className="mt-1 font-display text-3xl font-bold text-foreground tabular-nums">
                  {atendidos.length}
                </p>
              </div>
              <div className="glass-soft rounded-2xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Próximo turno
                </p>
                <p className="mt-1 font-display text-3xl font-bold text-primary tabular-nums">
                  {proximos.length ? formatNumero(proximos[0]!.numero) : "—"}
                </p>
              </div>
            </div>
          </section>

          {/* Próximos turnos */}
          <aside className="glass-card col-span-12 flex flex-col rounded-4xl p-6 lg:col-span-4 lg:p-7">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-foreground">Próximos turnos</h2>
              <span className="text-xs text-muted-foreground">Cola</span>
            </div>
            <ul className="mt-5 flex flex-1 flex-col gap-3">
              {proximos.map((t: Turno, i: number) => (
                <li
                  key={t.id}
                  className={`flex items-center gap-4 rounded-2xl p-3 ${
                    i === 0 ? "glass-soft ring-1 ring-primary/20" : ""
                  }`}
                >
                  <span
                    className={`font-display text-2xl font-bold tabular-nums ${
                      i === 0 ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {formatNumero(t.numero)}
                  </span>
                  <div className="h-8 w-px bg-border" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{nombrePublico(t)}</p>
                    <p className="text-xs text-muted-foreground">{t.servicio}</p>
                  </div>
                </li>
              ))}
              {proximos.length === 0 && (
                <li className="flex flex-1 items-center justify-center text-center text-sm text-muted-foreground">
                  No hay pacientes en espera
                </li>
              )}
            </ul>
          </aside>

          {/* Aviso */}
          <section className="glass-card col-span-12 flex flex-wrap items-center gap-6 rounded-4xl p-6 lg:p-7">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-accent/15 text-2xl font-bold text-accent">
              i
            </div>
            <div className="min-w-[16rem] flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                Aviso de asesoría
              </p>
              <p className="mt-1 text-base text-foreground lg:text-lg">
                Lleve su documento de identidad y comprobante de seguro. Los turnos se llaman por
                nombre e inicial del apellido por privacidad.
              </p>
            </div>
            <div className="pill-chip shrink-0 rounded-2xl px-5 py-3 text-center">
              <p className="font-display text-2xl font-bold">Línea 0800</p>
              <p className="text-xs text-muted-foreground">Asesoría 24/7</p>
            </div>
          </section>
        </main>

        <footer className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
          <span>SADNI · Sala de Espera</span>
          <Link to="/panel" className="font-semibold text-primary hover:underline">
            Panel del personal
          </Link>
        </footer>
      </div>
    </div>
  );
}
