import { getAllCourses, getAllLessons } from "@/lib/db";
import AdminCourseStudio from "@/components/admin/AdminCourseStudio";
import Link from "next/link";
import { getPublicSiteUrl } from "@/lib/public-site";

export const dynamic = "force-dynamic";

export default async function AdminCursosPage() {
  const [courses, lessons] = await Promise.all([
    getAllCourses(),
    getAllLessons(),
  ]);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto max-w-[92rem] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-gray-400">
          <Link href="/admin" className="hover:text-[#00498d]">
            Panel Admin
          </Link>
          <span>/</span>
          <span className="text-gray-500">Cursos</span>
        </div>
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Cursos del Campus
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
              Gestiona el aula desde un solo tablero: ramificacion de cursos,
              editor central y vista previa en tiempo real sin salir del panel.
            </p>
          </div>
          <Link
            href={getPublicSiteUrl("/campus/classroom")}
            target="_blank"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
          >
            Ver aula publicada
          </Link>
        </div>

        <AdminCourseStudio initialCourses={courses} lessons={lessons} />
      </div>
    </div>
  );
}
