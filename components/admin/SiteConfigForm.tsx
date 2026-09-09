"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface SiteConfig {
  id?: number;
  siteName: string;
  siteDescription: string;
  primaryColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  email: string;
  phone: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  whatsappNumber: string;
}

const defaultConfig: SiteConfig = {
  siteName: "IDC Huancayo",
  siteDescription: "Iglesia Discípulos de Cristo, sede Huancayo",
  primaryColor: "#00498d",
  logoUrl: null,
  faviconUrl: null,
  email: "contacto@idchuancayo.org",
  phone: "+51 964 909 877",
  address: "Huancayo, Perú",
  facebookUrl: "https://facebook.com/idchuancayo",
  instagramUrl: "https://instagram.com/idchuancayo",
  youtubeUrl: "https://youtube.com/@idchuancayo",
  whatsappNumber: "+51964909877",
};

export default function SiteConfigForm({
  initialConfig,
}: {
  initialConfig?: SiteConfig;
}) {
  const [config, setConfig] = useState<SiteConfig>(
    initialConfig || defaultConfig,
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(
    initialConfig?.logoUrl || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (key: keyof SiteConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setErrorMsg("");
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setSaved(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreviewUrl(null);
    setConfig((prev) => ({ ...prev, logoUrl: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setErrorMsg("");

    let finalLogoUrl = config.logoUrl;

    // Subir logo si se seleccionó archivo nuevo
    if (logoFile) {
      const fileExt = logoFile.name.split(".").pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("imagenes")
        .upload(fileName, logoFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        setErrorMsg("Error al subir el logo: " + uploadError.message);
        setSaving(false);
        return;
      }

      if (uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from("imagenes")
          .getPublicUrl(fileName);
        finalLogoUrl = publicUrlData.publicUrl;
      }
    }

    const updatedConfig = { ...config, logoUrl: finalLogoUrl };

    const { error } = await supabase.from("site_config").upsert({
      id: config.id || 1,
      ...updatedConfig,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setErrorMsg("Error al guardar: " + error.message);
    } else {
      setConfig(updatedConfig);
      setLogoPreviewUrl(finalLogoUrl);
      setLogoFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const inputClasses =
    "w-full px-4 py-2.5 rounded-xl border border-gray-200/80 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#00498d]/40 focus:ring-2 focus:ring-[#00498d]/[0.08] transition-all duration-300 text-[14px]";

  const labelClasses = "text-[13px] font-semibold text-gray-700 mb-2 block";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ─── COLUMNA IZQUIERDA: FORMULARIO ─── */}
      <div className="bg-white border border-gray-100/80 rounded-2xl p-6 sm:p-8 shadow-sm shadow-gray-200/30">
        <div className="space-y-6">
          {/* Identidad */}
          <div>
            <h3 className="text-[15px] font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#00498d]/[0.08] flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-[#00498d]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
              </span>
              Identidad del sitio
            </h3>
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Nombre del sitio</label>
                <input
                  value={config.siteName}
                  onChange={(e) => handleChange("siteName", e.target.value)}
                  className={inputClasses}
                  placeholder="IDC Huancayo"
                />
              </div>
              <div>
                <label className={labelClasses}>Descripción corta</label>
                <input
                  value={config.siteDescription}
                  onChange={(e) =>
                    handleChange("siteDescription", e.target.value)
                  }
                  className={inputClasses}
                  placeholder="Iglesia Discípulos de Cristo, sede Huancayo"
                />
              </div>
              <div>
                <label className={labelClasses}>Color principal</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) =>
                      handleChange("primaryColor", e.target.value)
                    }
                    className="w-12 h-10 rounded-lg border border-gray-200/80 cursor-pointer bg-white"
                  />
                  <input
                    value={config.primaryColor}
                    onChange={(e) =>
                      handleChange("primaryColor", e.target.value)
                    }
                    className={`${inputClasses} flex-1 uppercase`}
                    placeholder="#00498d"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="pt-6 border-t border-gray-100/80">
            <h3 className="text-[15px] font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#00498d]/[0.08] flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-[#00498d]"
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
              </span>
              Logo principal
            </h3>
            <div className="space-y-4">
              {logoPreviewUrl && (
                <div className="relative inline-block">
                  <Image
                    src={logoPreviewUrl}
                    alt="Logo preview"
                    width={96}
                    height={96}
                    unoptimized
                    className="w-24 h-24 rounded-xl object-cover border shadow-sm"
                  />
                  <button
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    title="Eliminar logo"
                    aria-label="Eliminar logo"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subir imagen (PNG, JPG, SVG)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#00498d]/[0.08] file:text-[#00498d] hover:file:bg-[#00498d]/[0.12] transition-all cursor-pointer"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Recomendado: 512 x 512 px. PNG o SVG.
                </p>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="pt-6 border-t border-gray-100/80">
            <h3 className="text-[15px] font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#00498d]/[0.08] flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-[#00498d]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </span>
              Información de contacto
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Email</label>
                <input
                  value={config.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={inputClasses}
                  placeholder="contacto@iglesia.org"
                />
              </div>
              <div>
                <label className={labelClasses}>Teléfono</label>
                <input
                  value={config.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={inputClasses}
                  placeholder="+51 964 909 877"
                />
              </div>
              <div>
                <label className={labelClasses}>Dirección</label>
                <input
                  value={config.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className={inputClasses}
                  placeholder="Huancayo, Perú"
                />
              </div>
              <div>
                <label className={labelClasses}>WhatsApp</label>
                <input
                  value={config.whatsappNumber}
                  onChange={(e) =>
                    handleChange("whatsappNumber", e.target.value)
                  }
                  className={inputClasses}
                  placeholder="+51964909877"
                />
              </div>
            </div>
          </div>

          {/* Redes Sociales */}
          <div className="pt-6 border-t border-gray-100/80">
            <h3 className="text-[15px] font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#00498d]/[0.08] flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-[#00498d]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
              </span>
              Redes sociales
            </h3>
            <div className="space-y-4">
              <div>
                <label className={labelClasses}>Facebook</label>
                <input
                  value={config.facebookUrl}
                  onChange={(e) => handleChange("facebookUrl", e.target.value)}
                  className={inputClasses}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className={labelClasses}>Instagram</label>
                <input
                  value={config.instagramUrl}
                  onChange={(e) => handleChange("instagramUrl", e.target.value)}
                  className={inputClasses}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className={labelClasses}>YouTube</label>
                <input
                  value={config.youtubeUrl}
                  onChange={(e) => handleChange("youtubeUrl", e.target.value)}
                  className={inputClasses}
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          </div>

          {/* Mensajes y botón guardar */}
          <div className="pt-6 border-t border-gray-100/80 flex items-center justify-end gap-3">
            {errorMsg && (
              <span className="text-[13px] font-medium text-red-600 flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {errorMsg}
              </span>
            )}
            {saved && (
              <span className="text-[13px] font-medium text-emerald-600 flex items-center gap-1.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Guardado correctamente
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#00498d] text-white px-6 py-2.5 rounded-xl text-[14px] font-medium hover:bg-[#003d7a] transition-all duration-300 shadow-sm shadow-[#00498d]/15 disabled:opacity-50 flex items-center gap-2"
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
      </div>

      {/* ─── COLUMNA DERECHA: VISTA PREVIA FIGMA VIP ─── */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">
          Vista previa en tiempo real
        </h3>
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-6">
          {/* Previsualización del Navbar */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {logoPreviewUrl ? (
                <Image
                  src={logoPreviewUrl}
                  alt="Logo"
                  width={32}
                  height={32}
                  unoptimized
                  className="w-8 h-8 rounded-lg object-cover"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    className="w-5 h-5"
                  >
                    <path d="M10 5h4v4h4v4h-4v4h-4v-4H6v-4h4z" />
                  </svg>
                </div>
              )}
              <span
                className="text-sm font-bold text-gray-900"
                style={{ color: config.primaryColor }}
              >
                {config.siteName}
              </span>
            </div>
            <div className="flex gap-3 text-xs text-gray-500">
              <span>Noticias</span>
              <span>Devocionales</span>
              <span>Enseñanza</span>
            </div>
          </div>

          {/* Previsualización del Footer */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Footer
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
              <div>
                <p className="font-semibold text-gray-800 mb-1">
                  {config.siteName}
                </p>
                <p className="text-gray-500 leading-relaxed">
                  {config.siteDescription}
                </p>
              </div>
              <div className="space-y-1.5">
                {config.address && (
                  <p className="flex items-center gap-1">
                    <span className="text-gray-400">Dir.</span> {config.address}
                  </p>
                )}
                {config.email && (
                  <p className="flex items-center gap-1">
                    <span className="text-gray-400">Email</span> {config.email}
                  </p>
                )}
                {config.phone && (
                  <p className="flex items-center gap-1">
                    <span className="text-gray-400">Tel.</span> {config.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Muestra de color primario */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Color primario
            </h4>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl border shadow-sm"
                style={{ backgroundColor: config.primaryColor }}
              />
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {config.siteName}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  {config.primaryColor}
                </p>
              </div>
            </div>
          </div>

          {/* Botón simulado */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Botones
            </h4>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 rounded-xl text-sm font-medium text-white shadow-sm"
                style={{ backgroundColor: config.primaryColor }}
              >
                Comenzar ahora
              </button>
              <button className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 bg-white">
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
