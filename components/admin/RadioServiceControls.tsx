"use client";

import { useActionState } from "react";
import {
  controlRadioServiceAction,
  type RadioControlState,
} from "@/app/admin/radio/service-actions";

const initialState: RadioControlState = { status: "idle", message: "" };

export default function RadioServiceControls({
  enabled,
}: {
  enabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    controlRadioServiceAction,
    initialState,
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <form action={formAction} className="flex-1">
          <input type="hidden" name="action" value="skip" />
          <button
            disabled={!enabled || pending}
            className="min-h-11 w-full rounded-xl bg-[#00498d] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#00396f] disabled:cursor-not-allowed disabled:opacity-45"
          >
            {pending ? "Procesando…" : "Saltar canción"}
          </button>
        </form>
        <form
          action={formAction}
          className="flex-1"
          onSubmit={(event) => {
            if (
              !window.confirm(
                "Reiniciar desconectará a los oyentes durante unos segundos. ¿Deseas continuar?",
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="action" value="restart" />
          <button
            disabled={!enabled || pending}
            className="min-h-11 w-full rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Reiniciar radio
          </button>
        </form>
      </div>
      {state.message && (
        <p
          role="status"
          className={`mt-3 rounded-xl px-4 py-3 text-xs leading-5 ${state.status === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}
