import type { WorkoutType } from "./data/types";

export const WORKOUT_TYPE_META: Record<WorkoutType, { label: string; icon: string }> = {
  walk: { label: "걷기", icon: "🚶" },
  run: { label: "달리기", icon: "🏃" },
};
