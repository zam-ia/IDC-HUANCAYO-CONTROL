import { format } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";

interface LivePreviewProps {
  type: "noticia" | "devocional" | "testimonio" | "nosotros";
  data: {
    title?: string;
    content?: string;
    excerpt?: string;
    name?: string;
    role?: string;
    text?: string;
    mission?: string;
    vision?: string;
    featured_image?: string | null;
    values?: { title: string; desc: string }[];
    [key: string]: any;
  };
}

export default function LivePreview({ type, data }: LivePreviewProps) {
  const today = format(new Date(), "d MMM yyyy", { locale: es });

  // ── Vista previa: Noticia ──
  if (type === "noticia") {
    return (
      <div className="relative">
        {/* Etiqueta de vista previa */}
        <div className="absolute -top-2.5 left-4 z-10">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] bg-[#00498d] text-white px-3 py-1 rounded-lg shadow-md shadow-[#00498d]/25 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
            Vista previa
          </span>
        </div>

        <div className="bg-white border border-gray-100/80 rounded-2xl overflow-hidden shadow-sm shadow-gray-200/30 group hover:shadow-xl hover:shadow-gray-200/40 hover:-translate-y-1 transition-all duration-500">
          {/* Imagen destacada o placeholder */}
          {data.featured_image ? (
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={data.featured_image}
                alt={data.title || "Vista previa"}
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                unoptimized
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="absolute top-3 right-3 bg-white/70 backdrop-blur-md text-gray-700 text-[10px] font-semibold px-3 py-1.5 rounded-lg shadow-sm shadow-gray-200/30">
                {today}
              </span>
            </div>
          ) : (
            <div className="relative aspect-[16/10] bg-gradient-to-br from-[#00498d]/[0.06] to-[#00498d]/[0.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-[#00498d]/10 group-hover:scale-110 transition-transform duration-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <span className="absolute top-3 right-3 bg-white/70 backdrop-blur-md text-gray-700 text-[10px] font-semibold px-3 py-1.5 rounded-lg shadow-sm shadow-gray-200/30">
                {today}
              </span>
            </div>
          )}

          {/* Contenido */}
          <div className="p-6">
            <h3 className="text-[17px] font-semibold text-gray-800 mb-2.5 leading-snug group-hover:text-[#00498d] transition-colors duration-300">
              {data.title || "Título de la noticia"}
            </h3>
            <p className="text-[13px] text-gray-500/70 leading-relaxed line-clamp-3 font-normal">
              {data.excerpt ||
                "El extracto de la noticia aparecerá aquí. Escribe un resumen atractivo para tus lectores..."}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100/80 flex items-center gap-1.5">
              <span className="text-[12px] font-medium text-[#00498d]/40 group-hover:text-[#00498d]/60 transition-colors duration-300">
                Leer más
              </span>
              <svg
                className="w-3.5 h-3.5 text-[#00498d]/40 group-hover:text-[#00498d]/60 group-hover:translate-x-0.5 transition-all duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0-4 4m4-4H3"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Vista previa: Devocional ──
  if (type === "devocional") {
    return (
      <div className="relative">
        {/* Etiqueta de vista previa */}
        <div className="absolute -top-2.5 left-4 z-10">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] bg-[#00498d] text-white px-3 py-1 rounded-lg shadow-md shadow-[#00498d]/25 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
            Vista previa
          </span>
        </div>

        <div className="bg-white border border-gray-100/80 rounded-2xl overflow-hidden shadow-sm shadow-gray-200/30 group hover:shadow-xl hover:shadow-gray-200/40 hover:-translate-y-1 transition-all duration-500">
          {data.featured_image ? (
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={data.featured_image}
                alt={data.title || "Vista previa"}
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                unoptimized
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          ) : (
            <div className="relative aspect-[16/10] bg-gradient-to-br from-[#00498d]/[0.05] via-[#00498d]/[0.02] to-transparent flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 backdrop-blur-[2px]" />
              <svg
                className="relative w-10 h-10 text-[#00498d]/12 group-hover:scale-110 transition-transform duration-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          )}

          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-semibold text-[#00498d]/50 uppercase tracking-[0.15em] bg-[#00498d]/[0.04] px-2.5 py-1 rounded-md">
                Devocional
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                {today}
              </span>
            </div>
            <h3 className="text-[17px] font-semibold text-gray-800 mb-2.5 leading-snug group-hover:text-[#00498d] transition-colors duration-300">
              {data.title || "Título del devocional"}
            </h3>
            <p className="text-[13px] text-gray-500/70 leading-relaxed line-clamp-2 font-normal">
              {data.excerpt ||
                "El extracto del devocional aparecerá aquí. Escribe una reflexión que invite a la lectura diaria..."}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100/80 flex items-center gap-1.5">
              <span className="text-[12px] font-medium text-[#00498d]/40 group-hover:text-[#00498d]/60 transition-colors duration-300">
                Leer más
              </span>
              <svg
                className="w-3.5 h-3.5 text-[#00498d]/40 group-hover:text-[#00498d]/60 group-hover:translate-x-0.5 transition-all duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0-4 4m4-4H3"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Vista previa: Testimonio ──
  if (type === "testimonio") {
    return (
      <div className="relative">
        {/* Etiqueta de vista previa */}
        <div className="absolute -top-2.5 left-4 z-10">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] bg-[#00498d] text-white px-3 py-1 rounded-lg shadow-md shadow-[#00498d]/25 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
            Vista previa
          </span>
        </div>

        <div className="bg-white border border-gray-100/80 rounded-2xl p-8 shadow-sm shadow-gray-200/30 group hover:shadow-xl hover:shadow-gray-200/40 hover:-translate-y-1 transition-all duration-500">
          {/* Comilla decorativa de fondo */}
          <svg
            className="absolute top-6 right-6 w-12 h-12 text-[#00498d]/[0.04] rotate-180 pointer-events-none"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.69 11 13.224 11 15c0 1.933-1.567 3.5-3.5 3.5-1.239 0-2.259-.611-2.917-1.179zM16.583 17.321c-1.03-.894-1.583-2.121-1.583-4.11 0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C21.591 11.69 23 13.224 23 15c0 1.933-1.567 3.5-3.5 3.5-1.239 0-2.259-.611-2.917-1.179z" />
          </svg>

          {/* Avatar */}
          <div className="relative mb-6">
            <div className="w-12 h-12 rounded-full bg-[#00498d]/[0.06] backdrop-blur-sm border border-[#00498d]/[0.08] flex items-center justify-center shadow-sm shadow-[#00498d]/[0.04] group-hover:shadow-md group-hover:shadow-[#00498d]/[0.06] group-hover:scale-105 transition-all duration-500">
              <span className="text-[15px] font-semibold text-[#00498d]/70">
                {data.name ? data.name.charAt(0).toUpperCase() : "T"}
              </span>
            </div>
          </div>

          {/* Texto del testimonio */}
          <blockquote className="text-[14px] text-gray-500/70 leading-relaxed mb-6 font-normal line-clamp-5 relative z-10">
            &ldquo;
            {data.text ||
              "Escribe aquí el testimonio completo. Comparte cómo Dios transformó esta vida..."}
            &rdquo;
          </blockquote>

          {/* Autor */}
          <div className="border-t border-gray-100/80 pt-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00498d]/[0.08] to-[#00498d]/[0.04] flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] font-semibold text-[#00498d]/60">
                {data.name ? data.name.charAt(0).toUpperCase() : "T"}
              </span>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-gray-800 leading-tight">
                {data.name || "Nombre del autor"}
              </p>
              <p className="text-[11px] text-gray-400/90 mt-0.5 font-medium">
                {data.role || "Rol o ministerio"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Vista previa: Nosotros ──
  if (type === "nosotros") {
    return (
      <div className="relative">
        {/* Etiqueta de vista previa */}
        <div className="absolute -top-2.5 left-4 z-10">
          <span className="text-[10px] font-semibold uppercase tracking-[0.15em] bg-[#00498d] text-white px-3 py-1 rounded-lg shadow-md shadow-[#00498d]/25 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
            Vista previa
          </span>
        </div>

        <div className="bg-white border border-gray-100/80 rounded-2xl p-8 shadow-sm shadow-gray-200/30 space-y-8 relative overflow-hidden">
          {/* Círculo decorativo de fondo */}
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#00498d]/[0.015] blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

          {/* Misión */}
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-[#00498d]/[0.05] backdrop-blur-sm border border-[#00498d]/[0.06] flex items-center justify-center mb-4 shadow-sm shadow-[#00498d]/[0.03]">
              <svg
                className="w-5 h-5 text-[#00498d]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-[1.1rem] font-bold text-gray-800 mb-2">
              Nuestra Misión
            </h3>
            <p className="text-[14px] text-gray-500/70 leading-relaxed font-normal">
              {data.mission || "Escribe aquí la misión de la iglesia..."}
            </p>
          </div>

          {/* Visión */}
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-[#00498d]/[0.05] backdrop-blur-sm border border-[#00498d]/[0.06] flex items-center justify-center mb-4 shadow-sm shadow-[#00498d]/[0.03]">
              <svg
                className="w-5 h-5 text-[#00498d]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <h3 className="text-[1.1rem] font-bold text-gray-800 mb-2">
              Nuestra Visión
            </h3>
            <p className="text-[14px] text-gray-500/70 leading-relaxed font-normal">
              {data.vision || "Escribe aquí la visión de la iglesia..."}
            </p>
          </div>

          {/* Valores */}
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-[#00498d]/[0.05] backdrop-blur-sm border border-[#00498d]/[0.06] flex items-center justify-center mb-4 shadow-sm shadow-[#00498d]/[0.03]">
              <svg
                className="w-5 h-5 text-[#00498d]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h3 className="text-[1.1rem] font-bold text-gray-800 mb-4">
              Nuestros Valores
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {(data.values && data.values.length > 0
                ? data.values.slice(0, 4)
                : [
                    {
                      title: "Amor",
                      desc: "Todo lo que hacemos está motivado por el amor de Dios.",
                    },
                    {
                      title: "Verdad",
                      desc: "Creemos en la Biblia como la Palabra inspirada de Dios.",
                    },
                    {
                      title: "Comunidad",
                      desc: "No caminamos solos. Somos una familia.",
                    },
                    {
                      title: "Servicio",
                      desc: "Seguimos el ejemplo de Jesús sirviendo a nuestra ciudad.",
                    },
                  ]
              ).map((v: any, i: number) => (
                <div
                  key={i}
                  className="bg-[#fafbfc] border border-gray-100/80 p-4 rounded-xl hover:border-gray-200/80 hover:shadow-sm hover:shadow-gray-200/20 transition-all duration-300"
                >
                  <h4 className="text-[14px] font-semibold text-gray-800 mb-1">
                    {v.title}
                  </h4>
                  <p className="text-[12px] text-gray-500/70 leading-relaxed line-clamp-2 font-normal">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
