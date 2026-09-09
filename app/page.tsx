import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  redirect(isAdminRole(session?.user?.role) ? "/admin" : "/login");
}
