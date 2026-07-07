"use client";

import { useState, useTransition } from "react";
import { completeOnboardingAction } from "@/lib/data/auth";
import type { ApartmentComplex } from "@/lib/data/types";

export default function OnboardingForm({ complexes }: { complexes: ApartmentComplex[] }) {
  const [nickname, setNickname] = useState("");
  const [apartmentComplexId, setApartmentComplexId] = useState(complexes[0]?.id ?? "");
  const [dong, setDong] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!nickname.trim() || !apartmentComplexId || !dong.trim()) return;
    startTransition(() => {
      completeOnboardingAction({ nickname: nickname.trim(), apartmentComplexId, dong: dong.trim() });
    });
  }

  return (
    <div className="space-y-3">
      <input
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="닉네임"
        className="w-full rounded-full border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"
      />
      <select
        value={apartmentComplexId}
        onChange={(e) => setApartmentComplexId(e.target.value)}
        className="w-full rounded-full border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"
      >
        {complexes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <input
        value={dong}
        onChange={(e) => setDong(e.target.value)}
        placeholder="동 (예: 101동)"
        className="w-full rounded-full border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"
      />
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isPending ? "저장 중..." : "시작하기"}
      </button>
    </div>
  );
}
