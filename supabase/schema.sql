-- =====================================================================
-- VALET PARKING PLATFORM — ESQUEMA DE BASE DE DATOS (Supabase / Postgres)
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query > Run
-- =====================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- ENUM de roles
-- ---------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('admin', 'empleado');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type event_status as enum ('programado', 'confirmado', 'finalizado', 'cancelado');
exception
  when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------
-- PROFILES — extiende auth.users con rol, nombre y teléfono
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text,
  role user_role not null default 'empleado',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil de cada usuario (admin o empleado/valet), 1:1 con auth.users';

-- ---------------------------------------------------------------------
-- EVENTS — eventos creados por el administrador
-- ---------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  start_time timestamptz not null,      -- fecha + hora exacta del evento
  end_time timestamptz,                 -- opcional
  location text not null,
  max_staff integer not null check (max_staff > 0),
  internal_notes text,                  -- notas operativas internas (solo admin)
  client_name text,
  client_phone text,
  status event_status not null default 'programado',
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_start_time_idx on public.events (start_time);
create index if not exists events_status_idx on public.events (status);

-- ---------------------------------------------------------------------
-- EVENT_SIGNUPS — inscripción de empleados a eventos (control de cupos)
-- ---------------------------------------------------------------------
create table if not exists public.event_signups (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events (id) on delete cascade,
  employee_id uuid not null references public.profiles (id) on delete cascade,
  signed_up_at timestamptz not null default now(),
  unique (event_id, employee_id)
);

create index if not exists event_signups_event_idx on public.event_signups (event_id);
create index if not exists event_signups_employee_idx on public.event_signups (employee_id);

-- ---------------------------------------------------------------------
-- ALERTS — alertas automáticas (recordatorio 12h antes del evento)
-- ---------------------------------------------------------------------
create table if not exists public.alerts (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references public.events (id) on delete cascade,
  type text not null default '12h_reminder',
  message text not null,
  acknowledged boolean not null default false,
  acknowledged_by uuid references public.profiles (id),
  acknowledged_at timestamptz,
  created_at timestamptz not null default now(),
  unique (event_id, type)
);

create index if not exists alerts_acknowledged_idx on public.alerts (acknowledged);

-- ---------------------------------------------------------------------
-- Trigger: mantener events.updated_at actualizado
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Helper: ¿el usuario autenticado actual es admin?
-- SECURITY DEFINER para poder leer profiles dentro de las policies
-- sin caer en recursión infinita de RLS.
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_signups enable row level security;
alter table public.alerts enable row level security;

-- PROFILES ---------------------------------------------------------
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_insert_admin" on public.profiles;
create policy "profiles_insert_admin" on public.profiles
  for insert with check (public.is_admin());

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

-- EVENTS -------------------------------------------------------------
drop policy if exists "events_select_authenticated" on public.events;
create policy "events_select_authenticated" on public.events
  for select using (auth.role() = 'authenticated');

drop policy if exists "events_admin_all" on public.events;
create policy "events_admin_all" on public.events
  for all using (public.is_admin()) with check (public.is_admin());

-- EVENT_SIGNUPS --------------------------------------------------------
drop policy if exists "signups_select" on public.event_signups;
create policy "signups_select" on public.event_signups
  for select using (employee_id = auth.uid() or public.is_admin());

drop policy if exists "signups_insert_self" on public.event_signups;
create policy "signups_insert_self" on public.event_signups
  for insert with check (employee_id = auth.uid() or public.is_admin());

drop policy if exists "signups_delete_self" on public.event_signups;
create policy "signups_delete_self" on public.event_signups
  for delete using (employee_id = auth.uid() or public.is_admin());

-- ALERTS ---------------------------------------------------------------
-- Solo el admin puede leer/actualizar. Las inserciones las realiza
-- el cron job usando la Service Role Key, que ignora RLS por completo.
drop policy if exists "alerts_admin_select" on public.alerts;
create policy "alerts_admin_select" on public.alerts
  for select using (public.is_admin());

drop policy if exists "alerts_admin_update" on public.alerts;
create policy "alerts_admin_update" on public.alerts
  for update using (public.is_admin());

-- ---------------------------------------------------------------------
-- RPC: inscripción atómica con control de cupos (evita condiciones de
-- carrera cuando dos empleados se inscriben al mismo tiempo).
-- ---------------------------------------------------------------------
create or replace function public.signup_for_event(p_event_id uuid)
returns public.event_signups
language plpgsql
security definer
set search_path = public
as $$
declare
  v_max_staff integer;
  v_current_count integer;
  v_row public.event_signups;
begin
  -- Bloquea la fila del evento hasta el final de la transacción
  select max_staff into v_max_staff
  from public.events
  where id = p_event_id
  for update;

  if v_max_staff is null then
    raise exception 'Evento no encontrado';
  end if;

  select count(*) into v_current_count
  from public.event_signups
  where event_id = p_event_id;

  if v_current_count >= v_max_staff then
    raise exception 'CUPO_LLENO';
  end if;

  insert into public.event_signups (event_id, employee_id)
  values (p_event_id, auth.uid())
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.signup_for_event(uuid) to authenticated;

-- =====================================================================
-- REALTIME — permite que el panel admin reciba alertas en vivo
-- =====================================================================
alter publication supabase_realtime add table public.alerts;
alter publication supabase_realtime add table public.event_signups;

-- =====================================================================
-- SEED: crear el primer administrador
-- =====================================================================
-- 1. Crea el usuario desde Supabase Dashboard > Authentication > Add User
--    (o usando /api/admin/create-employee una vez tengas un admin inicial).
-- 2. Copia su UUID y ejecuta:
--
-- insert into public.profiles (id, full_name, phone, role)
-- values ('UUID-DEL-USUARIO', 'Nombre del Jefe', '+521234567890', 'admin');
-- =====================================================================
