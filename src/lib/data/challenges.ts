"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import * as mock from "./mock";
import { getViewerContext } from "./session";
import type { Challenge } from "./types";

export async function getChallenges(): Promise<Challenge[]> {
  const { userId, apartmentComplexId } = await getViewerContext();

  if (!isSupabaseConfigured()) {
    return mock.listChallenges(apartmentComplexId, userId);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("challenges")
    .select("id, apartment_complex_id, title, description, target_type, target_value, start_date, end_date, challenge_participants(user_id, progress)")
    .eq("apartment_complex_id", apartmentComplexId);

  if (error || !data) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((c) => ({
    id: c.id,
    apartmentComplexId: c.apartment_complex_id,
    title: c.title,
    description: c.description ?? "",
    targetType: c.target_type,
    targetValue: c.target_value,
    startDate: c.start_date,
    endDate: c.end_date,
    participantCount: c.challenge_participants?.length ?? 0,
    myProgress:
      c.challenge_participants?.find((p: { user_id: string }) => p.user_id === userId)?.progress ?? null,
  }));
}

export async function joinChallengeAction(challengeId: string): Promise<void> {
  const { userId } = await getViewerContext();

  if (!isSupabaseConfigured()) {
    mock.joinChallenge(challengeId, userId);
  } else {
    const supabase = await createClient();
    await supabase
      .from("challenge_participants")
      .upsert({ challenge_id: challengeId, user_id: userId }, { onConflict: "challenge_id,user_id", ignoreDuplicates: true });
  }

  revalidatePath("/challenges");
}
