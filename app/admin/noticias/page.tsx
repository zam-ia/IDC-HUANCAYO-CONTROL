import { getAllPosts } from "@/lib/db";
import Link from "next/link";
import AdminNewsManager from "@/components/admin/AdminNewsManager";
import { getPublicSiteUrl } from "@/lib/public-site";

export const metadata = {
  title: "Administrar Noticias | Admin",
  description: "Panel de administración de noticias de IDC Huancayo",
};

export default async function AdminNoticiasPage() {
  // Obtener todas las noticias (publicadas y no publicadas) para administración
  const noticias = await getAllPosts("noticia");

  return (
    <div className="min-h-screen bg-[#fafbfc] relative overflow-hidden">
      {/* Fondo decorativo sutil */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#00498d]/[0.015] blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#00498d]/[0.01] blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb + acciones */}
        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium mb-2">
          <Link
            href="/admin"
            className="hover:text-[#00498d] transition-colors"
          >
            Panel Admin
          </Link>
          <svg
            className="w-3 h-3 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-gray-500">Noticias</span>
        </div>

        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[1.75rem] sm:text-[2rem] font-bold text-gray-900 tracking-tight">
              Gestionar Noticias
            </h1>
            <p className="text-[14px] text-gray-500/70 mt-1.5 font-normal leading-relaxed">
              Crea, edita y administra las noticias y eventos de la iglesia
            </p>
          </div>

          {/* Acciones rápidas */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Link
              href={getPublicSiteUrl("/noticias")}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-700 bg-white border border-gray-200/80 px-4 py-2.5 rounded-xl hover:bg-[#fafbfc] hover:border-gray-300 transition-all duration-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Vista previa
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#00498d]/60 hover:text-[#00498d] transition-colors group"
            >
              <svg
                className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Volver al panel
            </Link>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-white rounded-2xl shadow-sm shadow-gray-200/30 border border-gray-100/80 overflow-hidden">
          {/* Barra de utilidades */}
          <div className="p-5 border-b border-gray-100/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-gray-500 font-medium">
                {noticias.length} noticia{noticias.length !== 1 ? "s" : ""} en
                total
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span className="text-[12px] text-gray-400 font-medium">
                Mostrando todas
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar noticias..."
                  className="pl-9 pr-3 py-2 text-[12px] border border-gray-200/80 rounded-lg focus:outline-none focus:border-[#00498d]/30 focus:ring-1 focus:ring-[#00498d]/[0.08] transition-all duration-200 w-48"
                />
              </div>
              <button className="px-3 py-2 text-[12px] font-medium text-gray-500 border border-gray-200/80 rounded-lg hover:bg-gray-50/80 transition-colors flex items-center gap-1.5">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                Filtros
              </button>
            </div>
          </div>

          {/* Tabla / Contenido del administrador */}
          <div className="p-5">
            <AdminNewsManager news={noticias} />
          </div>
        </div>
      </div>
    </div>
  );
}
