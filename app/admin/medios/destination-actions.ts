"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/db";
import { isAdminRole } from "@/lib/roles";
import {
  getSocialPlatform,
  SOCIAL_PLATFORM_IDS,
  type SocialPlatform,
} from "@/lib/simulcast";
import { encryptStreamSecret } from "@/lib/stream-secrets";

const destinationSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORM_IDS),
  ingestUrl: z.string().trim().max(1000),
  streamKey: z.string().trim().max(2000),
  enabled: z.boolean(),
});

export type DestinationActionState = {
  status: "idle" | "success" | "error";
  message: string;
  platform?: SocialPlatform;
};

function isValidIngestUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "rtmp:" || url.protocol === "rtmps:";
  } catch {
    return false;
  }
}

export async function saveSocialDestinationAction(
  _previousState: DestinationActionState,
  formData: FormData,
): Promise<DestinationActionState> {
  const session = await getServerSession(authOptions);
  if (!isAdminRole(session?.user?.role) || !session?.user?.id) {
    return {
      status: "error",
      message: "Tu sesión no tiene permiso de administrador.",
    };
  }

  const parsed = destinationSchema.safeParse({
    platform: formData.get("platform"),
    ingestUrl: formData.get("ingestUrl") || "",
    streamKey: formData.get("streamKey") || "",
    enabled: formData.get("enabled") === "on",
  });
  if (!parsed.success) {
    return { status: "error", message: "Revisa los datos del destino." };
  }

  if (parsed.data.ingestUrl && !isValidIngestUrl(parsed.data.ingestUrl)) {
    return {
      status: "error",
      platform: parsed.data.platform,
      message: "La URL debe comenzar con rtmp:// o rtmps://.",
    };
  }

  if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length < 32) {
    return {
      status: "error",
      platform: parsed.data.platform,
      message: "Falta una ENCRYPTION_KEY segura en Vercel.",
    };
  }

  const db = getSupabaseAdmin();
  const { data: existing, error: readError } = await db
    .from("social_stream_destinations")
    .select("id,ingest_url_encrypted,stream_key_encrypted")
    .eq("platform", parsed.data.platform)
    .maybeSingle();

  if (readError) {
    return {
      status: "error",
      platform: parsed.data.platform,
      message: "Falta aplicar la migración de multitransmisión en Supabase.",
    };
  }

  if (
    (!existing && !parsed.data.ingestUrl) ||
    (!existing && !parsed.data.streamKey)
  ) {
    return {
      status: "error",
      platform: parsed.data.platform,
      message: "Ingresa la URL del servidor y la clave la primera vez.",
    };
  }

  try {
    const platform = getSocialPlatform(parsed.data.platform);
    const { data: destination, error } = await db
      .from("social_stream_destinations")
      .upsert(
        {
          platform: parsed.data.platform,
          display_name: platform.label,
          ingest_url_encrypted: parsed.data.ingestUrl
            ? encryptStreamSecret(parsed.data.ingestUrl)
            : existing!.ingest_url_encrypted,
          stream_key_encrypted: parsed.data.streamKey
            ? encryptStreamSecret(parsed.data.streamKey)
            : existing!.stream_key_encrypted,
          enabled: parsed.data.enabled,
          created_by: session.user.id,
        },
        { onConflict: "platform" },
      )
      .select("id")
      .single();

    if (error || !destination) {
      return {
        status: "error",
        platform: parsed.data.platform,
        message: "No se pudo guardar el destino. Inténtalo nuevamente.",
      };
    }

    await db.from("audit_logs").insert({
      actor_user_id: session.user.id,
      action: "simulcast_destination.saved",
      entity: "social_stream_destinations",
      entity_id: destination.id,
      metadata_json: {
        platform: parsed.data.platform,
        enabled: parsed.data.enabled,
        credentials_rotated: Boolean(
          parsed.data.ingestUrl || parsed.data.streamKey,
        ),
      },
    });

    revalidatePath("/admin/medios");
    return {
      status: "success",
      platform: parsed.data.platform,
      message: parsed.data.enabled
        ? `${platform.label} quedó listo para las próximas transmisiones.`
        : `${platform.label} quedó guardado, pero desactivado.`,
    };
  } catch {
    return {
      status: "error",
      platform: parsed.data.platform,
      message: "No se pudieron cifrar las credenciales. Revisa ENCRYPTION_KEY.",
    };
  }
}
