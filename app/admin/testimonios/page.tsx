import Link from "next/link";

export const metadata = {
  title: "Administrar Testimonios | Admin",
  description: "Panel de administración de testimonios de IDC Huancayo",
};

export default async function AdminTestimoniosPage() {
  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
          <span className="text-gray-500">Testimonios</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestionar Testimonios
        </h1>
        <p className="text-gray-500 mb-6">
          Administra los testimonios de la comunidad.
        </p>
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
          Gestor de testimonios en construcción. Vuelve pronto.
        </div>
      </div>
    </div>
  );
}
