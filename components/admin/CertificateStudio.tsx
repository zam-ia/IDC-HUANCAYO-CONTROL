"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { CampusUser, Course } from "@/lib/db";

type SiteConfig = {
  siteName: string;
  siteDescription: string;
  primaryColor: string;
  logoUrl: string | null;
};

type CertificateStudioProps = {
  users: CampusUser[];
  courses: Course[];
  siteConfig: SiteConfig;
};

type CertificateField = {
  id: string;
  label: string;
  value: string;
};

const templates = [
  {
    id: "classic",
    name: "Clásico institucional",
    description: "Limpio, ceremonial y centrado en la iglesia.",
    background: "from-white via-sky-50 to-white",
    accent: "#00498d",
  },
  {
    id: "gold",
    name: "VIP dorado",
    description: "Borde premium para graduaciones y liderazgo.",
    background: "from-amber-50 via-white to-sky-50",
    accent: "#b7791f",
  },
  {
    id: "deep",
    name: "Azul ministerial",
    description: "Sobrio, fuerte y formal para certificaciones internas.",
    background: "from-[#eef5ff] via-white to-[#f7f8fa]",
    accent: "#00498d",
  },
];

const defaultFields: CertificateField[] = [
  { id: "student", label: "Estudiante", value: "{{nombre}}" },
  { id: "course", label: "Curso", value: "{{curso}}" },
  { id: "date", label: "Fecha", value: "{{fecha}}" },
  { id: "hours", label: "Horas", value: "24 horas academicas" },
  { id: "signature", label: "Firma", value: "Pastor principal" },
];

function today() {
  return new Date().toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function CertificateStudio({
  users,
  courses,
  siteConfig,
}: CertificateStudioProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState("classic");
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || "");
  const [selectedCourseId, setSelectedCourseId] = useState(
    courses[0]?.id || "",
  );
  const [fields, setFields] = useState(defaultFields);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [modelNote, setModelNote] = useState("");
  const [bulkRows, setBulkRows] = useState(
    "Nombre,Curso,Fecha\nMaria Perez,Discipulado Nivel 1,15 junio 2026\nJuan Ramos,Liderazgo con Proposito,15 junio 2026",
  );

  const selectedTemplate =
    templates.find((template) => template.id === selectedTemplateId) ||
    templates[0];
  const selectedUser = users.find((user) => user.id === selectedUserId);
  const selectedCourse = courses.find(
    (course) => course.id === selectedCourseId,
  );

  const resolved = useMemo(() => {
    const name =
      selectedUser?.name ||
      selectedUser?.email?.split("@")[0] ||
      "Nombre del estudiante";
    const course = selectedCourse?.title || "Curso del campus";
    return fields.reduce<Record<string, string>>((acc, field) => {
      acc[field.id] = field.value
        .replaceAll("{{nombre}}", name)
        .replaceAll("{{curso}}", course)
        .replaceAll("{{fecha}}", today());
      return acc;
    }, {});
  }, [fields, selectedCourse?.title, selectedUser?.email, selectedUser?.name]);

  const bulkCertificates = bulkRows
    .split(/\r?\n/)
    .slice(1)
    .map((row) => row.split(",").map((item) => item.trim()))
    .filter((row) => row[0]);

  const updateField = (id: string, value: string) => {
    setFields((current) =>
      current.map((field) => (field.id === id ? { ...field, value } : field)),
    );
  };

  const addField = () => {
    setFields((current) => [
      ...current,
      { id: `field-${Date.now()}`, label: "Campo extra", value: "Nuevo valor" },
    ]);
  };

  const handleModelUpload = (file: File | undefined) => {
    if (!file) return;
    setModelUrl(URL.createObjectURL(file));
    setModelNote(
      `Modelo detectado: ${file.name}. Se aplico como fondo editable para construir una plantilla reutilizable.`,
    );
  };

  const exportCurrent = () => {
    window.print();
  };

  const downloadHtml = () => {
    const html = certificateRef.current?.outerHTML || "";
    const blob = new Blob(
      [
        `<!doctype html><html><head><meta charset="utf-8"><title>Certificado</title></head><body>${html}</body></html>`,
      ],
      { type: "text/html" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "certificado-idc-huancayo.html";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="space-y-5">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-[15px] font-semibold text-gray-900">
            Plantillas VIP
          </h2>
          <div className="mt-4 space-y-2">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedTemplateId(template.id)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  selectedTemplate.id === template.id
                    ? "border-[#00498d]/30 bg-[#00498d]/[0.04]"
                    : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                }`}
              >
                <p className="text-[13px] font-semibold text-gray-900">
                  {template.name}
                </p>
                <p className="mt-1 text-[12px] leading-5 text-gray-500">
                  {template.description}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-[15px] font-semibold text-gray-900">
            Datos del certificado
          </h2>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold text-gray-500">
                Estudiante
              </span>
              <select
                value={selectedUserId}
                onChange={(event) => setSelectedUserId(event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] font-semibold text-gray-500">
                Curso
              </span>
              <select
                value={selectedCourseId}
                onChange={(event) => setSelectedCourseId(event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-3">
              {fields.map((field) => (
                <label key={field.id} className="block">
                  <span className="mb-1 block text-[12px] font-semibold text-gray-500">
                    {field.label}
                  </span>
                  <input
                    value={field.value}
                    onChange={(event) =>
                      updateField(field.id, event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                  />
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={addField}
              className="w-full rounded-xl border border-dashed border-gray-300 px-4 py-2.5 text-[13px] font-semibold text-gray-600 hover:bg-gray-50"
            >
              Añadir campo
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-[15px] font-semibold text-gray-900">
            Modelo propio
          </h2>
          <p className="mt-1 text-[12px] leading-5 text-gray-500">
            Sube un PNG/JPG/PDF convertido a imagen para usarlo como base visual
            y ajustar los campos encima.
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => handleModelUpload(event.target.files?.[0])}
            className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-[#00498d]/[0.08] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#00498d]"
          />
          {modelNote && (
            <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-[12px] text-emerald-700">
              {modelNote}
            </p>
          )}
        </section>
      </aside>

      <main className="space-y-5">
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">
              Vista previa y exportacion
            </h2>
            <p className="text-[12px] text-gray-500">
              Genera certificado individual o prepara emision masiva.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={downloadHtml}
              className="rounded-lg border border-gray-200 px-4 py-2 text-[13px] font-semibold text-gray-700 hover:bg-gray-50"
            >
              Descargar HTML
            </button>
            <button
              type="button"
              onClick={exportCurrent}
              className="rounded-lg bg-[#00498d] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#003d7a]"
            >
              Exportar / imprimir
            </button>
          </div>
        </div>

        <section className="overflow-auto rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div
            ref={certificateRef}
            className={`relative mx-auto aspect-[1.414/1] w-full min-w-[760px] max-w-5xl overflow-hidden rounded-xl border-[12px] bg-gradient-to-br ${selectedTemplate.background} p-12`}
            style={{ borderColor: selectedTemplate.accent }}
          >
            {modelUrl && (
              <Image
                src={modelUrl}
                alt="Modelo subido"
                fill
                unoptimized
                className="absolute inset-0 h-full w-full object-cover opacity-25"
              />
            )}
            <div className="relative flex h-full flex-col items-center justify-between text-center">
              <div>
                {siteConfig.logoUrl && (
                  <Image
                    src={siteConfig.logoUrl}
                    alt={siteConfig.siteName}
                    width={80}
                    height={80}
                    unoptimized
                    className="mx-auto mb-4 h-20 w-20 rounded-2xl object-cover"
                  />
                )}
                <p className="text-[13px] font-semibold uppercase tracking-[0.28em] text-gray-500">
                  {siteConfig.siteName}
                </p>
                <h1
                  className="mt-4 text-5xl font-bold"
                  style={{ color: selectedTemplate.accent }}
                >
                  Certificado
                </h1>
                <p className="mt-3 text-lg text-gray-600">Otorgado a</p>
              </div>

              <div>
                <p className="text-4xl font-bold text-gray-950">
                  {resolved.student}
                </p>
                <div
                  className="mx-auto mt-4 h-1 w-64 rounded-full"
                  style={{ backgroundColor: selectedTemplate.accent }}
                />
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-700">
                  Por haber completado satisfactoriamente el programa
                  <strong> {resolved.course}</strong>, cumpliendo los requisitos
                  academicos y formativos del campus virtual.
                </p>
              </div>

              <div className="grid w-full grid-cols-3 items-end gap-8 text-sm text-gray-600">
                <div>
                  <p className="font-semibold text-gray-900">{resolved.date}</p>
                  <p className="mt-1 border-t border-gray-300 pt-2">Fecha</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {resolved.hours}
                  </p>
                  <p className="mt-1 border-t border-gray-300 pt-2">Carga</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {resolved.signature}
                  </p>
                  <p className="mt-1 border-t border-gray-300 pt-2">Autoriza</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-gray-900">
                Emision masiva
              </h2>
              <p className="mt-1 text-[12px] leading-5 text-gray-500">
                Pega datos CSV para revisar la lista antes de imprimirlos en
                lote.
              </p>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-500">
              {bulkCertificates.length} certificados
            </span>
          </div>
          <textarea
            value={bulkRows}
            onChange={(event) => setBulkRows(event.target.value)}
            rows={5}
            className="mt-4 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-mono"
          />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-gray-50 text-[11px] uppercase tracking-[0.1em] text-gray-400">
                <tr>
                  <th className="px-3 py-2">Nombre</th>
                  <th className="px-3 py-2">Curso</th>
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bulkCertificates.map((row, index) => (
                  <tr key={`${row[0]}-${index}`}>
                    <td className="px-3 py-2 font-medium text-gray-900">
                      {row[0]}
                    </td>
                    <td className="px-3 py-2 text-gray-600">{row[1] || "-"}</td>
                    <td className="px-3 py-2 text-gray-600">
                      {row[2] || today()}
                    </td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                        Listo
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
