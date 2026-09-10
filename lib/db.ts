import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { publicSupabaseUrl } from "@/lib/supabase-config";

export type UserRole =
  | "student"
  | "instructor"
  | "moderator"
  | "editor"
  | "radio_dj"
  | "admin"
  | "superadmin"
  | "miembro";

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  instructor_id: string | null;
  course_type: string | null;
  duration_weeks: number | null;
  is_free: boolean;
  price: number | null;
  thumbnail_url: string | null;
  is_published: boolean;
  created_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  lesson_number: number;
  video_url: string | null;
  video_duration_sec: number | null;
  content: string | null;
  downloadable_pdf: string | null;
  is_published: boolean;
  created_at: string;
}

export type LessonSummary = Pick<
  Lesson,
  | "id"
  | "course_id"
  | "title"
  | "lesson_number"
  | "video_url"
  | "video_duration_sec"
  | "is_published"
>;

export interface CampusUser {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  phone: string | null;
  church_member_since: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  featured_image: string | null;
  published_at: string | null;
  created_at: string;
}

const supabaseUrl = publicSupabaseUrl;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    throw new Error("Missing Supabase server environment variables");
  }

  return supabaseAdmin;
}

const defaultSiteConfig = {
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

export async function getCourses() {
  const db = supabaseAdmin;
  if (!db) return [];
  try {
    const { data, error } = await db
      .from("courses")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: true });

    if (error || !data) return [];
    return data as Course[];
  } catch {
    return [];
  }
}

export async function getAllCourses() {
  const db = supabaseAdmin;
  if (!db) return [];

  const { data, error } = await db
    .from("courses")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as Course[];
}

export async function getCoursesForRole(role?: string | null) {
  const db = supabaseAdmin;
  if (!db) return [];

  try {
    let query = db
      .from("courses")
      .select(
        "id,title,slug,description,instructor_id,course_type,duration_weeks,is_free,price,thumbnail_url,is_published,created_at",
      )
      .order("created_at", { ascending: true });

    if (role !== "admin" && role !== "superadmin") {
      query = query.eq("is_published", true).eq("is_free", true);
    }

    const { data, error } = await query.abortSignal(AbortSignal.timeout(4000));
    if (error || !data) return [];
    return data as Course[];
  } catch {
    return [];
  }
}

export async function getCourseBySlug(slug: string) {
  const db = supabaseAdmin;
  if (!db) return null;

  try {
    const { data, error } = await db
      .from("courses")
      .select(
        "id,title,slug,description,instructor_id,course_type,duration_weeks,is_free,price,thumbnail_url,is_published,created_at",
      )
      .eq("slug", slug)
      .abortSignal(AbortSignal.timeout(4000))
      .single();

    if (error) return null;
    return data as Course;
  } catch {
    return null;
  }
}

export function canAccessCourse(course: Course, role?: string | null) {
  if (role === "admin" || role === "superadmin") return true;
  return course.is_published && course.is_free;
}

export function getCourseLevel(course: Pick<Course, "course_type" | "title">) {
  const source = `${course.course_type || ""} ${course.title}`.toLowerCase();

  if (source.includes("liderazgo")) return "Avanzado";
  if (source.includes("2")) return "Intermedio";
  return "Básico";
}

export async function getLessonsByCourseId(
  courseId: string,
  options: { includeUnpublished?: boolean } = {},
) {
  const db = supabaseAdmin;
  if (!db) return [];

  let query = db
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("lesson_number", { ascending: true });

  if (!options.includeUnpublished) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Lesson[];
}

export async function getAllLessons() {
  const db = supabaseAdmin;
  if (!db) return [];

  const { data, error } = await db
    .from("lessons")
    .select("*")
    .order("course_id", { ascending: true })
    .order("lesson_number", { ascending: true });

  if (error) throw error;
  return data as Lesson[];
}

export async function getPublishedPosts(type?: string) {
  const db = supabaseAdmin;
  if (!db) return [];
  try {
    let query = db
      .from("posts")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (type) {
      query = query.eq("post_type", type);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}

export async function getLessonSummariesByCourseId(
  courseId: string,
  options: { includeUnpublished?: boolean } = {},
) {
  const db = supabaseAdmin;
  if (!db) return [];

  let query = db
    .from("lessons")
    .select(
      "id,course_id,title,lesson_number,video_url,video_duration_sec,is_published",
    )
    .eq("course_id", courseId)
    .order("lesson_number", { ascending: true });

  if (!options.includeUnpublished) query = query.eq("is_published", true);

  try {
    const { data, error } = await query.abortSignal(AbortSignal.timeout(4000));
    if (error || !data) return [];
    return data as LessonSummary[];
  } catch {
    return [];
  }
}

export async function getLessonById(lessonId: string) {
  const db = supabaseAdmin;
  if (!db) return null;

  try {
    const { data, error } = await db
      .from("lessons")
      .select(
        "id,course_id,title,description,lesson_number,video_url,video_duration_sec,content,downloadable_pdf,is_published,created_at",
      )
      .eq("id", lessonId)
      .abortSignal(AbortSignal.timeout(4000))
      .maybeSingle();

    if (error || !data) return null;
    return data as Lesson;
  } catch {
    return null;
  }
}

export async function getLessonProgressMap(
  userId: string | null | undefined,
  lessonIds: string[],
) {
  if (!supabaseAdmin || !userId || lessonIds.length === 0) {
    return {} as Record<string, boolean>;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("lesson_progress")
      .select("lesson_id,is_completed")
      .eq("user_id", userId)
      .in("lesson_id", lessonIds)
      .abortSignal(AbortSignal.timeout(4000));

    if (error || !data) return {} as Record<string, boolean>;
    return Object.fromEntries(
      data.map((item) => [item.lesson_id, item.is_completed === true]),
    );
  } catch {
    return {} as Record<string, boolean>;
  }
}

export async function getPostBySlug(slug: string) {
  const db = supabaseAdmin;
  if (!db) return null;
  try {
    const { data, error } = await db
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getAllPosts(type?: string) {
  const db = supabaseAdmin;
  if (!db) return [];

  let query = db.from("posts").select("*").order("created_at", {
    ascending: false,
  });

  if (type) {
    query = query.eq("post_type", type);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getLessonProgressForUser(
  userId: string,
  courseId: string,
) {
  const db = supabaseAdmin;
  if (!db) return 0;

  const { data: lessons } = await db
    .from("lessons")
    .select("id")
    .eq("course_id", courseId)
    .eq("is_published", true);

  if (!lessons || lessons.length === 0) return 0;

  const lessonIds = lessons.map((lesson) => lesson.id);

  const { data: progress, error } = await db
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds)
    .eq("is_completed", true);

  if (error || !progress) return 0;

  return Math.round((progress.length / lessons.length) * 100);
}

async function loadSiteConfig() {
  const db = supabaseAdmin;
  if (!db) return defaultSiteConfig;
  try {
    const { data, error } = await db
      .from("site_config")
      .select("*")
      .eq("id", 1)
      .abortSignal(AbortSignal.timeout(2500))
      .single();

    if (error || !data) return defaultSiteConfig;
    return data;
  } catch {
    return defaultSiteConfig;
  }
}

export const getSiteConfig = unstable_cache(loadSiteConfig, ["site-config"], {
  revalidate: 60,
  tags: ["site-config"],
});

export async function getCampusUsers() {
  const db = supabaseAdmin;
  if (!db) return [];

  const { data, error } = await db
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as CampusUser[];
}

export async function getCampusUserById(userId: string) {
  const db = supabaseAdmin;
  if (!db) return null;

  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return data as CampusUser;
}

export async function getCampusEvents() {
  const db = supabaseAdmin;
  if (!db) return [];

  try {
    const { data, error } = await db
      .from("posts")
      .select(
        "id,title,slug,excerpt,content,category,featured_image,published_at,created_at",
      )
      .eq("is_published", true)
      .eq("category", "Evento")
      .order("published_at", { ascending: true, nullsFirst: false })
      .abortSignal(AbortSignal.timeout(4000));

    if (error || !data) return [];
    return data as CampusEvent[];
  } catch {
    return [];
  }
}
