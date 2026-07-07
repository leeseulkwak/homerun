"use client";

import { useState, useTransition } from "react";
import { joinChallengeAction } from "@/lib/data/challenges";
import type { Challenge } from "@/lib/data/types";
import { formatDistance } from "@/lib/geo";

export default function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const [joined, setJoined] = useState(challenge.myProgress !== null);
  const [isPending, startTransition] = useTransition();

  const progress = challenge.myProgress ?? 0;
  const progressPct = Math.min(100, Math.round((progress / challenge.targetValue) * 100));
  const targetLabel =
    challenge.targetType === "distance" ? formatDistance(challenge.targetValue) : `${challenge.targetValue}회`;
  const progressLabel =
    challenge.targetType === "distance" ? formatDistance(progress) : `${progress}회`;

  function handleJoin() {
    setJoined(true);
    startTransition(() => {
      joinChallengeAction(challenge.id);
    });
  }

  return (
    <div className="mb-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">{challenge.title}</h3>
          <p className="mt-0.5 text-xs text-zinc-500">{challenge.description}</p>
        </div>
        {!joined && (
          <button
            onClick={handleJoin}
            disabled={isPending}
            className="shrink-0 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            참여하기
          </button>
        )}
      </div>

      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs text-zinc-500">
          <span>{joined ? `${progressLabel} / ${targetLabel}` : `목표 ${targetLabel}`}</span>
          <span>참여 {challenge.participantCount}명</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${joined ? progressPct : 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}
