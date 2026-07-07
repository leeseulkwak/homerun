"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import * as mock from "./mock";
import { getViewerContext } from "./session";
import type { Workout } from "./types";

export async function getFeed(): Promise<Workout[]> {
  const { userId, apartmentComplexId } = await getViewerContext();

  if (!isSupabaseConfigured()) {
    return mock.listWorkouts(apartmentComplexId, userId);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workouts")
    .select(
      "id, user_id, apartment_complex_id, route, distance_m, duration_s, avg_pace_sec_per_km, started_at, ended_at, profiles(nickname, avatar_url, dong), workout_likes(user_id), workout_comments(id, user_id, body, created_at, profiles(nickname))"
    )
    .eq("apartment_complex_id", apartmentComplexId)
    .order("started_at", { ascending: false });

  if (error || !data) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((w) => ({
    id: w.id,
    userId: w.user_id,
    apartmentComplexId: w.apartment_complex_id,
    route: w.route,
    distanceM: w.distance_m,
    durationS: w.duration_s,
    avgPaceSecPerKm: w.avg_pace_sec_per_km,
    startedAt: w.started_at,
    endedAt: w.ended_at,
    author: {
      nickname: w.profiles?.nickname ?? "알수없음",
      avatarUrl: w.profiles?.avatar_url ?? null,
      dong: w.profiles?.dong ?? "",
    },
    likeCount: w.workout_likes?.length ?? 0,
    likedByMe: !!w.workout_likes?.some((l: { user_id: string }) => l.user_id === userId),
    comments: (w.workout_comments ?? []).map((c: { id: string; user_id: string; body: string; created_at: string; profiles?: { nickname: string } }) => ({
      id: c.id,
      workoutId: w.id,
      userId: c.user_id,
      nickname: c.profiles?.nickname ?? "알수없음",
      body: c.body,
      createdAt: c.created_at,
    })),
  }));
}

export async function toggleLikeAction(workoutId: string): Promise<void> {
  const { userId } = await getViewerContext();

  if (!isSupabaseConfigured()) {
    mock.toggleLike(workoutId, userId);
  } else {
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("workout_likes")
      .select("workout_id")
      .eq("workout_id", workoutId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabase.from("workout_likes").delete().eq("workout_id", workoutId).eq("user_id", userId);
    } else {
      await supabase.from("workout_likes").insert({ workout_id: workoutId, user_id: userId });
    }
  }

  revalidatePath("/");
}

export async function addCommentAction(workoutId: string, body: string): Promise<void> {
  if (!body.trim()) return;
  const { userId } = await getViewerContext();

  if (!isSupabaseConfigured()) {
    mock.addComment(workoutId, userId, body.trim());
  } else {
    const supabase = await createClient();
    await supabase.from("workout_comments").insert({ workout_id: workoutId, user_id: userId, body: body.trim() });
  }

  revalidatePath("/");
}
