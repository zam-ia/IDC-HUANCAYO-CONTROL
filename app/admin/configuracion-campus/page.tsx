import {
  getAllCourses,
  getAllLessons,
  getCampusEvents,
  getCampusUsers,
} from "@/lib/db";
import CampusSettingsPanel from "@/components/admin/CampusSettingsPanel";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminConfigCampusPage() {
  const [courses, lessons, users, events] = await Promise.all([
    getAllCourses(),
    getAllLessons(),
    getCampusUsers(),
    getCampusEvents(),
  ]);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-gray-400">
          <Link href="/admin" className="hover:text-[#00498d]">
            Panel Admin
          </Link>
          <span>/</span>
          <span className="text-gray-500">Configuracion Campus</span>
        </div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Configuracion del Campus
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
            Supervisa reglas, visibilidad, calendario, usuarios y rutas clave
            del campus virtual en un panel operativo.
          </p>
        </div>

        <CampusSettingsPanel
          courses={courses}
          lessons={lessons}
          users={users}
          events={events}
        />
      </div>
    </div>
  );
}
