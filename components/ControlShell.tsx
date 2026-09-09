"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  {
    label: "Operación",
    items: [
      { href: "/admin", label: "Resumen", symbol: "IN" },
      { href: "/admin/medios", label: "Centro en vivo", symbol: "ON" },
      { href: "/admin/transmisiones", label: "Transmisiones", symbol: "TV" },
      { href: "/admin/radio", label: "Radio", symbol: "FM" },
    ],
  },
  {
    label: "Contenido",
    items: [
      { href: "/admin/noticias", label: "Noticias", symbol: "NT" },
      { href: "/admin/devocionales", label: "Devocionales", symbol: "DV" },
      { href: "/admin/testimonios", label: "Testimonios", symbol: "TS" },
      { href: "/admin/ensenanza", label: "Enseñanza", symbol: "EN" },
      { href: "/admin/nosotros", label: "Nosotros", symbol: "ID" },
    ],
  },
  {
    label: "Aula virtual",
    items: [
      { href: "/admin/cursos", label: "Cursos", symbol: "CR" },
      { href: "/admin/alumnos", label: "Usuarios", symbol: "US" },
      { href: "/admin/certificados", label: "Certificados", symbol: "CE" },
      {
        href: "/admin/configuracion-campus",
        label: "Configuración aula",
        symbol: "AU",
      },
    ],
  },
];

function SidebarContent({
  pathname,
  closeMenu,
  userName,
  userEmail,
  publicSiteUrl,
}: {
  pathname: string;
  closeMenu: () => void;
  userName?: string | null;
  userEmail?: string | null;
  publicSiteUrl: string;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <Link
          href="/admin"
          onClick={closeMenu}
          className="flex items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-black text-[#003d73] shadow-lg shadow-black/10">
            IDC
          </span>
          <span>
            <span className="block text-sm font-extrabold tracking-tight text-white">
              Centro de Control
            </span>
            <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-sky-200/70">
              Huancayo
            </span>
          </span>
        </Link>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {navigation.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-2 px-3 text-[9px] font-extrabold uppercase tracking-[0.16em] text-sky-100/40">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={`group flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold transition ${
                      active
                        ? "bg-white text-[#003d73] shadow-sm"
                        : "text-white/65 hover:bg-white/[0.07] hover:text-white"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-lg text-[8px] font-black tracking-tight ${
                        active
                          ? "bg-[#00569d]/10 text-[#00569d]"
                          : "bg-white/[0.07] text-white/60 group-hover:text-white"
                      }`}
                    >
                      {item.symbol}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
        <div className="mb-3 border-t border-white/10 pt-4">
          <Link
            href="/admin/configuracion"
            onClick={closeMenu}
            className={`flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold transition ${
              pathname.startsWith("/admin/configuracion") &&
              !pathname.startsWith("/admin/configuracion-campus")
                ? "bg-white text-[#003d73]"
                : "text-white/65 hover:bg-white/[0.07] hover:text-white"
            }`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.07] text-[8px] font-black">
              CF
            </span>
            Configuración web
          </Link>
          <a
            href={publicSiteUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold text-white/65 transition hover:bg-white/[0.07] hover:text-white"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/[0.07] text-[8px] font-black">
              ↗
            </span>
            Abrir sitio público
          </a>
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="rounded-2xl bg-white/[0.06] p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-300/15 text-xs font-black text-sky-100">
              {(userName || userEmail || "A").charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">
                {userName || "Administrador"}
              </p>
              <p className="mt-0.5 truncate text-[10px] text-white/45">
                {userEmail}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-3 min-h-9 w-full rounded-xl border border-white/10 px-3 py-2 text-[11px] font-bold text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ControlShell({
  children,
  userName,
  userEmail,
  publicSiteUrl,
}: {
  children: React.ReactNode;
  userName?: string | null;
  userEmail?: string | null;
  publicSiteUrl: string;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f6f9]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-[#002f5a] lg:block">
        <SidebarContent
          pathname={pathname}
          closeMenu={() => setMenuOpen(false)}
          userName={userName}
          userEmail={userEmail}
          publicSiteUrl={publicSiteUrl}
        />
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#003d73] text-[11px] font-black text-white">
            IDC
          </span>
          <span className="text-sm font-extrabold text-slate-900">Control</span>
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menú"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-700"
        >
          ☰
        </button>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
          />
          <aside className="control-enter relative h-full w-[min(86vw,19rem)] bg-[#002f5a] shadow-2xl">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Cerrar menú"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-lg text-white"
            >
              ×
            </button>
            <SidebarContent
              pathname={pathname}
              closeMenu={() => setMenuOpen(false)}
              userName={userName}
              userEmail={userEmail}
              publicSiteUrl={publicSiteUrl}
            />
          </aside>
        </div>
      ) : null}

      <div className="min-w-0 lg:pl-64">
        <div className="control-enter min-w-0">{children}</div>
      </div>
    </div>
  );
}
