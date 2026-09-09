"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import LivePreview from "./LivePreview";

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  is_published: boolean;
  published_at: string | null;
  featured_image: string | null;
  category: string;
  is_featured: boolean;
  gallery: string[];
  video_url: string | null;
}

export default function AdminNewsManager({ news }: { news: Post[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Post[]>(news);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    is_published: true,
    featured_image: "",
    category: "Noticia",
    is_featured: false,
    video_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Clases reutilizables para inputs y labels (texto oscuro garantizado)
  const inputClasses =
    "w-full border border-gray-200/80 rounded-xl px-4 py-2.5 text-[14px] text-gray-800 placeholder:text-gray-400 bg-white focus:outline-none focus:border-[#00498d]/40 focus:ring-2 focus:ring-[#00498d]/[0.08] transition-all duration-300";
  const labelClasses = "text-[13px] font-semibold text-gray-700 mb-1.5 block";
  const selectClasses =
    "w-full border border-gray-200/80 rounded-xl px-4 py-2.5 text-[14px] text-gray-800 bg-white focus:outline-none focus:border-[#00498d]/40 focus:ring-2 focus:ring-[#00498d]/[0.08] transition-all duration-300";

  const resetForm = () => {
    setForm({
      title: "",
      content: "",
      excerpt: "",
      is_published: true,
      featured_image: "",
      category: "Noticia",
      is_featured: false,
      video_url: "",
    });
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setErrorMsg("");
    setSuccessMsg("");
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const handleEdit = (post: Post) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || "",
      is_published: post.is_published,
      featured_image: post.featured_image || "",
      category: post.category || "Noticia",
      is_featured: post.is_featured || false,
      video_url: post.video_url || "",
    });
    setImagePreview(post.featured_image || null);
    setGalleryPreviews(post.gallery || []);
    setImageFile(null);
    setGalleryFiles([]);
    setShowForm(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
    setErrorMsg("");
    setSuccessMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const revalidatePublicPage = async () => {
    try {
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/noticias" }),
      });
      await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/" }),
      });
      router.refresh();
    } catch (error) {
      console.error("Error revalidando:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta noticia permanentemente?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      setErrorMsg("Error al eliminar: " + error.message);
      setTimeout(() => setErrorMsg(""), 5000);
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSuccessMsg("Noticia eliminada correctamente");
    setTimeout(() => setSuccessMsg(""), 3000);
    await revalidatePublicPage();
  };

  const handleTogglePublish = async (post: Post) => {
    const newStatus = !post.is_published;
    const { error } = await supabase
      .from("posts")
      .update({
        is_published: newStatus,
        published_at: newStatus ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", post.id);

    if (error) {
      setErrorMsg("Error al cambiar estado: " + error.message);
      setTimeout(() => setErrorMsg(""), 5000);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === post.id
          ? {
              ...item,
              is_published: newStatus,
              published_at: newStatus ? new Date().toISOString() : null,
            }
          : item,
      ),
    );
    setSuccessMsg(newStatus ? "Noticia publicada" : "Noticia despublicada");
    setTimeout(() => setSuccessMsg(""), 2000);
    await revalidatePublicPage();
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setForm((prev) => ({ ...prev, featured_image: "" }));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setForm((prev) => ({ ...prev, featured_image: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setGalleryFiles((prev) => [...prev, ...files]);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setGalleryPreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveGalleryItem = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const slug = generateSlug(form.title);
    let finalFeaturedImage = form.featured_image;
    const finalGalleryUrls: string[] = [];

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `news-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("imagenes")
        .upload(fileName, imageFile, { cacheControl: "3600", upsert: true });

      if (uploadError) {
        setErrorMsg("Error al subir la imagen: " + uploadError.message);
        setSaving(false);
        setTimeout(() => setErrorMsg(""), 5000);
        return;
      }

      if (uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from("imagenes")
          .getPublicUrl(fileName);
        finalFeaturedImage = publicUrlData.publicUrl;
      }
    }

    for (const file of galleryFiles) {
      const fileExt = file.name.split(".").pop();
      const fileName = `gallery-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("imagenes")
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (uploadError) {
        setErrorMsg("Error al subir imagen de galería: " + uploadError.message);
        setSaving(false);
        setTimeout(() => setErrorMsg(""), 5000);
        return;
      }

      if (uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from("imagenes")
          .getPublicUrl(fileName);
        finalGalleryUrls.push(publicUrlData.publicUrl);
      }
    }

    const combinedGallery = [
      ...galleryPreviews.filter((url) => url && !url.startsWith("data:")),
      ...finalGalleryUrls,
    ];

    const postData = {
      title: form.title,
      slug,
      content: form.content,
      excerpt: form.excerpt || null,
      is_published: form.is_published,
      featured_image: finalFeaturedImage || null,
      category: form.category,
      is_featured: form.is_featured,
      video_url: form.video_url || null,
      gallery: combinedGallery,
      published_at: form.is_published
        ? editingId
          ? items.find((i) => i.id === editingId)?.published_at ||
            new Date().toISOString()
          : new Date().toISOString()
        : null,
    };

    let result;
    if (editingId) {
      result = await supabase
        .from("posts")
        .update({ ...postData, updated_at: new Date().toISOString() })
        .eq("id", editingId)
        .select()
        .single();
    } else {
      result = await supabase
        .from("posts")
        .insert({
          ...postData,
          post_type: "noticia",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
    }

    const { data, error } = result || {};
    if (error) {
      setErrorMsg("Error al guardar: " + error.message);
      setSaving(false);
      setTimeout(() => setErrorMsg(""), 5000);
      return;
    }

    if (editingId && data) {
      setItems((prev) =>
        prev.map((item) => (item.id === editingId ? data : item)),
      );
      setSuccessMsg("Noticia actualizada correctamente");
    } else if (data) {
      setItems((prev) => [data, ...prev]);
      setSuccessMsg("Noticia creada correctamente");
    }

    resetForm();
    setSaving(false);
    setTimeout(() => setSuccessMsg(""), 3000);
    await revalidatePublicPage();
  };

  const categories = [
    "Noticia",
    "Evento",
    "Testimonio",
    "Servicio",
    "Comunidad",
    "Anuncio",
  ];

  return (
    <div className="space-y-6">
      {/* ── Mensajes de estado flotantes ── */}
      {errorMsg && (
        <div className="sticky top-24 z-30 bg-red-50/95 backdrop-blur-sm border border-red-100/80 text-red-600 text-[13px] p-4 rounded-2xl shadow-lg shadow-red-100/30 flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-300">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-red-500"
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
          </div>
          <span className="flex-1">{errorMsg}</span>
          <button
            onClick={() => setErrorMsg("")}
            className="w-6 h-6 rounded-md flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
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
      )}
      {successMsg && (
        <div className="sticky top-24 z-30 bg-emerald-50/95 backdrop-blur-sm border border-emerald-100/80 text-emerald-600 text-[13px] p-4 rounded-2xl shadow-lg shadow-emerald-100/30 flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-300">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="flex-1">{successMsg}</span>
          <button
            onClick={() => setSuccessMsg("")}
            className="w-6 h-6 rounded-md flex items-center justify-center text-emerald-400 hover:text-emerald-600 hover:bg-emerald-100 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
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
      )}

      {/* ── Cabecera con resumen ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-[1.1rem] font-bold text-gray-900 tracking-tight">
            {items.length} noticia{items.length !== 1 ? "s" : ""}
          </h2>
          <p className="text-[12px] text-gray-500/70 mt-0.5 font-normal">
            {items.filter((i) => i.is_published).length} publicada
            {items.filter((i) => i.is_published).length !== 1 ? "s" : ""} ·{" "}
            {items.filter((i) => !i.is_published).length} borrador
            {items.filter((i) => !i.is_published).length !== 1 ? "es" : ""}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-[#00498d] text-white text-[13px] font-medium px-5 py-2.5 rounded-xl hover:bg-[#003d7a] transition-all duration-300 shadow-sm shadow-[#00498d]/15 hover:shadow-md hover:shadow-[#00498d]/20 hover:-translate-y-0.5 active:translate-y-0 group"
          >
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nueva noticia
          </button>
        )}
      </div>

      {/* ── Formulario y Vista Previa ── */}
      {showForm && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Columna Izquierda: Formulario */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSave}
              className="bg-white border border-gray-100/80 rounded-2xl p-6 sm:p-8 shadow-sm shadow-gray-200/30"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[1.1rem] font-bold text-gray-900 tracking-tight">
                  {editingId ? "Editar noticia" : "Nueva noticia"}
                </h2>
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 transition-all duration-200"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-5">
                {/* Título */}
                <div>
                  <label className={labelClasses}>Título</label>
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className={inputClasses}
                    placeholder="Ej: Celebración de aniversario IDC Huancayo"
                    required
                  />
                </div>

                {/* Categoría y Destacado */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>Categoría</label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className={selectClasses}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-3 p-3 border border-gray-200/80 rounded-xl cursor-pointer hover:bg-[#fafbfc] transition-colors w-full">
                      <input
                        type="checkbox"
                        checked={form.is_featured}
                        onChange={(e) =>
                          setForm({ ...form, is_featured: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-gray-300 text-[#00498d] focus:ring-[#00498d]/20 transition-colors cursor-pointer"
                      />
                      <span className="text-[13px] font-medium text-gray-700">
                        Destacada (Hero)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Extracto */}
                <div>
                  <label className={labelClasses}>Extracto</label>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) =>
                      setForm({ ...form, excerpt: e.target.value })
                    }
                    rows={2}
                    className={`${inputClasses} resize-none`}
                    placeholder="Un breve resumen de la noticia..."
                  />
                </div>

                {/* Contenido */}
                <div>
                  <label className={labelClasses}>Contenido (HTML)</label>
                  <textarea
                    value={form.content}
                    onChange={(e) =>
                      setForm({ ...form, content: e.target.value })
                    }
                    rows={6}
                    className={`${inputClasses} resize-y min-h-[150px]`}
                    placeholder="Escribe el contenido completo de la noticia..."
                    required
                  />
                </div>

                {/* Imagen destacada */}
                <div>
                  <label className={labelClasses}>Imagen destacada</label>
                  {imagePreview && (
                    <div className="relative inline-block mb-3">
                      <Image
                        src={imagePreview}
                        alt="Vista previa"
                        width={160}
                        height={96}
                        unoptimized
                        className="w-40 h-24 rounded-xl object-cover border border-gray-200/80 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-sm transition-colors"
                        aria-label="Quitar imagen"
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
                  <div className="flex flex-wrap gap-2">
                    <label className="cursor-pointer bg-white border border-gray-200/80 rounded-xl px-4 py-2 text-[13px] font-medium text-gray-600 hover:bg-[#fafbfc] hover:border-gray-300 transition-all duration-200">
                      Subir archivo
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[13px] text-gray-400 self-center">
                      o
                    </span>
                    <input
                      type="text"
                      value={form.featured_image}
                      onChange={(e) => {
                        setForm({ ...form, featured_image: e.target.value });
                        if (e.target.value) {
                          setImagePreview(e.target.value);
                          setImageFile(null);
                        } else {
                          setImagePreview(null);
                        }
                      }}
                      placeholder="https://... (URL de la imagen)"
                      className={`${inputClasses} flex-1`}
                    />
                  </div>
                </div>

                {/* Galería */}
                <div>
                  <label className={labelClasses}>Galería (múltiple)</label>
                  {galleryPreviews.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {galleryPreviews.map((url, i) => (
                        <div key={i} className="relative group">
                          <Image
                            src={url}
                            alt=""
                            width={64}
                            height={64}
                            unoptimized
                            className="w-16 h-16 rounded-lg object-cover border border-gray-200/80 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryItem(i)}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-sm transition-colors opacity-0 group-hover:opacity-100"
                            aria-label="Quitar imagen de la galería"
                          >
                            <svg
                              className="w-2.5 h-2.5"
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
                      ))}
                    </div>
                  )}
                  <label className="cursor-pointer bg-white border border-gray-200/80 rounded-xl px-4 py-2 text-[13px] font-medium text-gray-600 hover:bg-[#fafbfc] hover:border-gray-300 transition-all duration-200 inline-flex items-center gap-1.5">
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Agregar imágenes
                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGallerySelect}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Video URL */}
                <div>
                  <label className={labelClasses}>Video (URL de YouTube)</label>
                  <input
                    value={form.video_url}
                    onChange={(e) =>
                      setForm({ ...form, video_url: e.target.value })
                    }
                    className={inputClasses}
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </div>

                {/* Publicado */}
                <label className="flex items-center gap-3 p-4 border border-gray-200/80 rounded-xl cursor-pointer hover:bg-[#fafbfc] transition-colors">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) =>
                      setForm({ ...form, is_published: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-[#00498d] focus:ring-[#00498d]/20 transition-colors cursor-pointer"
                  />
                  <div>
                    <span className="text-[14px] font-semibold text-gray-800 block">
                      Publicar inmediatamente
                    </span>
                    <span className="text-[12px] text-gray-500">
                      La noticia será visible para todos los visitantes
                    </span>
                  </div>
                </label>

                {/* Botones */}
                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-[#00498d] text-white text-[13px] font-medium px-6 py-2.5 rounded-xl hover:bg-[#003d7a] transition-all duration-300 shadow-sm shadow-[#00498d]/15 hover:shadow-md hover:shadow-[#00498d]/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    ) : editingId ? (
                      "Actualizar noticia"
                    ) : (
                      "Crear noticia"
                    )}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-5 py-2.5 text-[13px] font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100/80 rounded-xl transition-all duration-200"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Columna Derecha: Vista Previa */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Vista previa en el sitio
              </h3>
              <LivePreview
                type="noticia"
                data={{
                  title: form.title,
                  excerpt: form.excerpt,
                  content: form.content,
                  featured_image: imagePreview || form.featured_image,
                  category: form.category,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Tabla de noticias ── */}
      <div className="bg-white border border-gray-100/80 rounded-2xl overflow-hidden shadow-sm shadow-gray-200/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100/80 bg-[#fafbfc]">
                <th className="text-left px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em]">
                  Título
                </th>
                <th className="text-left px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em]">
                  Categoría
                </th>
                <th className="text-left px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em] hidden sm:table-cell">
                  Destacada
                </th>
                <th className="text-left px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em]">
                  Estado
                </th>
                <th className="text-left px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em] hidden sm:table-cell">
                  Fecha
                </th>
                <th className="text-right px-6 py-4 text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/80">
              {items.map((post) => (
                <tr
                  key={post.id}
                  className="hover:bg-[#fafbfc] transition-colors duration-200 group"
                >
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-[13px] font-semibold text-gray-800 truncate group-hover:text-[#00498d] transition-colors">
                        {post.title}
                      </p>
                      {post.excerpt && (
                        <p className="text-[11px] text-gray-400 truncate mt-0.5 font-normal">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-semibold bg-[#00498d]/[0.05] text-[#00498d] px-2.5 py-1 rounded-full border border-[#00498d]/[0.08]">
                      {post.category || "Noticia"}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    {post.is_featured ? (
                      <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200/60">
                        Destacada
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[13px]">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleTogglePublish(post)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all duration-200 border ${
                        post.is_published
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-100"
                          : "bg-amber-50 text-amber-700 border-amber-200/60 hover:bg-amber-100"
                      }`}
                    >
                      {post.is_published ? "Publicado" : "Borrador"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-[12px] text-gray-500 font-medium hidden sm:table-cell whitespace-nowrap">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString(
                          "es-PE",
                          { day: "numeric", month: "short", year: "numeric" },
                        )
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleEdit(post)}
                        className="px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:text-[#00498d] hover:bg-[#00498d]/[0.04] rounded-lg transition-all duration-200"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-3 py-1.5 text-[11px] font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#00498d]/[0.04] flex items-center justify-center mx-auto mb-3">
                      <svg
                        className="w-5 h-5 text-[#00498d]/25"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                        />
                      </svg>
                    </div>
                    <p className="text-[13px] font-medium text-gray-400">
                      No hay noticias aún
                    </p>
                    <p className="text-[11px] text-gray-400/70 mt-1 font-normal">
                      Crea la primera noticia para empezar
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
