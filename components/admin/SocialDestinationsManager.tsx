"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  saveSocialDestinationAction,
  type DestinationActionState,
} from "@/app/admin/medios/destination-actions";
import {
  SOCIAL_PLATFORMS,
  type SocialPlatform,
  type SocialPlatformDefinition,
} from "@/lib/simulcast";

export type ConfiguredSocialDestination = {
  platform: SocialPlatform;
  enabled: boolean;
  updatedAt: string;
};

const initialState: DestinationActionState = {
  status: "idle",
  message: "",
};

function SaveButton({ enabled }: { enabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={!enabled || pending}
      className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#00498d] disabled:cursor-not-allowed disabled:opacity-45"
    >
      {pending ? "Guardando de forma segura…" : "Guardar configuración"}
    </button>
  );
}

function DestinationCard({
  platform,
  configuration,
  canSave,
}: {
  platform: SocialPlatformDefinition;
  configuration?: ConfiguredSocialDestination;
  canSave: boolean;
}) {
  const [state, formAction] = useActionState(
    saveSocialDestinationAction,
    initialState,
  );
  const configured = Boolean(configuration);

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gray-50/70 px-5 py-4">
        <div>
          <h3 className="font-bold text-gray-950">{platform.label}</h3>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            {platform.shortHelp}
          </p>
        </div>
        <span
          className={`flex-none rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
            configuration?.enabled
              ? "bg-emerald-50 text-emerald-700"
              : configured
                ? "bg-gray-200 text-gray-600"
                : "bg-amber-50 text-amber-800"
          }`}
        >
          {configuration?.enabled
            ? "Activo"
            : configured
              ? "Desactivado"
              : "Sin configurar"}
        </span>
      </div>

      <form action={formAction} className="space-y-4 p-5">
        <input type="hidden" name="platform" value={platform.id} />
        <label className="block text-sm font-semibold text-gray-700">
          URL del servidor
          <input
            name="ingestUrl"
            type="text"
            autoComplete="off"
            spellCheck={false}
            placeholder={
              configured
                ? "Déjalo vacío para conservar la URL guardada"
                : platform.urlPlaceholder
            }
            className="mt-2 w-full rounded-xl border border-gray-200 px-3.5 py-3 font-mono text-xs font-normal outline-none transition focus:border-[#00498d] focus:ring-2 focus:ring-[#00498d]/10"
          />
        </label>
        <label className="block text-sm font-semibold text-gray-700">
          {platform.keyLabel}
          <input
            name="streamKey"
            type="password"
            autoComplete="new-password"
            spellCheck={false}
            placeholder={
              configured
                ? "Déjalo vacío para conservar la clave guardada"
                : "Pega aquí la clave privada"
            }
            className="mt-2 w-full rounded-xl border border-gray-200 px-3.5 py-3 font-mono text-xs font-normal outline-none transition focus:border-[#00498d] focus:ring-2 focus:ring-[#00498d]/10"
          />
        </label>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-semibold text-gray-700">
          <input
            name="enabled"
            type="checkbox"
            defaultChecked={configuration?.enabled ?? true}
            className="h-4 w-4 accent-[#00498d]"
          />
          Incluir por defecto al crear una transmisión
        </label>
        <div className="rounded-xl bg-sky-50 px-3.5 py-3 text-xs leading-5 text-sky-900">
          {configured
            ? "Las credenciales están cifradas. Por seguridad no se pueden volver a ver; escribe valores nuevos sólo cuando quieras reemplazarlas."
            : "La URL y la clave se cifran antes de guardarse y nunca se envían de vuelta al navegador."}
        </div>
        <SaveButton enabled={canSave} />
        <div className="flex items-center justify-between gap-3">
          <a
            href={platform.helpUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-[#00498d] hover:underline"
          >
            Ver dónde obtener los datos
          </a>
          {configuration?.updatedAt && (
            <span className="text-[10px] text-gray-400">
              Actualizado{" "}
              {new Intl.DateTimeFormat("es-PE", {
                dateStyle: "short",
                timeStyle: "short",
              }).format(new Date(configuration.updatedAt))}
            </span>
          )}
        </div>
        {state.status !== "idle" && state.platform === platform.id && (
          <p
            role="status"
            className={`rounded-xl px-3.5 py-3 text-xs font-semibold leading-5 ${
              state.status === "success"
                ? "bg-emerald-50 text-emerald-800"
                : "bg-red-50 text-red-800"
            }`}
          >
            {state.message}
          </p>
        )}
      </form>
    </article>
  );
}

export default function SocialDestinationsManager({
  destinations,
  databaseReady,
  encryptionReady,
}: {
  destinations: ConfiguredSocialDestination[];
  databaseReady: boolean;
  encryptionReady: boolean;
}) {
  const canSave = databaseReady && encryptionReady;

  return (
    <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00498d]">
            Una señal · todas las plataformas
          </p>
          <h2 className="mt-2 text-xl font-bold text-gray-950">
            Destinos de multitransmisión
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
            Copia una vez el servidor y la llave que entrega cada red. Después,
            el operador sólo inicia OBS: Mux distribuye la misma señal a los
            destinos elegidos.
          </p>
        </div>
        <span
          className={`w-fit rounded-full px-3 py-1 text-[11px] font-bold ${
            canSave
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-800"
          }`}
        >
          {canSave ? "Bóveda lista" : "Configuración pendiente"}
        </span>
      </div>

      {!canSave && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium leading-5 text-amber-900">
          {!databaseReady
            ? "Aplica la migración 202609090002_mux_simulcast.sql en Supabase."
            : "Agrega ENCRYPTION_KEY en Vercel con un valor aleatorio de al menos 32 caracteres."}
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {SOCIAL_PLATFORMS.map((platform) => (
          <DestinationCard
            key={platform.id}
            platform={platform}
            configuration={destinations.find(
              (destination) => destination.platform === platform.id,
            )}
            canSave={canSave}
          />
        ))}
      </div>

      <p className="mt-5 text-xs leading-5 text-amber-800">
        Instagram y TikTok pueden entregar llaves temporales o limitar el acceso
        según la cuenta. Revisa sus datos antes de cada evento importante. Mux
        admite hasta seis destinos simultáneos por señal.
      </p>
    </section>
  );
}
