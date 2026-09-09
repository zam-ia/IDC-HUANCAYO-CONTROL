"use client";

import Link from "next/link";
import type { CampusEvent, CampusUser, Course, Lesson } from "@/lib/db";

type CampusSettingsPanelProps = {
  courses: Course[];
  lessons: Lesson[];
  users: CampusUser[];
  events: CampusEvent[];
};

const policyItems = [
  {
    title: "Acceso administrativo",
    value: "Admin ve todo",
    detail:
      "Los administradores ven cursos publicados, borradores, lecciones ocultas y herramientas de edición.",
  },
  {
    title: "Vista estudiante",
    value: "Manual",
    detail:
      "El administrador puede activar la vista estudiante desde Aula para revisar restricciones sin perder permisos.",
  },
  {
    title: "Acceso estudiante",
    value: "Publicado y gratuito",
    detail:
      "Mientras no exista una tabla de matrículas, los estudiantes solo ven cursos publicados y gratuitos.",
  },
  {
    title: "Fotos de perfil",
    value: "Activas",
    detail:
      "Los usuarios pueden subir y recortar su foto desde Mi perfil; el panel muestra esas fotos.",
  },
];

export default function CampusSettingsPanel({
  courses,
  lessons,
  users,
  events,
}: CampusSettingsPanelProps) {
  const publishedCourses = courses.filter((course) => course.is_published);
  const freeCourses = courses.filter((course) => course.is_free);
  const admins = users.filter((user) => user.role === "admin");
  const inactiveUsers = users.filter((user) => !user.is_active);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            label: "Cursos",
            value: courses.length,
            hint: `${publishedCourses.length} publicados`,
          },
          {
            label: "Lecciones",
            value: lessons.length,
            hint: "Contenido total",
          },
          {
            label: "Usuarios",
            value: users.length,
            hint: `${admins.length} admins`,
          },
          { label: "Eventos", value: events.length, hint: "Agenda campus" },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
              {metric.label}
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {metric.value}
            </p>
            <p className="mt-1 text-[12px] text-gray-500">{metric.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Politicas del campus
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                Reglas operativas actuales para navegación, roles y visibilidad.
              </p>
            </div>
            <Link
              href="/campus/classroom?view=student"
              className="rounded-lg border border-gray-200 px-4 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
            >
              Probar vista estudiante
            </Link>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {policyItems.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13px] font-semibold text-gray-900">
                    {item.title}
                  </p>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#00498d]">
                    {item.value}
                  </span>
                </div>
                <p className="mt-2 text-[12px] leading-5 text-gray-500">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Acciones rápidas</h2>
          <div className="mt-5 grid gap-3">
            {[
              {
                label: "Editar cursos",
                detail: `${freeCourses.length} cursos gratuitos visibles para estudiantes`,
                href: "/admin/cursos",
              },
              {
                label: "Gestionar alumnos",
                detail: `${inactiveUsers.length} usuarios bloqueados o inactivos`,
                href: "/admin/alumnos",
              },
              {
                label: "Emitir certificados",
                detail: "Plantillas VIP, modelo propio y emisión masiva",
                href: "/admin/certificados",
              },
              {
                label: "Programar calendario",
                detail: "Eventos visibles en el campus",
                href: "/admin/noticias",
              },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="rounded-xl border border-gray-100 p-4 transition hover:border-gray-200 hover:bg-gray-50"
              >
                <p className="text-[13px] font-semibold text-gray-900">
                  {action.label}
                </p>
                <p className="mt-1 text-[12px] text-gray-500">
                  {action.detail}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Mapa funcional</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {courses.slice(0, 6).map((course) => {
            const count = lessons.filter(
              (lesson) => lesson.course_id === course.id,
            ).length;
            return (
              <div
                key={course.id}
                className="rounded-xl border border-gray-100 p-4"
              >
                <p className="text-[13px] font-semibold text-gray-900">
                  {course.title}
                </p>
                <p className="mt-1 text-[12px] text-gray-500">
                  {count} lecciones ·{" "}
                  {course.is_published ? "Publicado" : "Borrador"}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
