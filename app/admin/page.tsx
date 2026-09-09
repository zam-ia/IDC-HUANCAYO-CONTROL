import Link from "next/link";
import { supabaseAdmin } from "@/lib/db";

export const metadata = {
  title: "Resumen",
  description: "Estado general del ecosistema digital de IDC Huancayo.",
};

const quickActions = [
  {
    href: "/admin/medios",
    eyebrow: "En vivo",
    title: "Preparar una transmisión",
    description: "Crea una señal Mux y conecta una sola salida desde OBS.",
    tone: "bg-red-50 text-red-700",
  },
  {
    href: "/admin/noticias",
    eyebrow: "Contenido",
    title: "Publicar una noticia",
    description: "Actualiza el sitio institucional sin tocar código.",
    tone: "bg-sky-50 text-sky-700",
  },
  {
    href: "/admin/cursos",
    eyebrow: "Aula",
    title: "Gestionar cursos",
    description: "Organiza módulos, lecciones y material formativo.",
    tone: "bg-emerald-50 text-emerald-700",
  },
];

function IntegrationBadge({ ready, label }: { ready: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] ${
        ready ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${ready ? "bg-emerald-500" : "bg-amber-500"}`}
      />
      {label} {ready ? "listo" : "pendiente"}
    </span>
  );
}

export default async function AdminDashboardPage() {
  const emptyCount = Promise.resolve({ count: 0 });
  const [usersResult, coursesResult, postsResult, recentEventsResult] =
    await Promise.all([
      supabaseAdmin
        ? supabaseAdmin
            .from("users")
            .select("id", { count: "exact", head: true })
        : emptyCount,
      supabaseAdmin
        ? supabaseAdmin
            .from("courses")
            .select("id", { count: "exact", head: true })
        : emptyCount,
      supabaseAdmin
        ? supabaseAdmin
            .from("posts")
            .select("id", { count: "exact", head: true })
        : emptyCount,
      supabaseAdmin
        ? supabaseAdmin
            .from("live_events")
            .select("id,title,scheduled_at,status")
            .order("scheduled_at", { ascending: false })
            .limit(4)
        : Promise.resolve({ data: [] }),
    ]);

  const muxReady = Boolean(
    process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET,
  );
  const webhookReady = Boolean(process.env.MUX_WEBHOOK_SECRET);
  const encryptionReady = Boolean(
    process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length >= 32,
  );
  const databaseReady = Boolean(supabaseAdmin);
  const events = recentEventsResult.data || [];

  return (
    <main className="min-h-screen px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-9">
      <div className="mx-auto max-w-7xl">
        <header className="overflow-hidden rounded-[1.75rem] bg-[#002f5a] p-6 text-white shadow-xl shadow-[#003d73]/10 sm:p-8">
          <div className="flex flex-col justify-between gap-7 xl:flex-row xl:items-end">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-sky-200/70">
                Resumen operativo
              </p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Bienvenido a IDC Control
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
                Administra el sitio, el aula y las emisiones desde un ambiente
                independiente, diseñado para operar con claridad durante un
                evento en vivo.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <IntegrationBadge ready={databaseReady} label="Supabase" />
              <IntegrationBadge ready={muxReady} label="Mux" />
              <IntegrationBadge ready={webhookReady} label="Webhook" />
              <IntegrationBadge ready={encryptionReady} label="Bóveda" />
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Usuarios registrados", value: usersResult.count || 0 },
            { label: "Cursos del aula", value: coursesResult.count || 0 },
            { label: "Publicaciones", value: postsResult.count || 0 },
          ].map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                {stat.value}
              </p>
            </article>
          ))}
        </section>

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(19rem,0.9fr)]">
          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#00569d]">
                Accesos rápidos
              </p>
              <h2 className="mt-2 text-xl font-extrabold text-slate-950">
                ¿Qué necesitas hacer?
              </h2>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group rounded-2xl border border-slate-200 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#00569d]/30 hover:shadow-lg hover:shadow-slate-200/40"
                >
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] ${action.tone}`}
                  >
                    {action.eyebrow}
                  </span>
                  <h3 className="mt-4 text-sm font-extrabold text-slate-900 transition group-hover:text-[#00569d]">
                    {action.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {action.description}
                  </p>
                  <p className="mt-4 text-[11px] font-bold text-[#00569d]">
                    Abrir módulo →
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-red-600">
                  Mux
                </p>
                <h2 className="mt-2 text-lg font-extrabold text-slate-950">
                  Transmisiones recientes
                </h2>
              </div>
              <Link
                href="/admin/transmisiones"
                className="text-[11px] font-bold text-[#00569d]"
              >
                Ver todas
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {events.length ? (
                events.map((event) => (
                  <article
                    key={event.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-slate-900">
                        {event.title}
                      </p>
                      <span
                        className={`flex-none rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${
                          event.status === "live"
                            ? "bg-red-50 text-red-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {event.scheduled_at
                        ? new Intl.DateTimeFormat("es-PE", {
                            dateStyle: "medium",
                            timeStyle: "short",
                            timeZone: "America/Lima",
                          }).format(new Date(event.scheduled_at))
                        : "Sin fecha"}
                    </p>
                  </article>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 px-4 py-7 text-center">
                  <p className="text-xs text-slate-500">
                    Aún no hay transmisiones creadas.
                  </p>
                  <Link
                    href="/admin/medios"
                    className="mt-3 inline-flex text-xs font-extrabold text-[#00569d]"
                  >
                    Preparar la primera
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
