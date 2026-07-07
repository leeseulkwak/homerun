import { getFeed } from "@/lib/data/feed";
import WorkoutCard from "@/components/feed/WorkoutCard";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function FeedPage() {
  const workouts = await getFeed();

  return (
    <div className="px-4 py-3">
      {!isSupabaseConfigured() && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          데모 모드입니다. .env.local에 Supabase 정보를 채우면 실제 데이터로 전환됩니다.
        </p>
      )}
      <h2 className="mb-3 text-base font-semibold text-zinc-800">래미안 그린파크 이웃들의 기록</h2>
      {workouts.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500">아직 기록이 없어요. 첫 기록을 남겨보세요!</p>
      ) : (
        workouts.map((w) => <WorkoutCard key={w.id} workout={w} />)
      )}
    </div>
  );
}
