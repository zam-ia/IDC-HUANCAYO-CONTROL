"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Course, Lesson } from "@/lib/db";

type AdminCourseStudioProps = {
  initialCourses: Course[];
  lessons: Lesson[];
};

type DraftCourse = Pick<
  Course,
  | "title"
  | "slug"
  | "description"
  | "course_type"
  | "duration_weeks"
  | "is_free"
  | "price"
  | "thumbnail_url"
  | "is_published"
>;

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#00498d]/40 focus:ring-2 focus:ring-[#00498d]/[0.08]";

function toDraft(course: Course): DraftCourse {
  return {
    title: course.title,
    slug: course.slug,
    description: course.description || "",
    course_type: course.course_type || "",
    duration_weeks: course.duration_weeks || 0,
    is_free: course.is_free,
    price: course.price || 0,
    thumbnail_url: course.thumbnail_url || "",
    is_published: course.is_published,
  };
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminCourseStudio({
  initialCourses,
  lessons,
}: AdminCourseStudioProps) {
  const [courses, setCourses] = useState(initialCourses);
  const [selectedCourseId, setSelectedCourseId] = useState(
    initialCourses[0]?.id || "",
  );
  const selectedCourse =
    courses.find((course) => course.id === selectedCourseId) || courses[0];
  const [draft, setDraft] = useState<DraftCourse | null>(
    selectedCourse ? toDraft(selectedCourse) : null,
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<
    "contenido" | "acceso" | "preview"
  >("contenido");

  const lessonsByCourse = useMemo(() => {
    return lessons.reduce<Record<string, Lesson[]>>((acc, lesson) => {
      acc[lesson.course_id] = [...(acc[lesson.course_id] || []), lesson];
      return acc;
    }, {});
  }, [lessons]);

  const courseLessons = selectedCourse
    ? lessonsByCourse[selectedCourse.id] || []
    : [];
  const publishedLessons = courseLessons.filter(
    (lesson) => lesson.is_published,
  );

  const selectCourse = (course: Course) => {
    setSelectedCourseId(course.id);
    setDraft(toDraft(course));
    setMessage("");
  };

  const patchDraft = <K extends keyof DraftCourse>(
    key: K,
    value: DraftCourse[K],
  ) => {
    setDraft((current) => {
      if (!current) return current;
      const next = { ...current, [key]: value };
      if (key === "title" && !current.slug) {
        next.slug = normalizeSlug(String(value));
      }
      return next;
    });
    setMessage("");
  };

  const handleSave = async () => {
    if (!selectedCourse || !draft) return;
    setSaving(true);
    setMessage("");

    const payload = {
      title: draft.title.trim(),
      slug: normalizeSlug(draft.slug || draft.title),
      description: draft.description?.trim() || null,
      course_type: draft.course_type?.trim() || null,
      duration_weeks: Number(draft.duration_weeks) || null,
      is_free: draft.is_free,
      price: draft.is_free ? 0 : Number(draft.price) || 0,
      thumbnail_url: draft.thumbnail_url?.trim() || null,
      is_published: draft.is_published,
    };

    const { data, error } = await supabase
      .from("courses")
      .update(payload)
      .eq("id", selectedCourse.id)
      .select("*")
      .single();

    setSaving(false);
    if (error) {
      setMessage(`No se pudo guardar: ${error.message}`);
      return;
    }

    setCourses((current) =>
      current.map((course) =>
        course.id === selectedCourse.id ? data : course,
      ),
    );
    setDraft(toDraft(data));
    setMessage("Curso actualizado.");
  };

  const createCourse = async () => {
    const title = "Nuevo curso";
    const { data, error } = await supabase
      .from("courses")
      .insert({
        title,
        slug: `nuevo-curso-${Date.now()}`,
        description: "Describe el objetivo del curso.",
        is_free: true,
        price: 0,
        is_published: false,
      })
      .select("*")
      .single();

    if (error) {
      setMessage(`No se pudo crear: ${error.message}`);
      return;
    }

    setCourses((current) => [...current, data]);
    selectCourse(data);
  };

  if (!draft || !selectedCourse) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Aun no hay cursos
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Crea el primer curso del campus para empezar a organizar lecciones.
        </p>
        <button
          type="button"
          onClick={createCourse}
          className="mt-5 rounded-xl bg-[#00498d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#003d7a]"
        >
          Crear curso
        </button>
      </div>
    );
  }

  return (
    <div className="grid min-h-[720px] gap-5 lg:grid-cols-[280px_minmax(0,1fr)_380px]">
      <aside className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold text-gray-900">
                Ramificacion
              </h2>
              <p className="text-[12px] text-gray-500">Cursos y lecciones</p>
            </div>
            <button
              type="button"
              onClick={createCourse}
              className="rounded-lg bg-[#00498d] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#003d7a]"
            >
              Nuevo
            </button>
          </div>
        </div>
        <div className="max-h-[650px] overflow-y-auto p-3">
          {courses.map((course) => {
            const count = lessonsByCourse[course.id]?.length || 0;
            const active = course.id === selectedCourse.id;
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => selectCourse(course)}
                className={`mb-2 w-full rounded-xl border p-3 text-left transition ${
                  active
                    ? "border-[#00498d]/30 bg-[#00498d]/[0.04]"
                    : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-semibold text-gray-900">
                    {course.title}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      course.is_published
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {course.is_published ? "Publicado" : "Borrador"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-gray-500">
                  {count} lecciones
                </p>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Editor del curso
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Cambia contenido, acceso y publicacion sin salir del panel.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["contenido", "acceso", "preview"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-3 py-2 text-[12px] font-semibold capitalize transition ${
                    activeTab === tab
                      ? "bg-[#00498d] text-white"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5">
          {activeTab === "contenido" && (
            <div className="grid gap-5 xl:grid-cols-2">
              <label>
                <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                  Titulo
                </span>
                <input
                  value={draft.title}
                  onChange={(event) => patchDraft("title", event.target.value)}
                  className={inputClass}
                />
              </label>
              <label>
                <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                  Slug
                </span>
                <input
                  value={draft.slug}
                  onChange={(event) => patchDraft("slug", event.target.value)}
                  className={inputClass}
                />
              </label>
              <label className="xl:col-span-2">
                <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                  Descripcion
                </span>
                <textarea
                  value={draft.description || ""}
                  onChange={(event) =>
                    patchDraft("description", event.target.value)
                  }
                  rows={5}
                  className={`${inputClass} resize-y`}
                />
              </label>
              <label>
                <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                  Tipo
                </span>
                <select
                  value={draft.course_type || ""}
                  onChange={(event) =>
                    patchDraft("course_type", event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">General</option>
                  <option value="discipulado">Discipulado</option>
                  <option value="liderazgo">Liderazgo</option>
                  <option value="oracion">Oracion</option>
                  <option value="ministerio">Ministerio</option>
                </select>
              </label>
              <label>
                <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                  Duracion en semanas
                </span>
                <input
                  type="number"
                  min="0"
                  value={draft.duration_weeks || 0}
                  onChange={(event) =>
                    patchDraft("duration_weeks", Number(event.target.value))
                  }
                  className={inputClass}
                />
              </label>
              <label className="xl:col-span-2">
                <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                  Portada URL
                </span>
                <input
                  value={draft.thumbnail_url || ""}
                  onChange={(event) =>
                    patchDraft("thumbnail_url", event.target.value)
                  }
                  className={inputClass}
                  placeholder="https://..."
                />
              </label>
            </div>
          )}

          {activeTab === "acceso" && (
            <div className="space-y-4">
              <label className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Curso gratuito
                  </p>
                  <p className="mt-1 text-[12px] text-gray-500">
                    Los estudiantes pueden ingresar si esta publicado.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={draft.is_free}
                  onChange={(event) =>
                    patchDraft("is_free", event.target.checked)
                  }
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-[#00498d]"
                />
              </label>
              <label>
                <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                  Precio
                </span>
                <input
                  type="number"
                  min="0"
                  value={draft.price || 0}
                  disabled={draft.is_free}
                  onChange={(event) =>
                    patchDraft("price", Number(event.target.value))
                  }
                  className={inputClass}
                />
              </label>
              <label className="flex items-start justify-between gap-4 rounded-xl border border-gray-100 p-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Publicado en campus
                  </p>
                  <p className="mt-1 text-[12px] text-gray-500">
                    Admin siempre lo ve; estudiantes solo si esta publicado y
                    habilitado.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={draft.is_published}
                  onChange={(event) =>
                    patchDraft("is_published", event.target.checked)
                  }
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-[#00498d]"
                />
              </label>
            </div>
          )}

          {activeTab === "preview" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                  Estructura del curso
                </p>
                <div className="mt-4 space-y-2">
                  {courseLessons.length > 0 ? (
                    courseLessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-[13px]"
                      >
                        <span className="font-medium text-gray-700">
                          {lesson.lesson_number}. {lesson.title}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {lesson.is_published ? "Visible" : "Oculta"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-6 text-center text-sm text-gray-500">
                      Este curso aun no tiene lecciones.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[12px] font-medium text-gray-500">
            {message ||
              `${publishedLessons.length}/${courseLessons.length} lecciones publicadas`}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/campus/classroom/${selectedCourse.slug}`}
              target="_blank"
              className="rounded-lg border border-gray-200 px-4 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
            >
              Abrir en campus
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-[#00498d] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#003d7a] disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </div>
      </section>

      <aside className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h2 className="text-[15px] font-semibold text-gray-900">
            Preview en vivo
          </h2>
          <p className="text-[12px] text-gray-500">
            Lo que vera el estudiante al explorar el curso.
          </p>
        </div>
        <div className="p-5">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="relative h-44 bg-gradient-to-br from-[#00498d]/10 via-[#00498d]/5 to-gray-100">
              {draft.thumbnail_url ? (
                <Image
                  src={draft.thumbnail_url}
                  alt={draft.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#00498d]/20">
                  <svg
                    className="h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
              )}
              <div className="absolute left-3 top-3 flex gap-2">
                <span className="rounded-lg bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-gray-700">
                  {draft.is_published ? "Publicado" : "Borrador"}
                </span>
                <span className="rounded-lg bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-[#00498d]">
                  {draft.is_free ? "Gratis" : `S/ ${draft.price || 0}`}
                </span>
              </div>
            </div>
            <div className="p-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#00498d]">
                {draft.course_type || "Curso"}
              </p>
              <h3 className="text-lg font-bold leading-tight text-gray-900">
                {draft.title || "Titulo del curso"}
              </h3>
              <p className="mt-2 line-clamp-4 text-[13px] leading-6 text-gray-500">
                {draft.description || "Descripcion del curso."}
              </p>
              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {courseLessons.length}
                  </p>
                  <p className="text-[10px] text-gray-400">Lecciones</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {draft.duration_weeks || "-"}
                  </p>
                  <p className="text-[10px] text-gray-400">Semanas</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {publishedLessons.length}
                  </p>
                  <p className="text-[10px] text-gray-400">Visibles</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
