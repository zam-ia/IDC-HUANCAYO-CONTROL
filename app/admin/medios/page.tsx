import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ObsLiveWizard from "@/components/admin/ObsLiveWizard";
import SocialDestinationsManager, {
  type ConfiguredSocialDestination,
} from "@/components/admin/SocialDestinationsManager";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/db";
import { getRadioNowPlaying } from "@/lib/media";
import { isAdminRole } from "@/lib/roles";
import { isSocialPlatform, SOCIAL_PLATFORMS } from "@/lib/simulcast";
import { getPublicSiteUrl } from "@/lib/public-site";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Centro de medios",
  description: "Panel sencillo para operar OBS, transmisiones en vivo y radio.",
};

function StatusBadge({ ready, label }: { ready: boolean; label: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${ready ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}
    >
      {ready ? `${label}: listo` : `${label}: pendiente`}
    </span>
  );
}

export default async function MediaCenterPage() {
  const session = await getServerSession(authOptions);
  if (!isAdminRole(session?.user?.role)) redirect("/login?error=unauthorized");

  const [nowPlaying, recentEventsResult, socialDestinationsResult] =
    await Promise.all([
      getRadioNowPlaying(),
      supabaseAdmin
        ? supabaseAdmin
            .from("live_events")
            .select("id,title,scheduled_at,status")
            .order("scheduled_at", { ascending: false })
            .limit(4)
        : Promise.resolve({ data: [], error: null }),
      supabaseAdmin
        ? supabaseAdmin
            .from("social_stream_destinations")
            .select("platform,enabled,updated_at")
            .order("platform")
        : Promise.resolve({ data: [], error: null }),
    ]);

  const muxReady = Boolean(
    process.env.MUX_TOKEN_ID && process.env.MUX_TOKEN_SECRET,
  );
  const mediaSchemaReady = Boolean(supabaseAdmin && !recentEventsResult.error);
  const destinationSchemaReady = Boolean(
    supabaseAdmin && !socialDestinationsResult.error,
  );
  const webhookReady = Boolean(process.env.MUX_WEBHOOK_SECRET);
  const encryptionReady = Boolean(
    process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length >= 32,
  );
  const radioReady = Boolean(
    process.env.AZURACAST_BASE_URL && process.env.AZURACAST_STATION_SHORTCODE,
  );
  const recentEvents = recentEventsResult.data || [];
  const configuredSocialDestinations = (
    socialDestinationsResult.data || []
  ).flatMap((destination) =>
    isSocialPlatform(destination.platform)
      ? [
          {
            platform: destination.platform,
            enabled: destination.enabled === true,
            updatedAt: destination.updated_at,
          },
        ]
      : [],
  ) as ConfiguredSocialDestination[];
  const wizardSocialDestinations = SOCIAL_PLATFORMS.map((platform) => {
    const configuration = configuredSocialDestinations.find(
      (destination) => destination.platform === platform.id,
    );
    return {
      platform: platform.id,
      label: platform.label,
      configured: Boolean(configuration),
      enabled: configuration?.enabled === true,
    };
  });
  const azuraCastUrl = process.env.AZURACAST_BASE_URL?.replace(/\/$/, "");
  const publicLiveUrl = getPublicSiteUrl("/en-vivo");

  return (
    <main className="min-h-screen bg-[#f4f7fa] px-4 pb-24 pt-7 sm:px-6 lg:px-8 lg:pt-10">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-[11px] font-medium text-gray-400">
          <Link href="/admin" className="hover:text-[#00498d]">
            Panel admin
          </Link>
          <span>/</span>
          <span className="text-gray-600">Centro de medios</span>
        </nav>

        <header className="rounded-3xl bg-[#002f5a] px-6 py-8 text-white shadow-lg shadow-[#00498d]/10 sm:px-9 sm:py-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-200">
            Operación simple
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Radio y transmisiones en vivo
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
            OBS controla cámaras, micrófonos y escenas. Mux recibe una sola
            señal y la distribuye a la web y a todas las redes sociales
            elegidas.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <StatusBadge ready={muxReady} label="Mux" />
            <StatusBadge ready={mediaSchemaReady} label="Base de medios" />
            <StatusBadge
              ready={destinationSchemaReady && encryptionReady}
              label="Destinos"
            />
            <StatusBadge ready={webhookReady} label="Automatización" />
            <StatusBadge ready={radioReady} label="Radio" />
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
              Radio
            </p>
            <p
              className={`mt-2 text-lg font-bold ${nowPlaying.isOnline ? "text-emerald-600" : "text-amber-700"}`}
            >
              {nowPlaying.isOnline ? "En línea" : "Sin conexión"}
            </p>
            <p className="mt-1 truncate text-xs text-gray-500">
              {nowPlaying.current?.title || "Sin metadatos"}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
              Oyentes ahora
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {nowPlaying.listeners}
            </p>
            <p className="mt-1 text-xs text-gray-500">Datos de AzuraCast</p>
          </div>
          <Link
            href="/admin/transmisiones"
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#00498d]/30"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-600">
              En vivo
            </p>
            <p className="mt-2 text-base font-bold text-gray-900 group-hover:text-[#00498d]">
              Gestionar eventos
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Cambia estados y revisa transmisiones anteriores.
            </p>
          </Link>
          <Link
            href="/admin/radio"
            className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#00498d]/30"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#00498d]">
              Programación
            </p>
            <p className="mt-2 text-base font-bold text-gray-900 group-hover:text-[#00498d]">
              Administrar radio
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Publica programas y horarios de la emisora.
            </p>
          </Link>
        </section>

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(330px,0.8fr)]">
          <ObsLiveWizard
            muxReady={muxReady}
            databaseReady={mediaSchemaReady}
            destinationSchemaReady={destinationSchemaReady}
            socialDestinations={wizardSocialDestinations}
          />

          <aside className="space-y-6">
            <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00498d]">
                Después de crear la señal
              </p>
              <h2 className="mt-2 text-lg font-bold text-gray-950">
                Conectar OBS en 4 pasos
              </h2>
              <ol className="mt-5 space-y-4 text-sm text-gray-600">
                {[
                  "Abre OBS y entra a Ajustes → Emisión.",
                  "En Servicio elige Personalizado.",
                  "Pega el Servidor y la Clave que entrega este panel.",
                  "Pulsa Iniciar transmisión. La web pasará a En vivo mediante el webhook.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-[#00498d]/[0.07] text-xs font-bold text-[#00498d]">
                      {index + 1}
                    </span>
                    <span className="pt-1 leading-5">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50 p-4 text-xs leading-5 text-sky-900">
                Las cámaras, el audio y las escenas se manejan únicamente en
                OBS. No necesitas configurarlas otra vez en la web.
              </div>
            </section>

            <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-gray-950">
                  Actividad reciente
                </h2>
                <Link
                  href="/admin/transmisiones"
                  className="text-xs font-bold text-[#00498d]"
                >
                  Ver todo
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {recentEvents.length ? (
                  recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-xl border border-gray-100 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900">
                          {event.title}
                        </p>
                        <span
                          className={`flex-none rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${event.status === "live" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-600"}`}
                        >
                          {event.status}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-gray-400">
                        {event.scheduled_at
                          ? new Intl.DateTimeFormat("es-PE", {
                              dateStyle: "medium",
                              timeStyle: "short",
                              timeZone: "America/Lima",
                            }).format(new Date(event.scheduled_at))
                          : "Sin fecha"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl border border-dashed border-gray-200 p-5 text-center text-xs text-gray-500">
                    Aún no hay transmisiones creadas.
                  </p>
                )}
              </div>
            </section>
          </aside>
        </div>

        <SocialDestinationsManager
          destinations={configuredSocialDestinations}
          databaseReady={destinationSchemaReady}
          encryptionReady={encryptionReady}
        />

        <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00498d]">
            Configuración inicial · sólo una vez
          </p>
          <h2 className="mt-2 text-xl font-bold text-gray-950">
            Dónde colocar las llaves permanentes
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
            Estas credenciales las coloca una persona con acceso al proyecto en
            Vercel. El operador habitual no necesita verlas: sólo usa la llave
            temporal de OBS que genera el formulario.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                  <th className="px-3 py-3">Servicio</th>
                  <th className="px-3 py-3">Variables en Vercel</th>
                  <th className="px-3 py-3">Para qué sirve</th>
                  <th className="px-3 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                <tr>
                  <td className="px-3 py-4 font-bold text-gray-900">Mux</td>
                  <td className="px-3 py-4 font-mono text-xs">
                    MUX_TOKEN_ID
                    <br />
                    MUX_TOKEN_SECRET
                  </td>
                  <td className="px-3 py-4">
                    Crear la señal y la llave para OBS.
                  </td>
                  <td className="px-3 py-4">
                    <StatusBadge ready={muxReady} label="Mux" />
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-4 font-bold text-gray-900">
                    Webhook Mux
                  </td>
                  <td className="px-3 py-4 font-mono text-xs">
                    MUX_WEBHOOK_SECRET
                  </td>
                  <td className="px-3 py-4">
                    Cambiar automáticamente entre Programado, En vivo y
                    Finalizado.
                  </td>
                  <td className="px-3 py-4">
                    <StatusBadge ready={webhookReady} label="Webhook" />
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-4 font-bold text-gray-900">
                    Bóveda social
                  </td>
                  <td className="px-3 py-4 font-mono text-xs">
                    ENCRYPTION_KEY
                  </td>
                  <td className="px-3 py-4">
                    Cifrar las llaves de YouTube, Facebook, Instagram y TikTok.
                  </td>
                  <td className="px-3 py-4">
                    <StatusBadge ready={encryptionReady} label="Cifrado" />
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-4 font-bold text-gray-900">
                    AzuraCast
                  </td>
                  <td className="px-3 py-4 font-mono text-xs">
                    AZURACAST_BASE_URL
                    <br />
                    AZURACAST_STATION_SHORTCODE
                    <br />
                    AZURACAST_PUBLIC_STREAM_URL
                  </td>
                  <td className="px-3 py-4">
                    Reproductor, canción actual y oyentes de la radio.
                  </td>
                  <td className="px-3 py-4">
                    <StatusBadge ready={radioReady} label="Radio" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              Abrir Vercel
            </a>
            {azuraCastUrl && (
              <a
                href={azuraCastUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Abrir AzuraCast
              </a>
            )}
            <a
              href={publicLiveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center rounded-xl bg-[#00498d]/[0.07] px-4 py-2 text-xs font-bold text-[#00498d]"
            >
              Ver página pública
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
