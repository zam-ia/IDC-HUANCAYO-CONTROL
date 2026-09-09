"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/db";
import { isAdminRole } from "@/lib/roles";
import {
  getSocialPlatform,
  isSocialPlatform,
  safeIngestReference,
  toMuxPassthrough,
  type SocialPlatform,
} from "@/lib/simulcast";
import { decryptStreamSecret } from "@/lib/stream-secrets";

const MUX_RTMP_SERVER = "rtmps://global-live.mux.com:443/app";

const wizardSchema = z.object({
  title: z.string().trim().min(3).max(140),
  speaker: z.string().trim().max(120).optional(),
  description: z.string().trim().max(1000).optional(),
  scheduledAt: z.string().min(1),
  socialFallbackUrl: z.union([z.literal(""), z.string().url()]).optional(),
});

export type ObsWizardState = {
  status: "idle" | "success" | "error";
  message: string;
  obsServer?: string;
  streamKey?: string;
  eventId?: string;
  destinations?: string[];
};

type StoredDestination = {
  id: string;
  platform: SocialPlatform;
  ingest_url_encrypted: string;
  stream_key_encrypted: string;
};

type MuxSimulcastTarget = {
  id?: string;
  passthrough?: string;
};

type PreparedDestination = StoredDestination & {
  ingestUrl: string;
  streamKey: string;
};

function toLimaIso(value: string) {
  const normalized = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value)
    ? value
    : `${value}:00-05:00`;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function slugify(value: string) {
  const base = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
  return `${base || "transmision"}-${Date.now().toString(36)}`;
}

async function removeMuxStream(liveStreamId: string, authorization: string) {
  try {
    await fetch(`https://api.mux.com/video/v1/live-streams/${liveStreamId}`, {
      method: "DELETE",
      headers: { Authorization: authorization },
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Limpieza de mejor esfuerzo si la base de datos no pudo guardar el evento.
  }
}

export async function createObsLiveEventAction(
  _previousState: ObsWizardState,
  formData: FormData,
): Promise<ObsWizardState> {
  const session = await getServerSession(authOptions);
  if (!isAdminRole(session?.user?.role) || !session?.user?.id) {
    return {
      status: "error",
      message: "Tu sesión no tiene permiso de administrador.",
    };
  }

  const parsed = wizardSchema.safeParse({
    title: formData.get("title"),
    speaker: formData.get("speaker") || undefined,
    description: formData.get("description") || undefined,
    scheduledAt: formData.get("scheduledAt"),
    socialFallbackUrl: formData.get("socialFallbackUrl") || "",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa el título, la fecha y los enlaces ingresados.",
    };
  }

  const scheduledAt = toLimaIso(parsed.data.scheduledAt);
  if (!scheduledAt)
    return { status: "error", message: "La fecha indicada no es válida." };

  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) {
    return {
      status: "error",
      message:
        "Faltan MUX_TOKEN_ID y MUX_TOKEN_SECRET en Vercel. Revisa la guía de configuración de esta página.",
    };
  }

  const selectedPlatforms = Array.from(
    new Set(formData.getAll("destinations").filter(isSocialPlatform)),
  ).slice(0, 6);

  const authorization = `Basic ${Buffer.from(`${tokenId}:${tokenSecret}`).toString("base64")}`;
  try {
    const db = getSupabaseAdmin();
    let storedDestinations: StoredDestination[] = [];
    if (selectedPlatforms.length) {
      if (!process.env.ENCRYPTION_KEY) {
        return {
          status: "error",
          message:
            "Falta ENCRYPTION_KEY en Vercel para usar los destinos sociales.",
        };
      }

      const { data, error } = await db
        .from("social_stream_destinations")
        .select("id,platform,ingest_url_encrypted,stream_key_encrypted")
        .in("platform", selectedPlatforms)
        .eq("enabled", true);
      if (error || !data || data.length !== selectedPlatforms.length) {
        return {
          status: "error",
          message:
            "Uno de los destinos elegidos no está configurado o está desactivado. Actualiza la página y revísalo.",
        };
      }
      storedDestinations = data as StoredDestination[];
    }

    let preparedDestinations: PreparedDestination[];
    try {
      preparedDestinations = storedDestinations.map((destination) => ({
        ...destination,
        ingestUrl: decryptStreamSecret(destination.ingest_url_encrypted),
        streamKey: decryptStreamSecret(destination.stream_key_encrypted),
      }));
    } catch {
      return {
        status: "error",
        message:
          "No se pudieron abrir las credenciales sociales. Confirma que ENCRYPTION_KEY no haya cambiado desde que se guardaron.",
      };
    }

    const muxTargets = preparedDestinations.map((destination) => ({
      url: destination.ingestUrl,
      stream_key: destination.streamKey,
      passthrough: toMuxPassthrough(destination.platform),
    }));

    const muxResponse = await fetch(
      "https://api.mux.com/video/v1/live-streams",
      {
        method: "POST",
        headers: {
          Authorization: authorization,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playback_policies: ["public"],
          new_asset_settings: { playback_policies: ["public"] },
          meta: { title: parsed.data.title },
          simulcast_targets: muxTargets,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );

    const muxPayload = (await muxResponse.json()) as {
      data?: {
        id?: string;
        stream_key?: string;
        playback_ids?: Array<{ id?: string; policy?: string }>;
        simulcast_targets?: MuxSimulcastTarget[];
      };
      error?: { messages?: string[] };
    };
    const muxStream = muxPayload.data;
    const playbackId = muxStream?.playback_ids?.find(
      (item) => item.policy === "public",
    )?.id;

    if (
      !muxResponse.ok ||
      !muxStream?.id ||
      !muxStream.stream_key ||
      !playbackId
    ) {
      return {
        status: "error",
        message:
          selectedPlatforms.length > 0
            ? "Mux rechazó la señal o uno de los destinos. Revisa las URLs, las llaves y el acceso LIVE de cada cuenta."
            : muxPayload.error?.messages?.[0] ||
              "Mux no pudo crear la señal. Verifica sus credenciales.",
      };
    }

    const { data: event, error } = await db
      .from("live_events")
      .insert({
        title: parsed.data.title,
        slug: slugify(parsed.data.title),
        description: parsed.data.description || null,
        speaker: parsed.data.speaker || null,
        scheduled_at: scheduledAt,
        visibility: "public",
        status: "scheduled",
        mux_live_stream_id: muxStream.id,
        mux_playback_id: playbackId,
        social_fallback_url: parsed.data.socialFallbackUrl || null,
        created_by: session.user.id,
      })
      .select("id")
      .single();

    if (error || !event) {
      await removeMuxStream(muxStream.id, authorization);
      return {
        status: "error",
        message:
          "La señal se creó, pero no se pudo guardar el evento. No se conservaron las llaves.",
      };
    }

    const muxDestination = {
      live_event_id: event.id,
      platform: "mux",
      enabled: true,
      credential_ref: null,
      target_url_ref: "Reproductor web Mux",
      state: "ready",
      mux_simulcast_target_id: null,
    };
    const socialDestinations = preparedDestinations.map((destination) => ({
      live_event_id: event.id,
      platform: destination.platform,
      enabled: true,
      credential_ref: destination.id,
      target_url_ref: safeIngestReference(destination.ingestUrl),
      state: "ready",
      mux_simulcast_target_id:
        muxStream.simulcast_targets?.find(
          (target) =>
            target.passthrough === toMuxPassthrough(destination.platform),
        )?.id || null,
    }));
    const { error: destinationsError } = await db
      .from("live_destinations")
      .insert([muxDestination, ...socialDestinations]);

    if (destinationsError) {
      await db.from("live_events").delete().eq("id", event.id);
      await removeMuxStream(muxStream.id, authorization);
      return {
        status: "error",
        message:
          "No se pudo preparar el seguimiento de destinos. Aplica la migración de multitransmisión e inténtalo otra vez.",
      };
    }

    await db.from("audit_logs").insert({
      actor_user_id: session.user.id,
      action: "live_event.mux_created",
      entity: "live_events",
      entity_id: event.id,
      metadata_json: {
        title: parsed.data.title,
        mux_live_stream_id: muxStream.id,
        destinations: selectedPlatforms,
      },
    });

    revalidatePath("/admin/medios");
    revalidatePath("/admin/transmisiones");
    return {
      status: "success",
      message:
        "Señal lista. Copia estos dos datos en OBS; la llave se muestra sólo ahora.",
      obsServer: MUX_RTMP_SERVER,
      streamKey: muxStream.stream_key,
      eventId: event.id,
      destinations: [
        "Página web",
        ...preparedDestinations.map(
          (destination) => getSocialPlatform(destination.platform).label,
        ),
      ],
    };
  } catch {
    return {
      status: "error",
      message:
        "No se pudo conectar con Mux. Revisa la conexión e inténtalo nuevamente.",
    };
  }
}
