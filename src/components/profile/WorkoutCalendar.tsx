"use client";

import { useMemo, useState } from "react";
import type { Workout } from "@/lib/data/types";
import { formatDistance, formatPace } from "@/lib/geo";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function WorkoutCalendar({ workouts }: { workouts: Workout[] }) {
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const byDate = useMemo(() => {
    const map = new Map<string, Workout[]>();
    for (const w of workouts) {
      const key = dateKey(new Date(w.startedAt));
      const list = map.get(key) ?? [];
      list.push(w);
      map.set(key, list);
    }
    return map;
  }, [workouts]);

  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();

  const monthWorkoutDays = useMemo(
    () => [...byDate.keys()].filter((k) => k.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)),
    [byDate, year, month]
  );
  const monthDistanceM = monthWorkoutDays.reduce(
    (sum, key) => sum + (byDate.get(key) ?? []).reduce((s, w) => s + w.distanceM, 0),
    0
  );

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = firstDayOfMonth.getDay();

  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  const todayKey = dateKey(new Date());
  const selectedWorkouts = selectedKey ? byDate.get(selectedKey) ?? [] : [];

  function changeMonth(delta: number) {
    setMonthCursor(new Date(year, month + delta, 1));
    setSelectedKey(null);
  }

  return (
    <div className="mb-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => changeMonth(-1)} className="px-2 py-1 text-zinc-400" aria-label="이전 달">
          ‹
        </button>
        <p className="text-sm font-semibold text-zinc-900">
          {year}년 {month + 1}월
        </p>
        <button onClick={() => changeMonth(1)} className="px-2 py-1 text-zinc-400" aria-label="다음 달">
          ›
        </button>
      </div>

      <p className="mb-3 text-center text-xs text-zinc-500">
        이번 달 <span className="font-semibold text-emerald-700">{monthWorkoutDays.length}일</span> 기록 · 총{" "}
        <span className="font-semibold text-emerald-700">{formatDistance(monthDistanceM)}</span>
      </p>

      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px] text-zinc-400">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {cells.map((date, i) => {
          if (!date) return <span key={`blank-${i}`} />;
          const key = dateKey(date);
          const hasRecord = byDate.has(key);
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;

          return (
            <button
              key={key}
              onClick={() => setSelectedKey(isSelected ? null : key)}
              className="flex flex-col items-center gap-0.5 py-1"
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                  isSelected
                    ? "bg-emerald-600 text-white font-semibold"
                    : isToday
                      ? "border border-emerald-500 text-emerald-700"
                      : "text-zinc-700"
                }`}
              >
                {date.getDate()}
              </span>
              <span className={`h-1 w-1 rounded-full ${hasRecord ? "bg-emerald-500" : "bg-transparent"}`} />
            </button>
          );
        })}
      </div>

      {selectedKey && (
        <div className="mt-3 space-y-2 border-t border-zinc-100 pt-3">
          <p className="text-xs font-medium text-zinc-500">{selectedKey}</p>
          {selectedWorkouts.length === 0 ? (
            <p className="text-sm text-zinc-400">기록이 없어요.</p>
          ) : (
            selectedWorkouts.map((w) => (
              <div key={w.id} className="flex items-center justify-between text-sm">
                <span>🏃 {formatPace(w.avgPaceSecPerKm)}</span>
                <span className="font-semibold text-emerald-700">{formatDistance(w.distanceM)}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
