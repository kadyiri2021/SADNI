create table public.turnos (
  id uuid primary key default gen_random_uuid(),
  numero integer not null unique,
  nombre text not null,
  apellido_inicial text not null,
  servicio text not null default 'Consulta general',
  consultorio text not null default 'Consultorio 3',
  medico text,
  estado text not null default 'en_espera',
  llamado_at timestamptz,
  atendido_at timestamptz,
  created_at timestamptz not null default now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.turnos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.turnos TO authenticated;
GRANT ALL ON public.turnos TO service_role;

ALTER TABLE public.turnos ENABLE ROW LEVEL SECURITY;

create policy "Public read turnos" on public.turnos for select to anon, authenticated using (true);
create policy "Public insert turnos" on public.turnos for insert to anon, authenticated with check (true);
create policy "Public update turnos" on public.turnos for update to anon, authenticated using (true) with check (true);
create policy "Public delete turnos" on public.turnos for delete to anon, authenticated using (true);

insert into public.turnos (numero, nombre, apellido_inicial, servicio, consultorio, medico, estado) values
  (62, 'María', 'R.', 'Medicina General', 'Consultorio 3', 'Dra. Fuentes', 'en_atencion'),
  (63, 'Carlos', 'M.', 'Cardiología', 'Consultorio 2', 'Dr. Herrera', 'en_espera'),
  (64, 'Lucía', 'P.', 'Pediatría', 'Consultorio 1', 'Dra. Quispe', 'en_espera'),
  (65, 'Jorge', 'T.', 'Traumatología', 'Consultorio 4', 'Dr. Salazar', 'en_espera'),
  (66, 'Ana', 'V.', 'Medicina General', 'Consultorio 3', 'Dra. Fuentes', 'en_espera'),
  (67, 'Pedro', 'S.', 'Dermatología', 'Consultorio 5', 'Dra. Rojas', 'en_espera'),
  (68, 'Rosa', 'D.', 'Odontología', 'Consultorio 2', 'Dr. Mendoza', 'en_espera'),
  (69, 'Luis', 'C.', 'Medicina General', 'Consultorio 3', 'Dra. Fuentes', 'en_espera'),
  (70, 'Elena', 'G.', 'Cardiología', 'Consultorio 2', 'Dr. Herrera', 'en_espera'),
  (71, 'Miguel', 'A.', 'Pediatría', 'Consultorio 1', 'Dra. Quispe', 'en_espera'),
  (72, 'Carmen', 'F.', 'Medicina General', 'Consultorio 3', 'Dra. Fuentes', 'en_espera'),
  (73, 'Diego', 'H.', 'Traumatología', 'Consultorio 4', 'Dr. Salazar', 'en_espera'),
  (74, 'Sofía', 'B.', 'Dermatología', 'Consultorio 5', 'Dra. Rojas', 'en_espera'),
  (75, 'Raúl', 'L.', 'Odontología', 'Consultorio 2', 'Dr. Mendoza', 'en_espera'),
  (76, 'Patricia', 'N.', 'Medicina General', 'Consultorio 3', 'Dra. Fuentes', 'en_espera');