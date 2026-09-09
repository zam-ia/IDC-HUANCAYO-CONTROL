import Link from "next/link";

export const metadata = {
  title: "Enseñanza Bíblica | Admin",
  description: "Configura la landing de enseñanza bíblica de IDC Huancayo",
};

export default async function AdminEnsenanzaPage() {
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
          <span className="text-gray-500">Enseñanza Bíblica</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Enseñanza Bíblica
        </h1>
        <p className="text-gray-500 mb-6">
          Configura la landing de cursos y la VSL.
        </p>
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
          Configuración de enseñanza bíblica en construcción. Vuelve pronto.
        </div>
      </div>
    </div>
  );
}
