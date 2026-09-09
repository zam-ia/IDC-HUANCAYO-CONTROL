import { getCampusUsers } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { getPublicSiteUrl } from "@/lib/public-site";

export default async function AdminAlumnosPage() {
  const users = await getCampusUsers();
  const admins = users.filter((user) => user.role === "admin");
  const students = users.filter((user) => user.role !== "admin");
  const inactive = users.filter((user) => !user.is_active);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-medium text-gray-400">
          <Link href="/admin" className="transition hover:text-[#00498d]">
            Panel admin
          </Link>
          <svg
            className="h-3 w-3 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-gray-500">Usuarios y accesos</span>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Usuarios y accesos
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Revisa quién puede entrar al campus y qué permisos tiene. Los
              administradores pueden ver y editar contenido; los estudiantes
              solo acceden a cursos publicados habilitados para su cuenta.
            </p>
          </div>
          <Link
            href={getPublicSiteUrl("/campus/classroom")}
            target="_blank"
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-[13px] font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
          >
            Ver aula
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Usuarios", value: users.length },
            { label: "Administradores", value: admins.length },
            { label: "Inactivos", value: inactive.length },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                {item.label}
              </span>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-[15px] font-semibold text-gray-900">
              Registro de usuarios
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Usuario
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Rol
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Estado
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Acceso actual
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                    Alta
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <a
                            href={user.avatar_url}
                            target="_blank"
                            rel="noreferrer"
                            className="block h-9 w-9 overflow-hidden rounded-lg"
                            title="Ver foto"
                          >
                            <Image
                              src={user.avatar_url}
                              alt={user.name || user.email}
                              width={36}
                              height={36}
                              unoptimized
                              className="h-full w-full object-cover"
                            />
                          </a>
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00498d]/[0.08] text-[13px] font-semibold text-[#00498d]">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-[13px] font-semibold text-gray-900">
                            {user.name || "Sin nombre"}
                          </p>
                          <p className="text-[12px] text-gray-500">
                            {user.email}
                          </p>
                          {user.avatar_url && (
                            <a
                              href={user.avatar_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-medium text-[#00498d] hover:underline"
                            >
                              Ver foto
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          user.role === "admin"
                            ? "bg-[#00498d]/[0.08] text-[#00498d]"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {user.role === "admin" ? "Administrador" : "Estudiante"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          user.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {user.is_active ? "Activo" : "Bloqueado"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-gray-600">
                      {user.role === "admin"
                        ? "Todos los cursos y panel admin"
                        : "Cursos gratuitos publicados"}
                    </td>
                    <td className="px-5 py-4 text-[12px] text-gray-500">
                      {new Date(user.created_at).toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {students.length === 0 && (
            <div className="border-t border-gray-100 px-5 py-8 text-center text-sm text-gray-500">
              Aún no hay estudiantes registrados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
