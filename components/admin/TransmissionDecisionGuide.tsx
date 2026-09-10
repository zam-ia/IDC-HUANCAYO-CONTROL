import TransmissionCostCalculator from "@/components/admin/TransmissionCostCalculator";

export default function TransmissionDecisionGuide() {
  return (
    <section className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00498d]">
        Estrategia recomendada
      </p>
      <div className="mt-2 flex flex-col justify-between gap-3 lg:flex-row lg:items-end">
        <div>
          <h2 className="text-xl font-bold text-gray-950">
            Una señal principal y un respaldo listo
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
            Mux conserva el reproductor de la web, las grabaciones y el estado
            de cada red. Aitum puede quedar configurado en otro perfil de OBS
            para una contingencia, sin exponer llaves en este panel.
          </p>
        </div>
        <span className="w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
          Mux activo
        </span>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border-2 border-[#00498d] bg-[#00498d]/[0.035] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#00498d]">
            Principal
          </p>
          <h3 className="mt-2 font-bold text-gray-950">OBS → Mux</h3>
          <p className="mt-2 text-xs leading-5 text-gray-600">
            Una sola subida desde la iglesia, web propia, replay, webhook y
            monitoreo por destino. Es la ruta ya integrada.
          </p>
        </article>
        <article className="rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700">
            Respaldo gratuito
          </p>
          <h3 className="mt-2 font-bold text-gray-950">OBS + Aitum</h3>
          <p className="mt-2 text-xs leading-5 text-gray-600">
            Envía directamente a varias redes. Consume más subida y más CPU, y
            no alimenta el reproductor Mux de la página.
          </p>
        </article>
        <article className="rounded-2xl border border-gray-200 p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">
            Fase futura
          </p>
          <h3 className="mt-2 font-bold text-gray-950">Relay SRS</h3>
          <p className="mt-2 text-xs leading-5 text-gray-600">
            Evita depender de un proveedor, pero necesita VPS, FFmpeg,
            seguridad, reintentos y una persona responsable del servidor.
          </p>
        </article>
      </div>

      <TransmissionCostCalculator />

      <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold">
        <a
          href="https://www.mux.com/docs/pricing/overview"
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-gray-700 hover:bg-gray-50"
        >
          Tarifas oficiales de Mux
        </a>
        <a
          href="https://github.com/Aitum/obs-aitum-multistream/releases"
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-gray-700 hover:bg-gray-50"
        >
          Descargar Aitum
        </a>
        <a
          href="https://support.google.com/youtube/answer/16404722?hl=es"
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-gray-200 px-4 py-2.5 text-gray-700 hover:bg-gray-50"
        >
          Guía de ancho de banda
        </a>
      </div>
      <p className="mt-3 text-[11px] leading-5 text-gray-400">
        Referencia de cálculo consultada en septiembre de 2026: entrada en vivo
        1080p a US$0.03125/min y simulcast a US$0.02/min por destino. Confirma
        siempre la tarifa vigente antes de un evento largo.
      </p>
    </section>
  );
}
