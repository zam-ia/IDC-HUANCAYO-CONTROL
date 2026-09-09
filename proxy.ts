import { withAuth } from "next-auth/middleware";
import { isAdminRole } from "@/lib/roles";

export default withAuth({
  pages: { signIn: "/login" },
  callbacks: {
    authorized: ({ token }) => isAdminRole(token?.role),
  },
});

export const config = {
  matcher: ["/admin/:path*"],
};
