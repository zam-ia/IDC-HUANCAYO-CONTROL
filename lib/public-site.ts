export function getPublicSiteUrl(path = "") {
  const base = (
    process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://idc-huancayo.vercel.app"
  ).replace(/\/$/, "");
  const normalizedPath = path && !path.startsWith("/") ? `/${path}` : path;
  return `${base}${normalizedPath}`;
}
