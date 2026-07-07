"use server";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import * as mock from "./mock";
import { getViewerContext } from "./session";
import type { RankingEntry } from "./types";

export async function getRanking(period: "week" | "month"): Promise<RankingEntry[]> {
  const { apartmentComplexId } = await getViewerContext();
  const sinceHours = period === "week" ? 24 * 7 : 24 * 30;

  if (!isSupabaseConfigured()) {
    return mock.getRanking(apartmentComplexId, sinceHours);
  }

  const supabase = await createClient();
  const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("workouts")
    .select("user_id, distance_m, profiles(nickname, avatar_url, dong)")
    .eq("apartment_complex_id", apartmentComplexId)
    .gte("started_at", since);

  if (error || !data) return [];

  const totals = new Map<string, RankingEntry>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const w of data as any[]) {
    const entry = totals.get(w.user_id) ?? {
      userId: w.user_id,
      nickname: w.profiles?.nickname ?? "알수없음",
      dong: w.profiles?.dong ?? "",
      avatarUrl: w.profiles?.avatar_url ?? null,
      totalDistanceM: 0,
      workoutCount: 0,
    };
    entry.totalDistanceM += w.distance_m;
    entry.workoutCount += 1;
    totals.set(w.user_id, entry);
  }

  return [...totals.values()].sort((a, b) => b.totalDistanceM - a.totalDistanceM);
}
