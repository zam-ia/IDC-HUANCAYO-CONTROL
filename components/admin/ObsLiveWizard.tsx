"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  createObsLiveEventAction,
  type ObsWizardState,
} from "@/app/admin/medios/actions";
import type { SocialPlatform } from "@/lib/simulcast";

const initialState: ObsWizardState = { status: "idle", message: "" };

function SubmitButton({ enabled }: { enabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={!enabled || pending}
      className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#00498d] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#003d7a] disabled:cursor-not-allowed disabled:opacity-45"
    >
      {pending ? "Preparando señal…" : "Crear señal para OBS"}
    </button>
  );
}

function CopyValue({
  label,
  value,
  secret = false,
}: {
  label: string;
  value: string;
  secret?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
        {label}
      </p>
      <div className="mt-2 flex gap-2">
        <input
          readOnly
          type={secret ? "password" : "text"}
          value={value}
          className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 font-mono text-xs text-gray-800"
          aria-label={label}
        />
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
          }}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-[#00498d] hover:bg-gray-50"
        >
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
    </div>
  );
}

export default function ObsLiveWizard({
  muxReady,
  databaseReady,
  destinationSchemaReady,
  socialDestinations,
}: {
  muxReady: boolean;
  databaseReady: boolean;
  destinationSchemaReady: boolean;
  socialDestinations: Array<{
    platform: SocialPlatform;
    label: string;
    configured: boolean;
    enabled: boolean;
  }>;
}) {
  const [state, formAction] = useActionState(
    createObsLiveEventAction,
    initialState,
  );
  const canCreate = muxReady && databaseReady && destinationSchemaReady;
  const setupMessage = !databaseReady
    ? "Falta conectar Supabase y aplicar la migración de medios."
    : !destinationSchemaReady
      ? "Falta aplicar la migración de multitransmisión en Supabase."
      : !muxReady
        ? "Falta agregar MUX_TOKEN_ID y MUX_TOKEN_SECRET en Vercel."
        : null;

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-600">
            Flujo recomendado
          </p>
          <h2 className="mt-2 text-xl font-bold text-gray-950">
            Nueva transmisión con OBS
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Completa los datos del evento. El panel crea la señal en Mux y te
            entrega exactamente lo que debes pegar en OBS.
          </p>
        </div>
        <span
          className={`flex-none rounded-full px-3 py-1 text-[11px] font-bold ${canCreate ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}
        >
          {canCreate ? "Listo para crear" : "Configuración pendiente"}
        </span>
      </div>

      {setupMessage && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium leading-5 text-amber-900">
          {setupMessage} Encontrarás la ubicación exacta en “Configuración
          inicial”, al final de esta página.
        </div>
      )}

      <form action={formAction} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
          Nombre de la transmisión
          <input
            name="title"
            required
            minLength={3}
            placeholder="Servicio dominical"
            className="mt-2 w-full rounded-xl border border-gray-200 px-3.5 py-3 font-normal outline-none transition focus:border-[#00498d] focus:ring-2 focus:ring-[#00498d]/10"
          />
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Fecha y hora
          <input
            name="scheduledAt"
            type="datetime-local"
            required
            className="mt-2 w-full rounded-xl border border-gray-200 px-3.5 py-3 font-normal outline-none focus:border-[#00498d]"
          />
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Orador o responsable
          <input
            name="speaker"
            placeholder="Nombre (opcional)"
            className="mt-2 w-full rounded-xl border border-gray-200 px-3.5 py-3 font-normal outline-none focus:border-[#00498d]"
          />
        </label>
        <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
          Descripción breve
          <textarea
            name="description"
            rows={2}
            placeholder="Información que verá el público"
            className="mt-2 w-full rounded-xl border border-gray-200 px-3.5 py-3 font-normal outline-none focus:border-[#00498d]"
          />
        </label>
        <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
          Enlace alternativo (opcional)
          <input
            name="socialFallbackUrl"
            type="url"
            placeholder="https://youtube.com/..."
            className="mt-2 w-full rounded-xl border border-gray-200 px-3.5 py-3 font-normal outline-none focus:border-[#00498d]"
          />
        </label>
        <fieldset className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 sm:col-span-2">
          <legend className="px-1 text-sm font-bold text-gray-900">
            ¿A dónde enviará Mux esta señal?
          </legend>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            La página web siempre queda incluida. Puedes quitar una red sólo
            para este evento sin borrar sus credenciales.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {socialDestinations.map((destination) => {
              const selectable = destination.configured && destination.enabled;
              return (
                <label
                  key={`${destination.platform}-${selectable}`}
                  className={`flex min-h-12 items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-sm font-semibold ${
                    selectable
                      ? "cursor-pointer border-gray-200 bg-white text-gray-800"
                      : "cursor-not-allowed border-gray-100 bg-gray-100 text-gray-400"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      name="destinations"
                      value={destination.platform}
                      type="checkbox"
                      defaultChecked={selectable}
                      disabled={!selectable}
                      className="h-4 w-4 accent-[#00498d]"
                    />
                    {destination.label}
                  </span>
                  <span className="text-[10px] font-bold uppercase">
                    {selectable ? "Incluido" : "Configurar abajo"}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <div className="sm:col-span-2">
          <SubmitButton enabled={canCreate} />
        </div>
      </form>

      {state.status !== "idle" && (
        <div
          className={`mt-5 rounded-2xl border p-4 ${state.status === "success" ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}
        >
          <p
            className={`text-sm font-semibold ${state.status === "success" ? "text-emerald-900" : "text-red-800"}`}
          >
            {state.message}
          </p>
          {state.status === "success" && state.obsServer && state.streamKey && (
            <div className="mt-4 space-y-4 rounded-xl bg-white p-4">
              <CopyValue label="Servidor de OBS" value={state.obsServer} />
              <CopyValue
                label="Clave de transmisión"
                value={state.streamKey}
                secret
              />
              {state.destinations?.length ? (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">
                    Salidas preparadas
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {state.destinations.map((destination) => (
                      <span
                        key={destination}
                        className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700"
                      >
                        {destination}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              <p className="text-xs leading-5 text-amber-800">
                Guarda la llave ahora en el perfil de OBS. Por seguridad no se
                almacena ni vuelve a mostrarse en este panel.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
