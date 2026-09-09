import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import { isAdminRole } from "@/lib/roles";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const authConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseServiceKey,
);
const ROLE_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

function createAuthClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function createAdminClient() {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "Credenciales de administrador",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!authConfigured || !credentials?.email || !credentials?.password) {
          return null;
        }

        const authClient = createAuthClient();
        const adminClient = createAdminClient();
        if (!authClient || !adminClient) return null;

        const { data, error } = await authClient.auth.signInWithPassword({
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password,
        });
        if (error || !data.user) return null;

        const { data: profile, error: profileError } = await adminClient
          .from("users")
          .select("role,name,is_active,avatar_url")
          .eq("id", data.user.id)
          .maybeSingle();

        if (
          profileError ||
          !profile ||
          profile.is_active === false ||
          !isAdminRole(profile.role)
        ) {
          await authClient.auth.signOut();
          return null;
        }

        return {
          id: data.user.id,
          email: data.user.email,
          name: profile.name || "Administrador",
          image: profile.avatar_url || null,
          role: profile.role,
        };
      },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.picture = user.image;
        token.roleSyncedAt = Date.now();
        return token;
      }

      const userId = token.id || token.sub;
      const roleIsStale =
        !token.roleSyncedAt ||
        Date.now() - token.roleSyncedAt >= ROLE_REFRESH_INTERVAL_MS;
      if (authConfigured && userId && roleIsStale) {
        const adminClient = createAdminClient();
        const { data: profile } = adminClient
          ? await adminClient
              .from("users")
              .select("role,is_active")
              .eq("id", userId)
              .maybeSingle()
          : { data: null };
        token.role =
          profile?.is_active !== false && isAdminRole(profile?.role)
            ? profile.role
            : "unauthorized";
        token.roleSyncedAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id || token.sub;
        session.user.role = token.role;
        session.user.image = token.picture || null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/admin`;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
