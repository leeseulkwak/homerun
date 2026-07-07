"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function signInWithKakaoAction(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback` },
  });
  if (error || !data.url) return;
  redirect(data.url);
}

export async function signInWithEmailAction(email: string): Promise<{ sent: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { sent: false, error: "Supabase가 설정되지 않았습니다." };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ email });
  return error ? { sent: false, error: error.message } : { sent: true };
}

export async function completeOnboardingAction(input: {
  nickname: string;
  apartmentComplexId: string;
  dong: string;
}): Promise<void> {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("profiles").upsert({
    id: user.id,
    nickname: input.nickname,
    apartment_complex_id: input.apartmentComplexId,
    dong: input.dong,
  });

  redirect("/");
}
