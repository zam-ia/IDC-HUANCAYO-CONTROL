import { getAllCourses, getCampusUsers, getSiteConfig } from "@/lib/db";
import CertificateStudio from "@/components/admin/CertificateStudio";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminCertificadosPage() {
  const [users, courses, siteConfig] = await Promise.all([
    getCampusUsers(),
    getAllCourses(),
    getSiteConfig(),
  ]);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto max-w-[92rem] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-gray-400">
          <Link href="/admin" className="hover:text-[#00498d]">
            Panel Admin
          </Link>
          <span>/</span>
          <span className="text-gray-500">Certificados</span>
        </div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Certificados del Campus
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
            Crea plantillas institucionales, carga modelos propios, agrega
            campos personalizados y exporta certificados individuales o en masa
            con logo y colores de la iglesia.
          </p>
        </div>

        <CertificateStudio
          users={users}
          courses={courses}
          siteConfig={siteConfig}
        />
      </div>
    </div>
  );
}
