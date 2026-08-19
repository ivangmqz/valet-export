# Valet Premium — Plataforma Web de Valet Parking

Plataforma full-stack (landing pública + panel Empleado + panel Administrador)
construida con **Next.js 16 (App Router) + TypeScript + Tailwind CSS** en el
frontend y **Supabase** (Postgres + Auth + Realtime) en el backend.

---

## 1. Arquitectura y estructura de carpetas

```
valet/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Landing pública + CTA WhatsApp
│   │   ├── layout.tsx / globals.css
│   │   ├── login/page.tsx               # Login (Supabase Auth)
│   │   ├── admin/                       # Rutas protegidas: rol admin
│   │   │   ├── layout.tsx               # Guard de sesión + rol
│   │   │   ├── page.tsx                 # Dashboard + alertas 12h
│   │   │   ├── events/page.tsx          # Listado + creación de eventos
│   │   │   ├── events/[id]/page.tsx     # Detalle, edición, inscritos
│   │   │   └── empleados/page.tsx       # Alta de empleados
│   │   ├── empleado/                    # Rutas protegidas: rol empleado
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                 # Eventos disponibles + inscripción
│   │   │   └── mis-eventos/page.tsx     # Mis próximos eventos
│   │   └── api/
│   │       ├── events/route.ts          # GET/POST eventos
│   │       ├── events/[id]/route.ts     # PATCH/DELETE evento
│   │       ├── signups/route.ts         # POST/DELETE inscripción (RPC atómica)
│   │       ├── admin/create-employee/   # Alta de empleados (Service Role)
│   │       └── cron/check-alerts/       # ⏰ Disparador de alertas 12h
│   ├── components/
│   │   ├── WhatsAppButton.tsx, Navbar.tsx, Modal.tsx, AlertBanner.tsx...
│   │   ├── admin/  (EventForm, EventsList, EventDetail, EmployeesList)
│   │   └── empleado/ (EventsBoard)
│   ├── lib/
│   │   ├── supabase/{client,server,admin}.ts   # 3 clientes según contexto
│   │   ├── whatsapp.ts                          # Constructor de enlaces wa.me
│   │   └── utils.ts                             # Formateo de fechas
│   ├── types/database.types.ts
│   └── middleware.ts                    # Guard de autenticación (RBAC)
├── supabase/schema.sql                  # Esquema + RLS + función RPC
├── vercel.json                          # Cron Job (cada 15 min)
└── .env.local.example
```

**Por qué 3 clientes de Supabase distintos:**
- `lib/supabase/client.ts` — navegador (Client Components), respeta RLS con la sesión del usuario.
- `lib/supabase/server.ts` — Server Components / Route Handlers, respeta RLS leyendo la cookie de sesión.
- `lib/supabase/admin.ts` — Service Role Key, **ignora RLS**. Solo se usa server-side para crear usuarios de Auth y para que el cron job pueda insertar alertas sin necesidad de una sesión de usuario.

---

## 2. Esquema de base de datos

Ver [`supabase/schema.sql`](supabase/schema.sql) — resumen:

| Tabla | Propósito |
|---|---|
| `profiles` | Extiende `auth.users` con `role` (`admin` \| `empleado`), nombre, teléfono. |
| `events` | Eventos: nombre, `start_time`, ubicación, `max_staff`, notas internas, cliente, estado. |
| `event_signups` | Inscripción empleado↔evento. `UNIQUE(event_id, employee_id)`. |
| `alerts` | Alertas automáticas de 12h. `UNIQUE(event_id, type)` evita duplicados. |

**Seguridad (RLS):**
- Cualquier usuario autenticado puede **leer** eventos; solo `admin` puede crear/editar/borrar.
- Un empleado solo puede insertar/borrar **sus propias** inscripciones.
- Las alertas solo las lee/actualiza el `admin`; se insertan vía Service Role desde el cron.
- Función `is_admin()` (`SECURITY DEFINER`) evita recursión de RLS al validar el rol.

**Control de cupos sin condiciones de carrera:** la inscripción no se hace con un `INSERT` directo desde el cliente, sino a través de la función `signup_for_event(event_id)` (RPC), que bloquea la fila del evento (`FOR UPDATE`), cuenta los inscritos y solo entonces inserta — así dos empleados no pueden "robarse" el mismo último cupo.

---

## 3. Código fuente — piezas clave

- **Autenticación:** [`src/app/login/page.tsx`](src/app/login/page.tsx) usa `signInWithPassword`, luego consulta `profiles.role` y redirige a `/admin` o `/empleado`. [`src/middleware.ts`](src/middleware.ts) bloquea el acceso a esas rutas sin sesión.
- **Panel de eventos (admin):** [`src/components/admin/EventsList.tsx`](src/components/admin/EventsList.tsx), [`EventForm.tsx`](src/components/admin/EventForm.tsx), [`EventDetail.tsx`](src/components/admin/EventDetail.tsx).
- **Inscripción de empleados con cupos en vivo:** [`src/components/empleado/EventsBoard.tsx`](src/components/empleado/EventsBoard.tsx) — se suscribe a `postgres_changes` de `event_signups` para reflejar cupos en tiempo real entre empleados.
- **Botón de WhatsApp:** [`src/components/WhatsAppButton.tsx`](src/components/WhatsAppButton.tsx) + [`src/lib/whatsapp.ts`](src/lib/whatsapp.ts) — genera enlaces `https://wa.me/<numero>?text=...` con mensaje precargado.
- **Disparador de las 12 horas:** [`src/app/api/cron/check-alerts/route.ts`](src/app/api/cron/check-alerts/route.ts). Se invoca cada 15 min vía Vercel Cron ([`vercel.json`](vercel.json)); busca eventos cuyo inicio caiga en la ventana `[+11h45m, +12h15m]` y crea una alerta (`upsert` con `onConflict` para que sea idempotente). El panel admin la muestra en vivo vía [`AlertBanner.tsx`](src/components/AlertBanner.tsx) (Supabase Realtime).

---

## 4. Instalación y despliegue

### Requisitos previos
- [Node.js 22+](https://nodejs.org/) (requerido por Next.js 16 / Supabase JS).
- Una cuenta gratuita en [Supabase](https://supabase.com).
- (Para producción) una cuenta en [Vercel](https://vercel.com).

### Paso 1 — Crear el proyecto en Supabase
1. Crea un nuevo proyecto en Supabase.
2. Ve a **SQL Editor** → pega el contenido de [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
3. Ve a **Project Settings → API** y copia: `Project URL`, `anon public key`, `service_role key`.

### Paso 2 — Configurar variables de entorno
```bash
cp .env.local.example .env.local
```
Completa `.env.local` con las claves de Supabase, tu número de WhatsApp (`NEXT_PUBLIC_WHATSAPP_NUMBER`, formato internacional sin `+`) y un `CRON_SECRET` aleatorio.

### Paso 3 — Instalar dependencias y correr en local
```bash
npm install
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000).

### Paso 4 — Crear el primer administrador
1. En Supabase Dashboard → **Authentication → Add user**, crea el usuario del dueño/administrador (correo + contraseña).
2. Copia su UUID y en **SQL Editor** ejecuta:
   ```sql
   insert into public.profiles (id, full_name, phone, role)
   values ('UUID-DEL-USUARIO', 'Nombre del Jefe', '+521234567890', 'admin');
   ```
3. Inicia sesión en `/login` con ese correo — entrarás directo al panel `/admin`, desde donde podrás dar de alta a los empleados (ellos no se auto-registran).

### Paso 5 — Desplegar en Vercel
1. Sube el proyecto a un repositorio Git (GitHub/GitLab) e impórtalo en Vercel.
2. Agrega las mismas variables de entorno de `.env.local` en **Project Settings → Environment Variables**.
3. Vercel detectará automáticamente `vercel.json` y programará el Cron Job cada 15 minutos hacia `/api/cron/check-alerts`. Vercel añade el header `Authorization: Bearer $CRON_SECRET` automáticamente si la variable `CRON_SECRET` está configurada — no requiere configuración extra.
4. Haz *deploy*. Actualiza `NEXT_PUBLIC_SITE_URL` con tu dominio final.

### Notas de producción
- Si tu plan de Vercel no incluye Cron Jobs, puedes lograr el mismo resultado con una **Supabase Edge Function + `pg_cron`** que llame a la misma lógica, o con un cron externo (GitHub Actions, cron-job.org) que haga `GET` a `/api/cron/check-alerts` con el header `Authorization: Bearer <CRON_SECRET>`.
- Todas las políticas de RLS ya están activas: aunque se filtre la `anon key`, un usuario no-admin no puede leer notas internas de otros eventos ni crear/borrar eventos.
