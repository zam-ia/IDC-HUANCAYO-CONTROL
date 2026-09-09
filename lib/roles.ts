export const ADMIN_ROLES = ["admin", "superadmin"] as const;

export function isAdminRole(
  role: unknown,
): role is (typeof ADMIN_ROLES)[number] {
  return (
    typeof role === "string" &&
    ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])
  );
}
