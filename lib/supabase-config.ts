// These are Supabase's public browser credentials for this project. They are
// intentionally safe to ship to the client; database access remains protected
// by Row Level Security. Environment variables can override them at any time.
export const publicSupabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://qsznmxuvpgabutzwlpnv.supabase.co";

export const publicSupabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_7uS00uMw4bdAw0mgf1ljCw_9gL4mGGu";
