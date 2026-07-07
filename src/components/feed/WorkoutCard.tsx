"use client";

import { useState, useTransition } from "react";
import { addCommentAction, toggleLikeAction } from "@/lib/data/feed";
import type { Workout } from "@/lib/data/types";
import { formatDistance, formatDuration, formatPace, formatRelativeTime } from "@/lib/geo";
import { WORKOUT_TYPE_META } from "@/lib/workoutMeta";
import RoutePreview from "@/components/track/RoutePreview";

export default function WorkoutCard({ workout }: { workout: Workout }) {
  const meta = WORKOUT_TYPE_META[workout.type];
  const [likeCount, setLikeCount] = useState(workout.likeCount);
  const [likedByMe, setLikedByMe] = useState(workout.likedByMe);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(workout.comments);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleLike() {
    setLikedByMe((v) => !v);
    setLikeCount((c) => (likedByMe ? c - 1 : c + 1));
    startTransition(() => {
      toggleLikeAction(workout.id);
    });
  }

  function handleSubmitComment() {
    const body = draft.trim();
    if (!body) return;
    setComments((cs) => [
      ...cs,
      { id: `local-${cs.length}`, workoutId: workout.id, userId: "me", nickname: "나", body, createdAt: new Date().toISOString() },
    ]);
    setDraft("");
    startTransition(() => {
      addCommentAction(workout.id, body);
    });
  }

  return (
    <article className="mb-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-lg">
            {meta.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">{workout.author.nickname}</p>
            <p className="text-xs text-zinc-500">
              {workout.author.dong} · {formatRelativeTime(workout.startedAt)}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
          {meta.label}
        </span>
      </div>

      <div className="mt-3">
        <RoutePreview route={workout.route} height={120} />
      </div>

      <div className="mt-3 grid grid-cols-3 divide-x divide-zinc-100 text-center">
        <div>
          <p className="text-sm font-bold text-zinc-900">{formatDistance(workout.distanceM)}</p>
          <p className="text-[11px] text-zinc-500">거리</p>
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-900">{formatDuration(workout.durationS)}</p>
          <p className="text-[11px] text-zinc-500">시간</p>
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-900">{formatPace(workout.avgPaceSecPerKm)}</p>
          <p className="text-[11px] text-zinc-500">평균 페이스</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 border-t border-zinc-100 pt-3 text-sm">
        <button
          onClick={handleLike}
          disabled={isPending}
          className={`flex items-center gap-1 ${likedByMe ? "text-rose-600" : "text-zinc-500"}`}
        >
          {likedByMe ? "❤️" : "🤍"} {likeCount}
        </button>
        <button onClick={() => setShowComments((v) => !v)} className="flex items-center gap-1 text-zinc-500">
          💬 {comments.length}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 space-y-2 border-t border-zinc-100 pt-3">
          {comments.map((c) => (
            <p key={c.id} className="text-sm">
              <span className="font-semibold text-zinc-800">{c.nickname}</span>{" "}
              <span className="text-zinc-600">{c.body}</span>
            </p>
          ))}
          <div className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
              placeholder="응원 댓글 남기기"
              className="flex-1 rounded-full border border-zinc-200 px-3 py-1.5 text-sm outline-none focus:border-emerald-400"
            />
            <button
              onClick={handleSubmitComment}
              className="rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white"
            >
              등록
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
