import { getMyProfile } from "@/lib/data/profile";
import { formatDistance, formatDuration, formatRelativeTime } from "@/lib/geo";
import { WORKOUT_TYPE_META } from "@/lib/workoutMeta";

export default async function ProfilePage() {
  const { profile, workouts, totalDistanceM, totalDurationS, workoutCount } = await getMyProfile();

  return (
    <div className="px-4 py-3">
      <div className="mb-4 rounded-xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
          👤
        </div>
        <p className="text-sm font-semibold text-zinc-900">{profile?.nickname ?? "나"}</p>
        <p className="text-xs text-zinc-500">{profile?.dong ?? ""}</p>

        <div className="mt-4 grid grid-cols-3 divide-x divide-zinc-100">
          <div>
            <p className="text-sm font-bold text-zinc-900">{formatDistance(totalDistanceM)}</p>
            <p className="text-[11px] text-zinc-500">총 거리</p>
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900">{formatDuration(totalDurationS)}</p>
            <p className="text-[11px] text-zinc-500">총 시간</p>
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900">{workoutCount}</p>
            <p className="text-[11px] text-zinc-500">누적 기록</p>
          </div>
        </div>
      </div>

      <h3 className="mb-2 text-sm font-semibold text-zinc-700">내 기록</h3>
      {workouts.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">아직 기록이 없어요.</p>
      ) : (
        <ul className="space-y-2">
          {workouts.map((w) => (
            <li
              key={w.id}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <span>{WORKOUT_TYPE_META[w.type].icon}</span>
                <div>
                  <p className="text-sm font-medium text-zinc-900">{WORKOUT_TYPE_META[w.type].label}</p>
                  <p className="text-xs text-zinc-500">{formatRelativeTime(w.startedAt)}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-emerald-700">{formatDistance(w.distanceM)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
