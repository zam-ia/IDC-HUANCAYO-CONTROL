export type LiveEventStatus =
  | "draft"
  | "scheduled"
  | "rehearsal"
  | "live"
  | "interrupted"
  | "finished"
  | "archived";

export interface PublicLiveEvent {
  id: string | null;
  slug: string | null;
  title: string;
  description: string | null;
  speaker: string | null;
  coverUrl: string | null;
  scheduledAt: string | null;
  actualStartAt: string | null;
  actualEndAt: string | null;
  status: LiveEventStatus;
  playbackId: string | null;
  replayPlaybackId: string | null;
  socialFallbackUrl: string | null;
}

export interface RadioTrack {
  title: string;
  artist: string | null;
  album: string | null;
  artworkUrl: string | null;
  playedAt: number | null;
}

export interface RadioNowPlaying {
  stationName: string;
  isOnline: boolean;
  isLive: boolean;
  listeners: number;
  streamUrl: string | null;
  current: RadioTrack | null;
  history: RadioTrack[];
  liveHost: string | null;
  updatedAt: string;
}

export interface RadioScheduleItem {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
  program: {
    name: string;
    host: string | null;
    description: string | null;
    artworkUrl: string | null;
  };
}
