import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ControlShell from "@/components/ControlShell";
import { authOptions } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  if (!isAdminRole(session?.user?.role)) {
    redirect("/login?error=unauthorized");
  }

  return (
    <ControlShell
      userName={session.user?.name}
      userEmail={session.user?.email}
      publicSiteUrl={
        process.env.NEXT_PUBLIC_MAIN_SITE_URL ||
        "https://idc-huancayo.vercel.app"
      }
    >
      {children}
    </ControlShell>
  );
}
