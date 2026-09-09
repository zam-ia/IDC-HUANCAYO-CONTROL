"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f6f9] px-6">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600">
          No pudimos abrir esta sección
        </p>
        <h1 className="mt-3 text-2xl font-bold text-slate-950">
          Hubo un problema temporal
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Tus datos no se han perdido. Reintenta o vuelve al panel principal.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-xl bg-[#00569d] px-4 py-2.5 text-sm font-bold text-white"
          >
            Reintentar
          </button>
          <a
            href="/admin"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"
          >
            Ir al inicio
          </a>
        </div>
      </section>
    </main>
  );
}
