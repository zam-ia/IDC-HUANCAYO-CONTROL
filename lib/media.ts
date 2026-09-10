import "server-only";

import { supabaseAdmin } from "@/lib/db";
import type {
  LiveEventStatus,
  PublicLiveEvent,
  RadioNowPlaying,
  RadioScheduleItem,
  RadioTrack,
} from "@/types/media";

const publicLiveFields = [
  "id",
  "slug",
  "title",
  "description",
  "speaker",
  "cover_url",
  "scheduled_at",
  "actual_start_at",
  "actual_end_at",
  "status",
  "mux_playback_id",
  "replay_playback_id",
  "social_fallback_url",
].join(",");

const livePriority: LiveEventStatus[] = [
  "live",
  "interrupted",
  "scheduled",
  "finished",
];

function emptyLiveEvent(): PublicLiveEvent {
  return {
    id: null,
    slug: null,
    title: "Centro de transmisiones IDC Huancayo",
    description: "La próxima transmisión será anunciada en este espacio.",
    speaker: null,
    coverUrl: null,
    scheduledAt: null,
    actualStartAt: null,
    actualEndAt: null,
    status: "archived",
    playbackId: null,
    replayPlaybackId: null,
    socialFallbackUrl: process.env.PRIMARY_SOCIAL_LIVE_URL || null,
  };
}

function mapLiveEvent(row: Record<string, unknown>): PublicLiveEvent {
  return {
    id: typeof row.id === "string" ? row.id : null,
    slug: typeof row.slug === "string" ? row.slug : null,
    title:
      typeof row.title === "string" ? row.title : "Transmisión IDC Huancayo",
    description: typeof row.description === "string" ? row.description : null,
    speaker: typeof row.speaker === "string" ? row.speaker : null,
    coverUrl: typeof row.cover_url === "string" ? row.cover_url : null,
    scheduledAt: typeof row.scheduled_at === "string" ? row.scheduled_at : null,
    actualStartAt:
      typeof row.actual_start_at === "string" ? row.actual_start_at : null,
    actualEndAt:
      typeof row.actual_end_at === "string" ? row.actual_end_at : null,
    status: livePriority.includes(row.status as LiveEventStatus)
      ? (row.status as LiveEventStatus)
      : "finished",
    playbackId:
      typeof row.mux_playback_id === "string" ? row.mux_playback_id : null,
    replayPlaybackId:
      typeof row.replay_playback_id === "string"
        ? row.replay_playback_id
        : null,
    socialFallbackUrl:
      typeof row.social_fallback_url === "string"
        ? row.social_fallback_url
        : process.env.PRIMARY_SOCIAL_LIVE_URL || null,
  };
}

export async function getPublicLiveEvent(): Promise<PublicLiveEvent> {
  const database = supabaseAdmin;
  if (!database) return emptyLiveEvent();
  try {
    const now = new Date().toISOString();
    const base = () =>
      database
        .from("live_events")
        .select(publicLiveFields)
        .eq("visibility", "public");
    const [active, scheduled, replay] = await Promise.all([
      base().in("status", ["live", "interrupted"]).limit(1),
      base()
        .eq("status", "scheduled")
        .gte("scheduled_at", now)
        .order("scheduled_at", { ascending: true })
        .limit(1),
      base()
        .eq("status", "finished")
        .not("replay_playback_id", "is", null)
        .order("actual_end_at", { ascending: false, nullsFirst: false })
        .limit(1),
    ]);
    const row = active.data?.[0] || scheduled.data?.[0] || replay.data?.[0];
    return row
      ? mapLiveEvent(row as unknown as Record<string, unknown>)
      : emptyLiveEvent();
  } catch {
    return emptyLiveEvent();
  }
}

function mapTrack(input: unknown): RadioTrack | null {
  if (!input || typeof input !== "object") return null;
  const item = input as Record<string, unknown>;
  const song =
    item.song && typeof item.song === "object"
      ? (item.song as Record<string, unknown>)
      : item;

  const title =
    typeof song.title === "string" && song.title.trim()
      ? song.title.trim()
      : "Programación IDC Radio";

  return {
    title,
    artist:
      typeof song.artist === "string" && song.artist.trim()
        ? song.artist.trim()
        : null,
    album:
      typeof song.album === "string" && song.album.trim()
        ? song.album.trim()
        : null,
    artworkUrl: typeof song.art === "string" ? song.art : null,
    playedAt: typeof item.played_at === "number" ? item.played_at : null,
  };
}

function offlineRadio(): RadioNowPlaying {
  return {
    stationName: process.env.RADIO_STATION_NAME || "IDC Radio Huancayo",
    isOnline: false,
    isLive: false,
    listeners: 0,
    streamUrl: process.env.AZURACAST_PUBLIC_STREAM_URL || null,
    current: null,
    history: [],
    liveHost: null,
    updatedAt: new Date().toISOString(),
  };
}

export async function getRadioNowPlaying(): Promise<RadioNowPlaying> {
  const baseUrl = process.env.AZURACAST_BASE_URL?.replace(/\/$/, "");
  const station = process.env.AZURACAST_STATION_SHORTCODE;

  if (!baseUrl || !station) return offlineRadio();

  try {
    const response = await fetch(`${baseUrl}/api/nowplaying/${station}`, {
      next: { revalidate: 15 },
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(1500),
    });

    if (!response.ok) return offlineRadio();

    const payload = (await response.json()) as Record<string, unknown>;
    const stationData = (payload.station || {}) as Record<string, unknown>;
    const nowPlaying = (payload.now_playing || {}) as Record<string, unknown>;
    const live = (payload.live || {}) as Record<string, unknown>;
    const listeners = (payload.listeners || {}) as Record<string, unknown>;
    const mounts = Array.isArray(stationData.mounts) ? stationData.mounts : [];
    const firstMount = (mounts[0] || {}) as Record<string, unknown>;
    const history = Array.isArray(payload.song_history)
      ? payload.song_history.map(mapTrack).filter(Boolean).slice(0, 5)
      : [];

    return {
      stationName:
        typeof stationData.name === "string"
          ? stationData.name
          : process.env.RADIO_STATION_NAME || "IDC Radio Huancayo",
      isOnline: payload.is_online === true,
      isLive: live.is_live === true,
      listeners: typeof listeners.current === "number" ? listeners.current : 0,
      streamUrl:
        process.env.AZURACAST_PUBLIC_STREAM_URL ||
        (typeof firstMount.url === "string" ? firstMount.url : null),
      current: mapTrack(nowPlaying),
      history: history as RadioTrack[],
      liveHost:
        typeof live.streamer_name === "string" ? live.streamer_name : null,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return offlineRadio();
  }
}

export async function getRadioSchedule(): Promise<RadioScheduleItem[]> {
  if (!supabaseAdmin) return [];
  try {
    const { data, error } = await supabaseAdmin
      .from("radio_schedule")
      .select(
        "id,weekday,start_time,end_time,radio_programs(name,host,description,artwork_url)",
      )
      .eq("active", true)
      .order("weekday", { ascending: true })
      .order("start_time", { ascending: true });

    if (error || !data) return [];

    return data.flatMap((row) => {
      const nested = Array.isArray(row.radio_programs)
        ? row.radio_programs[0]
        : row.radio_programs;
      if (!nested) return [];

      return [
        {
          id: row.id,
          weekday: row.weekday,
          startTime: row.start_time,
          endTime: row.end_time,
          program: {
            name: nested.name,
            host: nested.host,
            description: nested.description,
            artworkUrl: nested.artwork_url,
          },
        },
      ];
    });
  } catch {
    return [];
  }
}

export interface PublicMediaAsset {
  id: string;
  title: string;
  description: string | null;
  speaker: string | null;
  type: string;
  thumbnailUrl: string | null;
  playbackUrl: string | null;
  publishedAt: string | null;
}

export async function getPublicMediaAssets(
  limit = 6,
  type?: "sermon" | "podcast",
): Promise<PublicMediaAsset[]> {
  if (!supabaseAdmin) return [];
  try {
    let query = supabaseAdmin
      .from("media_assets")
      .select(
        "id,title,description,speaker,type,thumbnail_url,playback_url,published_at",
      )
      .eq("visibility", "public")
      .not("published_at", "is", null);
    if (type) query = query.eq("type", type);
    const { data, error } = await query
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return data.map((asset) => ({
      id: asset.id,
      title: asset.title,
      description: asset.description,
      speaker: asset.speaker,
      type: asset.type,
      thumbnailUrl: asset.thumbnail_url,
      playbackUrl: asset.playback_url,
      publishedAt: asset.published_at,
    }));
  } catch {
    return [];
  }
}
