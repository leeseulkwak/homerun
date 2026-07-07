import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { DEMO_APARTMENT_COMPLEX_ID, DEMO_USER_ID } from "./mock";

export interface ViewerContext {
  userId: string;
  apartmentComplexId: string;
}

// Supabase 미설정 시 데모 유저로 동작. 설정되면 실제 로그인 세션을 사용한다.
export async function getViewerContext(): Promise<ViewerContext> {
  if (!isSupabaseConfigured()) {
    return { userId: DEMO_USER_ID, apartmentComplexId: DEMO_APARTMENT_COMPLEX_ID };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { userId: DEMO_USER_ID, apartmentComplexId: DEMO_APARTMENT_COMPLEX_ID };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("apartment_complex_id")
    .eq("id", user.id)
    .single();

  return {
    userId: user.id,
    apartmentComplexId: profile?.apartment_complex_id ?? DEMO_APARTMENT_COMPLEX_ID,
  };
}
