import { createClient } from "@supabase/supabase-js";
import { publicSupabaseKey, publicSupabaseUrl } from "@/lib/supabase-config";

export const isSupabaseConfigured = Boolean(
  publicSupabaseUrl && publicSupabaseKey,
);

export const supabase = createClient(publicSupabaseUrl, publicSupabaseKey);
