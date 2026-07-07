"use client";

import { useState, useTransition } from "react";
import { useGeoTracker } from "@/hooks/useGeoTracker";
import RoutePreview from "@/components/track/RoutePreview";
import { formatDistance, formatDuration, formatPace } from "@/lib/geo";
import { WORKOUT_TYPE_META } from "@/lib/workoutMeta";
import { saveWorkoutAction } from "@/lib/data/workouts";
import type { WorkoutType } from "@/lib/data/types";

const TYPES: WorkoutType[] = ["walk", "run", "hike"];

export default function TrackPage() {
  const [type, setType] = useState<WorkoutType>("run");
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const tracker = useGeoTracker();

  const avgPace = tracker.distanceM > 0 ? tracker.durationS / (tracker.distanceM / 1000) : null;

  function handleStart() {
    setStartedAt(new Date().toISOString());
    tracker.start();
  }

  function handleSave() {
    startSaving(() => {
      saveWorkoutAction({
        type,
        route: tracker.route,
        distanceM: tracker.distanceM,
        durationS: tracker.durationS,
        avgPaceSecPerKm: avgPace,
        startedAt: startedAt ?? new Date().toISOString(),
        endedAt: new Date().toISOString(),
      });
    });
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-3">
      {tracker.status === "idle" && (
        <div className="flex gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex-1 rounded-full border px-3 py-2 text-sm font-medium ${
                type === t
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-zinc-200 bg-white text-zinc-600"
              }`}
            >
              {WORKOUT_TYPE_META[t].icon} {WORKOUT_TYPE_META[t].label}
            </button>
          ))}
        </div>
      )}

      <RoutePreview route={tracker.route} height={220} />

      {tracker.error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{tracker.error}</p>
      )}

      <div className="grid grid-cols-3 gap-2 rounded-xl bg-white p-4 text-center shadow-sm">
        <div>
          <p className="text-xl font-bold text-zinc-900">{formatDistance(tracker.distanceM)}</p>
          <p className="text-xs text-zinc-500">거리</p>
        </div>
        <div>
          <p className="text-xl font-bold text-zinc-900">{formatDuration(tracker.durationS)}</p>
          <p className="text-xs text-zinc-500">시간</p>
        </div>
        <div>
          <p className="text-xl font-bold text-zinc-900">{formatPace(avgPace)}</p>
          <p className="text-xs text-zinc-500">평균 페이스</p>
        </div>
      </div>

      <div className="flex gap-2">
        {tracker.status === "idle" && (
          <button
            onClick={handleStart}
            className="flex-1 rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white"
          >
            시작하기
          </button>
        )}
        {tracker.status === "tracking" && (
          <>
            <button
              onClick={tracker.pause}
              className="flex-1 rounded-full border border-zinc-300 py-3 text-sm font-semibold text-zinc-700"
            >
              일시정지
            </button>
            <button
              onClick={tracker.stop}
              className="flex-1 rounded-full bg-rose-600 py-3 text-sm font-semibold text-white"
            >
              종료
            </button>
          </>
        )}
        {tracker.status === "paused" && (
          <>
            <button
              onClick={tracker.resume}
              className="flex-1 rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white"
            >
              재개
            </button>
            <button
              onClick={tracker.stop}
              className="flex-1 rounded-full bg-rose-600 py-3 text-sm font-semibold text-white"
            >
              종료
            </button>
          </>
        )}
        {tracker.status === "stopped" && (
          <>
            <button
              onClick={tracker.reset}
              className="flex-1 rounded-full border border-zinc-300 py-3 text-sm font-semibold text-zinc-700"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSaving ? "저장 중..." : "기록 저장"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
