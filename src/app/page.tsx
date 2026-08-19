import Navbar from "@/components/Navbar";
import WhatsAppButton from "@/components/WhatsAppButton";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const SERVICES = [
  {
    title: "Bodas y eventos sociales",
    desc: "Recepción impecable para tus invitados desde el primer minuto, con personal uniformado y coordinado.",
    icon: "💍"
  },
  {
    title: "Eventos corporativos",
    desc: "Convenciones, lanzamientos y galas con altos volúmenes de vehículos gestionados con tickets y control total.",
    icon: "🏢"
  },
  {
    title: "Restaurantes y clubes",
    desc: "Servicio recurrente o por temporada, con personal capacitado y pólizas de responsabilidad civil.",
    icon: "🍽️"
  },
  {
    title: "Fiestas privadas",
    desc: "Desde 20 hasta 500+ vehículos, escalamos el equipo de valets según el tamaño de tu evento.",
    icon: "🎉"
  }
];

const STEPS = [
  { title: "Cotiza por WhatsApp", desc: "Cuéntanos fecha, ubicación y número estimado de vehículos." },
  { title: "Confirmamos el operativo", desc: "Asignamos el personal necesario y coordinamos logística." },
  { title: "Disfruta tu evento", desc: "Nuestro equipo llega uniformado y puntual, tú solo recibe a tus invitados." }
];

const TESTIMONIALS = [
  {
    name: "Andrea R.",
    event: "Boda en Jardín Los Encinos",
    quote:
      "El equipo llegó puntual, uniformado y manejó más de 120 autos sin un solo contratiempo. Nuestros invitados no dejaron de comentarlo."
  },
  {
    name: "Carlos M.",
    event: "Convención corporativa",
    quote:
      "Coordinaron todo el operativo de valet para más de 300 asistentes en dos días. Profesionalismo de principio a fin."
  },
  {
    name: "Fernanda L.",
    event: "Fiesta privada de aniversario",
    quote: "Contratamos el servicio a última hora y aun así resolvieron todo. Totalmente recomendados."
  }
];

const COVERAGE = [
  { title: "Responsabilidad civil", desc: "Pólizas vigentes que cubren daños a los vehículos durante el servicio." },
  { title: "Personal verificado", desc: "Cada valet pasa por selección, capacitación y verificación de antecedentes." },
  { title: "Cobertura total del evento", desc: "Desde la recepción del vehículo hasta su entrega, con resguardo de llaves controlado." },
  { title: "Documentación disponible", desc: "Compartimos las pólizas y constancias vigentes antes de tu evento si las necesitas." }
];

const CLIENT_TYPES = [
  { icon: "🏨", label: "Hoteles y resorts" },
  { icon: "🌳", label: "Salones y jardines de eventos" },
  { icon: "🍽️", label: "Restaurantes y clubes privados" },
  { icon: "🏢", label: "Empresas y corporativos" }
];

const GALLERY = [
  { icon: "💍", label: "Bodas" },
  { icon: "🏢", label: "Corporativo" },
  { icon: "🍽️", label: "Restaurantes" },
  { icon: "🎉", label: "Privados" },
  { icon: "🚗", label: "Flotillas grandes" },
  { icon: "🎫", label: "Control de tickets" }
];

export default function LandingPage() {
  const heroWhatsApp = buildWhatsAppLink(
    "Hola, me gustaría cotizar un servicio de valet parking para mi evento..."
  );

  return (
    <main>
      <Navbar />

      {/* HERO */}
      <section id="inicio" className="relative scroll-mt-20 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(67,97,238,0.35),transparent_50%),radial-gradient(circle_at_90%_10%,rgba(212,164,55,0.18),transparent_45%)]" />
        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 sm:pt-24">
          <p className="mb-4 inline-block rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-gold-400">
            Valet Parking Profesional
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-6xl">
            La primera y última impresión de tu evento, en manos expertas.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-300">
            Servicio de valet parking uniformado, asegurado y puntual para bodas, eventos
            corporativos y fiestas privadas. Cotiza en minutos, directo con el equipo directivo.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href={heroWhatsApp} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
              Cotizar mi evento por WhatsApp
            </a>
            <a href="#servicios" className="btn-secondary">
              Ver servicios
            </a>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8 text-center sm:max-w-lg sm:text-left">
            <Stat value="500+" label="Eventos atendidos" />
            <Stat value="100%" label="Personal asegurado" />
            <Stat value="24/7" label="Atención directa" />
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="scroll-mt-20 mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-3xl font-bold text-white">Servicios</h2>
        <p className="mt-2 max-w-2xl text-slate-400">
          Adaptamos el operativo de valet al tipo, tamaño y ritmo de tu evento.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <div key={s.title} className="card">
              <div className="text-3xl">{s.icon}</div>
              <h3 className="mt-4 font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="border-y border-white/10 bg-white/[0.03] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-3xl font-bold text-white">Cómo funciona</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-valet-500 font-bold text-white">
                  {i + 1}
                </div>
                <h3 className="mt-4 font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section id="testimonios" className="scroll-mt-20 mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-3xl font-bold text-white">Testimonios</h2>
        <p className="mt-2 max-w-2xl text-slate-400">Lo que dicen quienes ya confiaron en nuestro equipo.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="card">
              <div className="text-gold-400">{"★".repeat(5)}</div>
              <p className="mt-3 text-sm text-slate-300">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-4 text-sm font-semibold text-white">{t.name}</p>
              <p className="text-xs text-slate-500">{t.event}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COBERTURA DE SEGURO */}
      <section id="cobertura" className="scroll-mt-20 border-y border-white/10 bg-white/[0.03] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-3xl font-bold text-white">Cobertura de Seguro</h2>
          <p className="mt-2 max-w-2xl text-slate-400">
            Tu evento y los vehículos de tus invitados, respaldados de principio a fin.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {COVERAGE.map((c) => (
              <div key={c.title} className="card">
                <h3 className="font-semibold text-white">{c.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLIENTES */}
      <section id="clientes" className="scroll-mt-20 mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-3xl font-bold text-white">Clientes</h2>
        <p className="mt-2 max-w-2xl text-slate-400">Trabajamos con quienes necesitan que todo salga perfecto.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CLIENT_TYPES.map((c) => (
            <div key={c.label} className="card flex items-center gap-3">
              <span className="text-2xl">{c.icon}</span>
              <span className="font-medium text-white">{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* GALERIA */}
      <section id="galeria" className="scroll-mt-20 border-y border-white/10 bg-white/[0.03] py-20">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-3xl font-bold text-white">Galería</h2>
          <p className="mt-2 max-w-2xl text-slate-400">Un vistazo al tipo de operativos que manejamos.</p>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {GALLERY.map((g) => (
              <div
                key={g.label}
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-gradient-to-br from-valet-500/20 to-gold-500/10 text-center"
              >
                <span className="text-4xl">{g.icon}</span>
                <span className="text-sm font-medium text-white">{g.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="scroll-mt-20 mx-auto max-w-6xl px-5 py-20 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          ¿Listo para elevar la experiencia de tu evento?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-slate-400">
          Escríbenos ahora mismo por WhatsApp y recibe tu cotización personalizada en minutos.
        </p>
        <div className="mt-8">
          <a href={heroWhatsApp} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            Hablar con el equipo ahora
          </a>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Valet Premium. Todos los derechos reservados.
      </footer>

      <WhatsAppButton variant="floating" />
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
