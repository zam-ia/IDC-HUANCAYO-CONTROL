"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import type { Course } from "@/lib/db";

const CourseEditModal = dynamic(() => import("./CourseEditModal"), {
  loading: () => null,
});

export default function ClassroomGrid({
  courses,
  isAdminView = false,
}: {
  courses: Course[];
  isAdminView?: boolean;
}) {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showCopyToast, setShowCopyToast] = useState(false);

  const handleShareLink = (slug: string) => {
    const url = `${window.location.origin}/campus/classroom/${slug}`;
    void navigator.clipboard.writeText(url);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
    setOpenMenuId(null);
  };

  if (courses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#00498d]/[0.06] text-[#00498d]">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.7}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 className="text-[15px] font-semibold text-gray-900">
          No hay cursos disponibles
        </h3>
        <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-gray-500">
          {isAdminView
            ? "Crea o publica un curso para que aparezca en el campus."
            : "Tu cuenta no tiene cursos habilitados por ahora."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const isLockedForMember = !isAdminView && !course.is_free;

          return (
            <div key={course.id} className="relative group/card">
              <Link
                href={
                  isLockedForMember
                    ? "/campus/classroom"
                    : `/campus/classroom/${course.slug}`
                }
                className={`block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:border-gray-200 hover:shadow-md ${
                  !course.is_published ? "opacity-75" : ""
                } ${isLockedForMember ? "pointer-events-none opacity-70" : ""}`}
              >
                <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#00498d]/10 via-[#00498d]/5 to-gray-100">
                  {course.thumbnail_url ? (
                    <Image
                      src={course.thumbnail_url}
                      alt={course.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="h-12 w-12 text-[#00498d]/15"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                  )}

                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    {!course.is_published && (
                      <span className="rounded-lg bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-gray-600 shadow-sm backdrop-blur-sm">
                        Borrador
                      </span>
                    )}
                    {isLockedForMember && (
                      <span className="rounded-lg bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-gray-600 shadow-sm backdrop-blur-sm">
                        Requiere acceso
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-lg bg-[#00498d]/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#00498d]">
                      {course.is_free ? "Gratuito" : `S/ ${course.price ?? 0}`}
                    </span>
                    {course.duration_weeks && (
                      <span className="text-[11px] font-medium text-gray-400">
                        {course.duration_weeks} semanas
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold uppercase leading-tight tracking-tight text-gray-900">
                    {course.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-500">
                    {course.description || "Sin descripción"}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#00498d]">
                    {isLockedForMember ? "Solicita acceso" : "Continuar"}
                    <svg
                      className="h-3.5 w-3.5"
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
                  </span>
                </div>
              </Link>

              {isAdminView && (
                <div className="absolute right-3 top-3 z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenMenuId(
                        openMenuId === course.id ? null : course.id,
                      );
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white/95 shadow-md transition hover:bg-white hover:shadow-lg"
                    aria-label="Opciones del curso"
                  >
                    <svg
                      className="h-4 w-4 text-gray-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle cx="5" cy="12" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="19" cy="12" r="2" />
                    </svg>
                  </button>

                  {openMenuId === course.id && (
                    <>
                      <button
                        type="button"
                        className="fixed inset-0 z-20 cursor-default"
                        onClick={() => setOpenMenuId(null)}
                        aria-label="Cerrar opciones"
                      />
                      <div className="absolute right-0 top-10 z-30 w-52 rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditingCourse(course);
                            setOpenMenuId(null);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                        >
                          Editar curso
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleShareLink(course.slug);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                        >
                          Copiar enlace
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editingCourse && (
        <CourseEditModal
          course={{
            ...editingCourse,
            description: editingCourse.description || "",
            price: editingCourse.price || 0,
            course_type: editingCourse.course_type || undefined,
            thumbnail_url: editingCourse.thumbnail_url || undefined,
          }}
          onClose={() => setEditingCourse(null)}
        />
      )}

      {showCopyToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          Enlace copiado al portapapeles
        </div>
      )}
    </>
  );
}
