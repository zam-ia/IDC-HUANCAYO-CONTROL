import Link from "next/link";
import SiteConfigForm from "@/components/admin/SiteConfigForm";
import { getPublicSiteUrl } from "@/lib/public-site";

export const metadata = {
  title: "Configuración del Sitio | Admin",
  description: "Configura los ajustes generales del sitio web de IDC Huancayo",
};

// Datos de ejemplo (luego los cargaremos desde la base de datos)
const siteConfig = {
  siteName: "IDC Huancayo",
  siteDescription: "Iglesia Discípulos de Cristo, sede Huancayo",
  primaryColor: "#00498d",
  logoUrl: null,
  faviconUrl: null,
  email: "contacto@idchuancayo.org",
  phone: "+51 964 909 877",
  address: "Huancayo, Perú",
  facebookUrl: "https://facebook.com/idchuancayo",
  instagramUrl: "https://instagram.com/idchuancayo",
  youtubeUrl: "https://youtube.com/@idchuancayo",
  whatsappNumber: "+51964909877",
};

export default async function ConfiguracionPage() {
  return (
    <div className="min-h-screen bg-[#fafbfc] relative overflow-hidden">
      {/* Fondo decorativo sutil */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#00498d]/[0.015] blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#00498d]/[0.01] blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
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
          <span className="text-gray-500">Configuración</span>
        </div>

        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[1.75rem] sm:text-[2rem] font-bold text-gray-900 tracking-tight">
              Configuración del Sitio
            </h1>
            <p className="text-[14px] text-gray-500/70 mt-1.5 font-normal leading-relaxed">
              Personaliza la apariencia y la información de tu sitio web
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Link
              href={getPublicSiteUrl()}
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
              Ver sitio
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

        {/* Formulario de configuración */}
        <SiteConfigForm initialConfig={siteConfig} />
      </div>
    </div>
  );
}
