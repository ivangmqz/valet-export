import Link from "next/link";

const NAV_ITEMS = [
  { href: "#inicio", label: "Inicio", icon: IconHome },
  { href: "#testimonios", label: "Testimonios", icon: IconBook },
  { href: "#servicios", label: "Servicios", icon: IconBriefcase },
  { href: "#cobertura", label: "Cobertura de Seguro", icon: IconShieldSearch },
  { href: "#clientes", label: "Clientes", icon: IconUsers },
  { href: "#galeria", label: "Galería", icon: IconImage },
  { href: "#contacto", label: "Contacto", icon: IconChat }
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-valet-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="shrink-0 text-lg font-bold tracking-tight text-white">
          Valet<span className="text-gold-400">Premium</span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </a>
          ))}
        </nav>

        <Link
          href="/login"
          className="shrink-0 rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
        >
          Acceso Staff
        </Link>
      </div>
    </header>
  );
}

type IconProps = { className?: string };

function IconHome({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBook({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M4 19.5V5.5A2 2 0 0 1 6 3.5h4.5a2 2 0 0 1 1.5.68 2 2 0 0 1 1.5-.68H18a2 2 0 0 1 2 2v14a1 1 0 0 1-1 1h-5.5a2 2 0 0 0-1.5.68 2 2 0 0 0-1.5-.68H5a1 1 0 0 1-1-1Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 4.5v16" strokeLinecap="round" />
    </svg>
  );
}

function IconBriefcase({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <rect x="3" y="7.5" width="18" height="12" rx="2" />
      <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" strokeLinecap="round" />
      <path d="M3 13h18" />
    </svg>
  );
}

function IconShieldSearch({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M12 3.5 5 6v5c0 5 3 8.5 7 9.5 4-1 7-4.5 7-9.5V6l-7-2.5Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="11" cy="11.5" r="2.2" />
      <path d="M12.7 13.2 14.5 15" strokeLinecap="round" />
    </svg>
  );
}

function IconUsers({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.7-3 2.8-4.5 5.5-4.5s4.8 1.5 5.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 5.2a3 3 0 0 1 0 5.8" strokeLinecap="round" />
      <path d="M16 14.6c2.2.4 3.7 1.8 4.3 4.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconImage({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M4 17.5 9 12l3.5 3.5L16 12l4 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChat({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path d="M4 5.5h16v11H9.5L5 20.5v-4H4Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
