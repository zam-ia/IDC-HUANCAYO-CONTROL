"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/db";
import { isAdminRole } from "@/lib/roles";

const liveEventSchema = z.object({
  title: z.string().trim().min(3).max(140),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(140)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(2000).optional(),
  speaker: z.string().trim().max(120).optional(),
  scheduledAt: z.string().min(1),
  visibility: z.enum(["public", "private"]),
  muxLiveStreamId: z.string().trim().max(200).optional(),
  muxPlaybackId: z.string().trim().max(200).optional(),
  socialFallbackUrl: z.union([z.literal(""), z.string().url()]).optional(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!isAdminRole(session?.user?.role) || !session.user.id)
    throw new Error("No autorizado");
  return session.user.id;
}

function asLimaIso(value: string) {
  const normalized = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value)
    ? value
    : `${value}:00-05:00`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) throw new Error("Fecha no válida");
  return date.toISOString();
}

export async function createLiveEventAction(formData: FormData) {
  const actorUserId = await requireAdmin();
  const parsed = liveEventSchema.parse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    speaker: formData.get("speaker") || undefined,
    scheduledAt: formData.get("scheduledAt"),
    visibility: formData.get("visibility"),
    muxLiveStreamId: formData.get("muxLiveStreamId") || undefined,
    muxPlaybackId: formData.get("muxPlaybackId") || undefined,
    socialFallbackUrl: formData.get("socialFallbackUrl") || undefined,
  });
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("live_events")
    .insert({
      title: parsed.title,
      slug: parsed.slug,
      description: parsed.description || null,
      speaker: parsed.speaker || null,
      scheduled_at: asLimaIso(parsed.scheduledAt),
      visibility: parsed.visibility,
      status: "scheduled",
      mux_live_stream_id: parsed.muxLiveStreamId || null,
      mux_playback_id: parsed.muxPlaybackId || null,
      social_fallback_url: parsed.socialFallbackUrl || null,
      created_by: actorUserId,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  await db.from("audit_logs").insert({
    actor_user_id: actorUserId,
    action: "live_event.created",
    entity: "live_events",
    entity_id: data.id,
    metadata_json: { title: parsed.title, visibility: parsed.visibility },
  });
  revalidatePath("/admin/transmisiones");
}

export async function updateLiveEventStatusAction(formData: FormData) {
  const actorUserId = await requireAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  const status = z
    .enum([
      "scheduled",
      "rehearsal",
      "live",
      "interrupted",
      "finished",
      "archived",
    ])
    .parse(formData.get("status"));
  const db = getSupabaseAdmin();
  const timestamps =
    status === "live"
      ? { actual_start_at: new Date().toISOString(), actual_end_at: null }
      : status === "finished"
        ? { actual_end_at: new Date().toISOString() }
        : {};
  const { error } = await db
    .from("live_events")
    .update({ status, ...timestamps })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await db.from("audit_logs").insert({
    actor_user_id: actorUserId,
    action: "live_event.status_changed",
    entity: "live_events",
    entity_id: id,
    metadata_json: { status },
  });
  revalidatePath("/admin/transmisiones");
}
