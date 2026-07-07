"use server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import * as mock from "./mock";
import { getViewerContext } from "./session";
import type { Profile, Workout } from "./types";

export interface MyProfileData {
  profile: Profile | null;
  workouts: Workout[];
  totalDistanceM: number;
  totalDurationS: number;
  workoutCount: number;
}

export async function getMyProfile(): Promise<MyProfileData> {
  const { userId, apartmentComplexId } = await getViewerContext();

  let workouts: Workout[];
  let profile: Profile | null;

  if (!isSupabaseConfigured()) {
    workouts = mock.listWorkouts(apartmentComplexId, userId).filter((w) => w.userId === userId);
    profile = mock.findProfile(userId) ?? null;
  } else {
    const supabase = await createClient();
    const [{ data: profileRow }, { data: workoutRows }] = await Promise.all([
      supabase.from("profiles").select("id, nickname, avatar_url, apartment_complex_id, dong").eq("id", userId).maybeSingle(),
      supabase
        .from("workouts")
        .select("id, user_id, apartment_complex_id, route, distance_m, duration_s, avg_pace_sec_per_km, started_at, ended_at")
        .eq("user_id", userId)
        .order("started_at", { ascending: false }),
    ]);

    profile = profileRow
      ? {
          id: profileRow.id,
          nickname: profileRow.nickname,
          avatarUrl: profileRow.avatar_url,
          apartmentComplexId: profileRow.apartment_complex_id,
          dong: profileRow.dong,
        }
      : null;

    workouts = (workoutRows ?? []).map((w) => ({
      id: w.id,
      userId: w.user_id,
      apartmentComplexId: w.apartment_complex_id,
      route: w.route,
      distanceM: w.distance_m,
      durationS: w.duration_s,
      avgPaceSecPerKm: w.avg_pace_sec_per_km,
      startedAt: w.started_at,
      endedAt: w.ended_at,
      author: { nickname: profile?.nickname ?? "", avatarUrl: profile?.avatarUrl ?? null, dong: profile?.dong ?? "" },
      likeCount: 0,
      likedByMe: false,
      comments: [],
    }));
  }

  return {
    profile,
    workouts,
    totalDistanceM: workouts.reduce((sum, w) => sum + w.distanceM, 0),
    totalDurationS: workouts.reduce((sum, w) => sum + w.durationS, 0),
    workoutCount: workouts.length,
  };
}
