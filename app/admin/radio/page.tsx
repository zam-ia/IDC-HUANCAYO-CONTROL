import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import RadioServiceControls from "@/components/admin/RadioServiceControls";
import { authOptions } from "@/lib/auth";
import { getAzuraCastServiceStatus } from "@/lib/azuracast";
import { supabaseAdmin } from "@/lib/db";
import { getRadioNowPlaying, getRadioSchedule } from "@/lib/media";
import { getPublicSiteUrl } from "@/lib/public-site";
import { isAdminRole } from "@/lib/roles";
import { createRadioProgramAction } from "./actions";

export const dynamic = "force-dynamic";

const weekdays = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export default async function RadioAdminPage() {
  const session = await getServerSession(authOptions);
  if (!isAdminRole(session?.user?.role)) redirect("/login?error=unauthorized");
  const [nowPlaying, schedule, serviceStatus] = await Promise.all([
    getRadioNowPlaying(),
    getRadioSchedule(),
    getAzuraCastServiceStatus(),
  ]);
  const baseUrl = process.env.AZURACAST_BASE_URL?.replace(/\/$/, "");
  const configuration = [
    {
      label: "Servidor AzuraCast",
      value: "AZURACAST_BASE_URL",
      ready: Boolean(baseUrl),
    },
    {
      label: "Estación pública",
      value: "AZURACAST_STATION_SHORTCODE",
      ready: Boolean(process.env.AZURACAST_STATION_SHORTCODE),
    },
    {
      label: "Audio para oyentes",
      value: "AZURACAST_PUBLIC_STREAM_URL",
      ready: Boolean(process.env.AZURACAST_PUBLIC_STREAM_URL),
    },
    {
      label: "Control del servidor",
      value: "AZURACAST_STATION_ID + AZURACAST_API_KEY",
      ready: serviceStatus.configured,
    },
  ];
  const configuredItems = configuration.filter((item) => item.ready).length;
  const publicRadioUrl = getPublicSiteUrl("/radio");

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
          Emisora 24/7
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
          Administración de radio
        </h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Estado AzuraCast
            </p>
            <p
              className={`mt-2 text-lg font-bold ${nowPlaying.isOnline ? "text-emerald-600" : "text-amber-600"}`}
            >
              {nowPlaying.isOnline ? "En línea" : "Sin conexión"}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Ahora suena
            </p>
            <p className="mt-2 truncate text-lg font-bold text-gray-900">
              {nowPlaying.current?.title || "Sin metadatos"}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Oyentes
            </p>
            <p className="mt-2 text-lg font-bold text-gray-900">
              {nowPlaying.listeners}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Locución
            </p>
            <p className="mt-2 truncate text-lg font-bold text-gray-900">
              {nowPlaying.isLive
                ? nowPlaying.liveHost || "Locutor conectado"
                : "AutoDJ"}
            </p>
          </div>
        </div>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#00498d]">
                  Preparación del servidor
                </p>
                <h2 className="mt-2 text-xl font-bold text-gray-950">
                  {configuredItems === configuration.length
                    ? "AzuraCast conectado"
                    : `${configuredItems} de ${configuration.length} datos listos`}
                </h2>
              </div>
              <span
                className={`w-fit rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide ${configuredItems === configuration.length ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}
              >
                {configuredItems === configuration.length
                  ? "Listo para operar"
                  : "Falta instalación"}
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {configuration.map((item, index) => (
                <div
                  key={item.value}
                  className="flex gap-3 rounded-xl border border-gray-100 p-4"
                >
                  <span
                    className={`flex h-7 w-7 flex-none items-center justify-center rounded-lg text-xs font-bold ${item.ready ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}
                  >
                    {item.ready ? "✓" : index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900">
                      {item.label}
                    </p>
                    <p className="mt-1 break-words font-mono text-[10px] leading-4 text-gray-400">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
              La instalación real necesita un VPS Linux y un dominio para la
              radio. Las llaves se agregan únicamente en Vercel; nunca se
              escriben en GitHub ni se muestran al operador.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {baseUrl && (
                <a
                  href={baseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-[#00498d] px-4 py-2.5 text-xs font-bold text-white"
                >
                  Abrir AzuraCast
                </a>
              )}
              <a
                href="https://www.azuracast.com/docs/getting-started/installation/"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Ver instalación oficial
              </a>
              <a
                href={publicRadioUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Escuchar página pública
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#00498d]">
              Control rápido
            </p>
            <h2 className="mt-2 text-xl font-bold text-gray-950">
              AutoDJ y emisión
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  AutoDJ
                </p>
                <p
                  className={`mt-2 text-sm font-bold ${serviceStatus.backendRunning ? "text-emerald-700" : "text-gray-700"}`}
                >
                  {serviceStatus.backendRunning === null
                    ? "Sin consultar"
                    : serviceStatus.backendRunning
                      ? "Funcionando"
                      : "Detenido"}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
                  Escucha
                </p>
                <p
                  className={`mt-2 text-sm font-bold ${serviceStatus.frontendRunning ? "text-emerald-700" : "text-gray-700"}`}
                >
                  {serviceStatus.frontendRunning === null
                    ? "Sin consultar"
                    : serviceStatus.frontendRunning
                      ? "Funcionando"
                      : "Detenida"}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-gray-500">
              {serviceStatus.message}
            </p>
            <div className="mt-5">
              <RadioServiceControls enabled={serviceStatus.reachable} />
            </div>
            <p className="mt-4 text-[11px] leading-5 text-gray-400">
              Reiniciar interrumpe brevemente a los oyentes y siempre pide
              confirmación. Todas las acciones quedan registradas en auditoría.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#00498d]">
            Operación diaria sin programación
          </p>
          <h2 className="mt-2 text-xl font-bold text-gray-950">
            Así se maneja la emisora
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "1. Música 24/7",
                text: "Sube audios y ordénalos en playlists desde AzuraCast. AutoDJ cubre todos los espacios sin locutor.",
              },
              {
                title: "2. Locutor en vivo",
                text: "Cada locutor usa su propia cuenta DJ en BUTT o Mixxx. Al conectarse toma la señal; al salir vuelve AutoDJ.",
              },
              {
                title: "3. Video y cámaras",
                text: "OBS queda dedicado al video, cámaras, micrófonos y escenas. No es necesario mezclarlo con la automatización de radio.",
              },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5"
              >
                <h3 className="text-sm font-bold text-gray-950">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-gray-600">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        {!supabaseAdmin && (
          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Configura Supabase y aplica la migración de medios para editar la
            parrilla.
          </p>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.4fr)]">
          <form
            action={createRadioProgramAction}
            className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold text-gray-900">
              Agregar programa
            </h2>
            <label className="block text-sm font-semibold text-gray-700">
              Programa
              <input
                name="name"
                required
                minLength={3}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="block text-sm font-semibold text-gray-700">
              Locutor
              <input
                name="host"
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
              Día
              <select
                name="weekday"
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
              >
                {weekdays.map((day, index) => (
                  <option key={day} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-semibold text-gray-700">
                Inicio
                <input
                  name="startTime"
                  type="time"
                  required
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
                />
              </label>
              <label className="block text-sm font-semibold text-gray-700">
                Fin
                <input
                  name="endTime"
                  type="time"
                  required
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal"
                />
              </label>
            </div>
            <button
              disabled={!supabaseAdmin}
              className="w-full rounded-lg bg-[#00498d] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
            >
              Publicar en la parrilla
            </button>
          </form>

          <section>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#00498d]">
              America/Lima
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-950">
              Parrilla publicada
            </h2>
            <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {schedule.length ? (
                schedule.map((item) => (
                  <article
                    key={item.id}
                    className="grid grid-cols-[110px_1fr] gap-4 border-b border-gray-100 px-5 py-4 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#00498d]">
                        {weekdays[item.weekday]}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {item.startTime.slice(0, 5)}–{item.endTime.slice(0, 5)}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {item.program.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.program.host ||
                          item.program.description ||
                          "Sin locutor asignado"}
                      </p>
                    </div>
                  </article>
                ))
              ) : (
                <p className="p-8 text-center text-sm text-gray-500">
                  No hay programas publicados todavía.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
