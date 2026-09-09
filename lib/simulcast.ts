export const SOCIAL_PLATFORM_IDS = [
  "youtube",
  "facebook",
  "instagram",
  "tiktok",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORM_IDS)[number];

export type SocialPlatformDefinition = {
  id: SocialPlatform;
  label: string;
  shortHelp: string;
  urlPlaceholder: string;
  keyLabel: string;
  helpUrl: string;
};

export const SOCIAL_PLATFORMS: readonly SocialPlatformDefinition[] = [
  {
    id: "youtube",
    label: "YouTube",
    shortHelp:
      "YouTube Studio → Emitir en directo → Configuración de la emisión.",
    urlPlaceholder: "rtmps://a.rtmps.youtube.com/live2",
    keyLabel: "Clave de transmisión de YouTube",
    helpUrl: "https://support.google.com/youtube/answer/2907883",
  },
  {
    id: "facebook",
    label: "Facebook",
    shortHelp:
      "Live Producer → Software de streaming → URL del servidor y clave.",
    urlPlaceholder: "rtmps://live-api-s.facebook.com:443/rtmp/",
    keyLabel: "Clave de stream de Facebook",
    helpUrl: "https://www.facebook.com/formedia/tools/facebook-live",
  },
  {
    id: "instagram",
    label: "Instagram",
    shortHelp: "Instagram.com → Crear → Video en vivo → URL y clave de stream.",
    urlPlaceholder: "rtmps://edgetee-upload-lax3-1.xx.fbcdn.net:443/rtmp/",
    keyLabel: "Clave de stream de Instagram",
    helpUrl: "https://help.instagram.com/687946762478336",
  },
  {
    id: "tiktok",
    label: "TikTok",
    shortHelp:
      "Centro LIVE → Configurar software de transmisión → servidor y clave.",
    urlPlaceholder: "rtmp://push-rtmp-l1.tiktokcdn.com/game/",
    keyLabel: "Clave de stream de TikTok",
    helpUrl:
      "https://www.tiktok.com/live/studio/help/article/Before-you-go-LIVE/Apply-for-LIVE-access?lang=es",
  },
] as const;

export function isSocialPlatform(value: unknown): value is SocialPlatform {
  return (
    typeof value === "string" &&
    SOCIAL_PLATFORM_IDS.includes(value as SocialPlatform)
  );
}

export function getSocialPlatform(value: SocialPlatform) {
  return SOCIAL_PLATFORMS.find((platform) => platform.id === value)!;
}

export function toMuxPassthrough(platform: SocialPlatform) {
  return `idc:${platform}`;
}

export function platformFromMuxPassthrough(value: unknown) {
  if (typeof value !== "string") return null;
  const candidate = value.startsWith("idc:") ? value.slice(4) : value;
  return isSocialPlatform(candidate) ? candidate : null;
}

export function safeIngestReference(value: string) {
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch {
    return "Destino RTMP configurado";
  }
}
