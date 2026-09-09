import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db";
import { getRadioNowPlaying, getRadioSchedule } from "@/lib/media";
import { isAdminRole } from "@/lib/roles";
import { createRadioProgramAction } from "./actions";
import Link from "next/link";

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
  const [nowPlaying, schedule] = await Promise.all([
    getRadioNowPlaying(),
    getRadioSchedule(),
  ]);

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
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
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
        </div>

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
