import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db";
import { isAdminRole } from "@/lib/roles";
import { createLiveEventAction, updateLiveEventStatusAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Transmisiones",
  description: "Programa eventos y controla el estado público de la señal.",
};

const statusLabel: Record<string, string> = {
  draft: "Borrador",
  scheduled: "Programado",
  rehearsal: "Ensayo",
  live: "En vivo",
  interrupted: "Interrumpido",
  finished: "Finalizado",
  archived: "Archivado",
};

const destinationLabel: Record<string, string> = {
  mux: "Web",
  youtube: "YouTube",
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  custom: "Otro",
};

const destinationStateLabel: Record<string, string> = {
  disabled: "Desactivado",
  ready: "Preparado",
  connecting: "Conectando",
  live: "En vivo",
  error: "Error",
  unavailable: "No disponible",
  stopped: "Finalizado",
};

export default async function TransmisionesAdminPage() {
  const session = await getServerSession(authOptions);
  if (!isAdminRole(session?.user?.role)) redirect("/login?error=unauthorized");

  const { data: events } = supabaseAdmin
    ? await supabaseAdmin
        .from("live_events")
        .select(
          "id,title,slug,speaker,scheduled_at,status,visibility,mux_playback_id,live_destinations(platform,state,last_error)",
        )
        .order("scheduled_at", { ascending: false })
        .limit(30)
    : { data: [] };

  return (
    <main className="min-h-screen bg-[#f4f7fa] px-4 pb-32 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/admin/medios"
          className="mb-5 inline-flex text-xs font-bold text-[#00498d] hover:underline"
        >
          ← Volver al centro de medios
        </Link>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#00498d]">
          Centro de medios
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
          Transmisiones
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
          Revisa eventos y cambia su estado manualmente. Para crear una señal y
          obtener la llave de OBS usa el Centro de medios; este formulario queda
          disponible como opción avanzada.
        </p>

        {!supabaseAdmin && (
          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Configura Supabase y aplica la migración de medios para habilitar la
            administración.
          </p>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.4fr)]">
          <form
            action={createLiveEventAction}
            className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold text-gray-900">
              Programar transmisión
            </h2>
            <label className="block text-sm font-semibold text-gray-700">
              Título
              <input
                name="title"
                required
                minLength={3}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="block text-sm font-semibold text-gray-700">
              Slug
              <input
                name="slug"
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                placeholder="servicio-domingo"
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="block text-sm font-semibold text-gray-700">
              Orador
              <input
                name="speaker"
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="block text-sm font-semibold text-gray-700">
              Fecha y hora
              <input
                name="scheduledAt"
                type="datetime-local"
                required
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="block text-sm font-semibold text-gray-700">
              Descripción
              <textarea
                name="description"
                rows={3}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="block text-sm font-semibold text-gray-700">
              Visibilidad
              <select
                name="visibility"
                defaultValue="public"
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
              >
                <option value="public">Pública</option>
                <option value="private">Privada</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-gray-700">
              Mux Live Stream ID
              <input
                name="muxLiveStreamId"
                autoComplete="off"
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="block text-sm font-semibold text-gray-700">
              Mux Playback ID
              <input
                name="muxPlaybackId"
                autoComplete="off"
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="block text-sm font-semibold text-gray-700">
              Canal alternativo
              <input
                name="socialFallbackUrl"
                type="url"
                placeholder="https://youtube.com/..."
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
              />
            </label>
            <button
              disabled={!supabaseAdmin}
              className="w-full rounded-lg bg-[#00498d] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
            >
              Crear evento programado
            </button>
          </form>

          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#00498d]">
                  Operación
                </p>
                <h2 className="mt-2 text-2xl font-bold text-gray-950">
                  Eventos recientes
                </h2>
              </div>
              <span className="text-sm text-gray-500">
                {events?.length || 0} eventos
              </span>
            </div>
            <div className="mt-5 space-y-4">
              {events?.length ? (
                events.map((event) => (
                  <article
                    key={event.id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${event.status === "live" ? "bg-red-50 text-red-700" : "bg-sky-50 text-sky-800"}`}
                          >
                            {statusLabel[event.status] || event.status}
                          </span>
                          <span className="text-xs text-gray-400">
                            {event.visibility}
                          </span>
                        </div>
                        <h3 className="mt-3 text-lg font-bold text-gray-900">
                          {event.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {event.speaker || "Sin orador"} ·{" "}
                          {event.scheduled_at
                            ? new Intl.DateTimeFormat("es-PE", {
                                dateStyle: "medium",
                                timeStyle: "short",
                                timeZone: "America/Lima",
                              }).format(new Date(event.scheduled_at))
                            : "Sin fecha"}
                        </p>
                        {event.live_destinations?.length ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {event.live_destinations.map((destination) => (
                              <span
                                key={destination.platform}
                                title={destination.last_error || undefined}
                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                  destination.state === "live"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : destination.state === "error"
                                      ? "bg-red-50 text-red-700"
                                      : destination.state === "connecting"
                                        ? "bg-amber-50 text-amber-800"
                                        : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {destinationLabel[destination.platform] ||
                                  destination.platform}
                                :{" "}
                                {destinationStateLabel[destination.state] ||
                                  destination.state}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <form
                        action={updateLiveEventStatusAction}
                        className="flex flex-wrap gap-2"
                      >
                        <input type="hidden" name="id" value={event.id} />
                        <select
                          name="status"
                          defaultValue={event.status}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        >
                          <option value="scheduled">Programado</option>
                          <option value="rehearsal">Ensayo</option>
                          <option value="live">En vivo</option>
                          <option value="interrupted">Interrumpido</option>
                          <option value="finished">Finalizado</option>
                          <option value="archived">Archivado</option>
                        </select>
                        <button className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                          Actualizar
                        </button>
                      </form>
                    </div>
                  </article>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
                  Todavía no hay transmisiones. Crea el primer evento desde este
                  panel.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
