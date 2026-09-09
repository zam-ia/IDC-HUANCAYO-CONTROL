"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

interface Course {
  id: string;
  title: string;
  description: string;
  slug: string;
  is_free: boolean;
  price: number;
  is_published: boolean;
  course_type?: string;
  thumbnail_url?: string;
}

interface CourseEditModalProps {
  course: Course;
  onClose: () => void;
}

const accessRules = [
  {
    id: "open",
    title: "Abierto",
    description: "Todos los miembros pueden acceder",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    id: "level",
    title: "Desbloqueo por Nivel",
    description: "Los miembros desbloquean en un nivel específico",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    ),
  },
  {
    id: "buy",
    title: "Pago Único",
    description:
      "Los miembros pagan un precio de una sola vez para desbloquear",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    id: "time",
    title: "Desbloqueo por Tiempo",
    description: "Los miembros desbloquean después de X días",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    id: "private",
    title: "Privado",
    description: "Solo los miembros que selecciones pueden acceder",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
  },
];

export default function CourseEditModal({
  course,
  onClose,
}: CourseEditModalProps) {
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description || "");
  const [isFree] = useState(course.is_free);
  const [price, setPrice] = useState(course.price || 0);
  const [isPublished, setIsPublished] = useState(course.is_published);
  const [accessRule, setAccessRule] = useState<string>(
    course.is_free ? "open" : course.price && course.price > 0 ? "buy" : "open",
  );
  const [levelRequired, setLevelRequired] = useState(1);
  const [daysRequired, setDaysRequired] = useState(7);
  const [affiliateEnabled, setAffiliateEnabled] = useState(false);
  const [annualAccessEnabled, setAnnualAccessEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("courses")
      .update({
        title,
        description,
        is_free: accessRule === "open" ? true : isFree,
        price: accessRule === "buy" ? price : 0,
        is_published: isPublished,
      })
      .eq("id", course.id);
    setSaving(false);
    if (!error) onClose();
  };

  const handleDuplicate = async () => {
    setSaving(true);
    const { error } = await supabase.from("courses").insert({
      title: `${title} (copia)`,
      description,
      slug: `${course.slug}-copia-${Date.now()}`,
      is_free: isFree,
      price,
      is_published: false,
    });
    setSaving(false);
    if (!error) onClose();
  };

  const handleShareLink = () => {
    const url = `${window.location.origin}/campus/classroom/${course.slug}`;
    navigator.clipboard.writeText(url);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 w-full max-w-2xl max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* ─── CABECERA DEL MODAL ─── */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 p-6 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Editar curso</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Configura el acceso, contenido y visibilidad del módulo
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Botón duplicar */}
            <button
              onClick={handleDuplicate}
              disabled={saving}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="Duplicar curso"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
            {/* Botón compartir */}
            <button
              onClick={handleShareLink}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors relative"
              title="Compartir enlace del curso"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.368-2.684 3 3 0 00-5.368 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>
            {/* Cerrar */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* ─── CUERPO DEL MODAL ─── */}
        <div className="p-6 space-y-8">
          {/* Sección: Información General */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#00498d] rounded-full" />
              Información General
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nombre del curso
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#00498d]/40 focus:ring-2 focus:ring-[#00498d]/[0.08] transition-all"
                  maxLength={50}
                  placeholder="Ej: Discipulado Nivel 1"
                />
                <span className="text-[11px] text-gray-400 mt-1 block text-right">
                  {title.length}/50
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Descripción del curso
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#00498d]/40 focus:ring-2 focus:ring-[#00498d]/[0.08] transition-all resize-none h-28"
                  maxLength={500}
                  placeholder="Describe de qué trata este curso..."
                />
                <span className="text-[11px] text-gray-400 mt-1 block text-right">
                  {description.length}/500
                </span>
              </div>
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-gray-100" />

          {/* Sección: Reglas de Acceso */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#00498d] rounded-full" />
              Reglas de Acceso
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Define cómo los miembros pueden acceder a este curso
            </p>
            <div className="grid grid-cols-1 gap-3">
              {accessRules.map((rule) => (
                <label
                  key={rule.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    accessRule === rule.id
                      ? "border-[#00498d] bg-[#00498d]/[0.02] shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="accessRule"
                    value={rule.id}
                    checked={accessRule === rule.id}
                    onChange={() => setAccessRule(rule.id)}
                    className="hidden"
                  />
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      accessRule === rule.id
                        ? "bg-[#00498d] text-white shadow-sm shadow-[#00498d]/20"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {rule.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-gray-900 block">
                      {rule.title}
                    </span>
                    <span className="text-xs text-gray-500">
                      {rule.description}
                    </span>
                  </div>
                  <div
                    className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      accessRule === rule.id
                        ? "border-[#00498d] bg-[#00498d]"
                        : "border-gray-300"
                    }`}
                  >
                    {accessRule === rule.id && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    )}
                  </div>
                </label>
              ))}
            </div>

            {/* Campos condicionales */}
            <div className="mt-4 space-y-4">
              {accessRule === "level" && (
                <div className="p-4 bg-[#fafbfc] border border-gray-200 rounded-xl animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Acceso empieza en el nivel
                  </label>
                  <select
                    value={levelRequired}
                    onChange={(e) => setLevelRequired(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#00498d]/40 focus:ring-2 focus:ring-[#00498d]/[0.08] transition-all bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>
                        Nivel {n}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {accessRule === "buy" && (
                <div className="p-4 bg-[#fafbfc] border border-gray-200 rounded-xl animate-in slide-in-from-top-2 duration-200 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Precio de compra única
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full border border-gray-200 rounded-xl p-2.5 pl-8 text-sm focus:outline-none focus:border-[#00498d]/40 focus:ring-2 focus:ring-[#00498d]/[0.08] transition-all bg-white"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Toggle de afiliados */}
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                    <div>
                      <span className="text-sm font-medium text-gray-700 block">
                        Comisiones de afiliados
                      </span>
                      <span className="text-xs text-gray-400">
                        Permite que otros ganen comisiones al recomendar este
                        curso
                      </span>
                    </div>
                    <button
                      onClick={() => setAffiliateEnabled(!affiliateEnabled)}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                        affiliateEnabled ? "bg-emerald-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          affiliateEnabled ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {accessRule === "time" && (
                <div className="p-4 bg-[#fafbfc] border border-gray-200 rounded-xl animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Acceso empieza en el día
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={daysRequired}
                      onChange={(e) => setDaysRequired(Number(e.target.value))}
                      className="w-24 border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-[#00498d]/40 focus:ring-2 focus:ring-[#00498d]/[0.08] transition-all bg-white"
                      min="1"
                      max="365"
                    />
                    <span className="text-sm text-gray-500">
                      días desde el registro
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-gray-100" />

          {/* Sección: Regla Condicional */}
          <div className="flex items-center justify-between p-4 bg-[#fafbfc] rounded-xl border border-gray-200">
            <div>
              <span className="text-sm font-medium text-gray-700 block">
                O cuando los miembros suban al plan anual
              </span>
              <span className="text-xs text-gray-400">
                El acceso anual omite todas las reglas anteriores
              </span>
            </div>
            <button
              onClick={() => setAnnualAccessEnabled(!annualAccessEnabled)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                annualAccessEnabled ? "bg-[#00498d]" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  annualAccessEnabled ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {/* Separador */}
          <div className="border-t border-gray-100" />

          {/* Sección: Portada */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#00498d] rounded-full" />
              Portada del Curso
            </h3>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#00498d]/30 transition-colors cursor-pointer">
              {course.thumbnail_url ? (
                <Image
                  src={course.thumbnail_url}
                  alt={course.title}
                  width={640}
                  height={160}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-[#00498d]/[0.06] to-[#00498d]/[0.02] rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-10 h-10 text-[#00498d]/20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
              <button className="text-sm font-medium text-[#00498d] hover:text-[#003d7a] transition-colors">
                Cambiar portada
              </button>
              <p className="text-[11px] text-gray-400 mt-1">
                Resolución recomendada: 1460 x 752 px
              </p>
            </div>
          </div>
        </div>

        {/* ─── FOOTER DEL MODAL ─── */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-4 flex items-center justify-between rounded-b-2xl">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {isPublished ? "Publicado" : "Borrador"}
            </span>
            <button
              onClick={() => setIsPublished(!isPublished)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                isPublished ? "bg-emerald-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  isPublished ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-[#00498d] text-white text-sm font-semibold rounded-xl hover:bg-[#003d7a] transition-all duration-200 shadow-sm shadow-[#00498d]/15 hover:shadow-md hover:shadow-[#00498d]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </button>
          </div>
        </div>

        {/* Toast de enlace copiado */}
        {showCopyToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg animate-in slide-in-from-bottom-4 duration-200 z-50">
            Enlace copiado al portapapeles
          </div>
        )}
      </div>
    </div>
  );
}
