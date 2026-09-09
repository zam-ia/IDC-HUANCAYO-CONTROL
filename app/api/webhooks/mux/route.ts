import { createHmac, timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/lib/db";
import { platformFromMuxPassthrough } from "@/lib/simulcast";

export const runtime = "nodejs";

const signatureMaxAgeSeconds = 300;

type MuxWebhookData = {
  id?: string;
  live_stream_id?: string;
  passthrough?: string;
  status?: string;
  error_severity?: "normal" | "fatal";
};

type DestinationState =
  | "ready"
  | "connecting"
  | "live"
  | "error"
  | "unavailable"
  | "stopped";

function verifyMuxSignature(rawBody: string, signatureHeader: string) {
  const secret = process.env.MUX_WEBHOOK_SECRET;
  if (!secret) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, ...value] = part.trim().split("=");
      return [key, value.join("=")];
    }),
  );
  const timestamp = Number(parts.t);
  const received = parts.v1;

  if (!timestamp || !received) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > signatureMaxAgeSeconds)
    return false;

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

function stateFromMuxTarget(
  eventType: string,
  muxStatus: string | undefined,
  liveEventStatus: string,
): DestinationState | null {
  const status =
    eventType === "video.live_stream.simulcast_target.updated"
      ? muxStatus
      : eventType.split(".").at(-1);

  if (status === "created") return "ready";
  if (status === "starting") return "connecting";
  if (status === "broadcasting") return "live";
  if (status === "errored") return "error";
  if (status === "deleted") return "unavailable";
  if (status === "idle") {
    return ["live", "interrupted", "finished"].includes(liveEventStatus)
      ? "stopped"
      : "ready";
  }
  return null;
}

async function updateMainLiveStream(eventType: string, liveStreamId: string) {
  if (!supabaseAdmin) return null;

  const changes: Record<string, string | null> = {};
  let destinationState: DestinationState | null = null;
  if (eventType === "video.live_stream.active") {
    changes.status = "live";
    changes.actual_start_at = new Date().toISOString();
    changes.actual_end_at = null;
    destinationState = "live";
  } else if (eventType === "video.live_stream.idle") {
    changes.status = "finished";
    changes.actual_end_at = new Date().toISOString();
    destinationState = "stopped";
  }

  if (!Object.keys(changes).length) return null;

  const { data: liveEvent, error } = await supabaseAdmin
    .from("live_events")
    .update(changes)
    .eq("mux_live_stream_id", liveStreamId)
    .select("id")
    .maybeSingle();
  if (error) throw error;

  if (liveEvent && destinationState) {
    const timestamp = new Date().toISOString();
    const destinationChanges: Record<string, string | null> = {
      state: destinationState,
      last_error: null,
      error_severity: null,
    };
    if (destinationState === "live") destinationChanges.started_at = timestamp;
    if (destinationState === "stopped")
      destinationChanges.stopped_at = timestamp;

    await supabaseAdmin
      .from("live_destinations")
      .update(destinationChanges)
      .eq("live_event_id", liveEvent.id)
      .eq("platform", "mux");
  }

  return liveEvent?.id || null;
}

async function updateSimulcastTarget(eventType: string, data: MuxWebhookData) {
  if (!supabaseAdmin || !data.live_stream_id) return null;

  const platform = platformFromMuxPassthrough(data.passthrough);
  const { data: liveEvent, error: eventError } = await supabaseAdmin
    .from("live_events")
    .select("id,status")
    .eq("mux_live_stream_id", data.live_stream_id)
    .maybeSingle();
  if (eventError) throw eventError;
  if (!liveEvent) return null;

  const state = stateFromMuxTarget(eventType, data.status, liveEvent.status);
  if (!state) return liveEvent.id;

  const timestamp = new Date().toISOString();
  const changes: Record<string, string | null> = {
    state,
    error_severity: state === "error" ? data.error_severity || "normal" : null,
    last_error:
      state === "error"
        ? data.error_severity === "fatal"
          ? "Mux detuvo este destino por un error fatal. Revisa la URL y la llave."
          : "Mux reportó un error en este destino. Revisa la cuenta y la llave."
        : null,
  };
  if (data.id) changes.mux_simulcast_target_id = data.id;
  if (state === "live") changes.started_at = timestamp;
  if (["stopped", "unavailable"].includes(state)) {
    changes.stopped_at = timestamp;
  }

  let update = supabaseAdmin
    .from("live_destinations")
    .update(changes)
    .eq("live_event_id", liveEvent.id);
  if (platform) {
    update = update.eq("platform", platform);
  } else if (data.id) {
    update = update.eq("mux_simulcast_target_id", data.id);
  } else {
    return liveEvent.id;
  }

  const { data: destination, error } = await update
    .select("id,platform")
    .maybeSingle();
  if (error) throw error;

  if (destination) {
    await supabaseAdmin.from("live_session_logs").insert({
      event_id: liveEvent.id,
      destination_id: destination.id,
      level: state === "error" ? "error" : "info",
      code: `mux.simulcast.${state}`,
      message: `${destination.platform}: ${state}`,
      metadata_json: {
        mux_target_id: data.id || null,
        error_severity: data.error_severity || null,
      },
    });
  }

  return liveEvent.id;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("mux-signature") || "";

  if (!verifyMuxSignature(rawBody, signature)) {
    return Response.json({ error: "Firma no válida" }, { status: 401 });
  }

  let event: { type?: string; data?: MuxWebhookData };
  try {
    event = JSON.parse(rawBody) as { type?: string; data?: MuxWebhookData };
  } catch {
    return Response.json({ error: "JSON no válido" }, { status: 400 });
  }

  if (!supabaseAdmin || !event.type || !event.data) {
    return Response.json({ received: true });
  }

  try {
    if (event.type.startsWith("video.live_stream.simulcast_target.")) {
      await updateSimulcastTarget(event.type, event.data);
    } else if (event.data.id) {
      await updateMainLiveStream(event.type, event.data.id);
    }
  } catch (error) {
    console.error("No se pudo actualizar el estado recibido desde Mux", error);
    return Response.json({ error: "Error de persistencia" }, { status: 500 });
  }

  return Response.json({ received: true });
}
