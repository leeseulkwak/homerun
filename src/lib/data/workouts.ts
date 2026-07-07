"use server";

import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import * as mock from "./mock";
import { getViewerContext } from "./session";
import type { RoutePoint, Workout } from "./types";

export interface NewWorkoutInput {
  route: RoutePoint[];
  distanceM: number;
  durationS: number;
  avgPaceSecPerKm: number | null;
  startedAt: string;
  endedAt: string;
}

export async function saveWorkoutAction(input: NewWorkoutInput): Promise<void> {
  const { userId, apartmentComplexId } = await getViewerContext();

  if (!isSupabaseConfigured()) {
    const author = mock.findProfile(userId);
    const workout: Workout = {
      id: `w-${Date.now()}`,
      userId,
      apartmentComplexId,
      ...input,
      author: author
        ? { nickname: author.nickname, avatarUrl: author.avatarUrl, dong: author.dong }
        : { nickname: "나", avatarUrl: null, dong: "" },
      likeCount: 0,
      likedByMe: false,
      comments: [],
    };
    mock.saveWorkout(workout);
  } else {
    const supabase = await createClient();
    await supabase.from("workouts").insert({
      user_id: userId,
      apartment_complex_id: apartmentComplexId,
      route: input.route,
      distance_m: Math.round(input.distanceM),
      duration_s: Math.round(input.durationS),
      avg_pace_sec_per_km: input.avgPaceSecPerKm,
      started_at: input.startedAt,
      ended_at: input.endedAt,
    });
  }

  redirect("/");
}
