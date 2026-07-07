"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signInWithEmailAction, signInWithKakaoAction } from "@/lib/data/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleEmailLogin() {
    if (!email.trim()) return;
    startTransition(async () => {
      const result = await signInWithEmailAction(email.trim());
      setStatus(result.sent ? "로그인 링크를 이메일로 보냈어요." : result.error ?? "로그인에 실패했어요.");
    });
  }

  return (
    <div className="flex flex-col items-center gap-6 py-10 text-center">
      <h1 className="text-2xl font-bold text-emerald-700">🏃 홈런</h1>
      <p className="text-sm text-zinc-500">우리 단지 이웃들과 함께 운동해요</p>

      <button
        onClick={() => startTransition(() => signInWithKakaoAction())}
        disabled={isPending}
        className="w-full rounded-full bg-[#FEE500] py-3 text-sm font-semibold text-[#391B1B]"
      >
        카카오로 시작하기
      </button>

      <div className="flex w-full items-center gap-3 text-xs text-zinc-400">
        <span className="h-px flex-1 bg-zinc-200" />
        또는
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <div className="w-full space-y-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 주소"
          className="w-full rounded-full border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"
        />
        <button
          onClick={handleEmailLogin}
          disabled={isPending}
          className="w-full rounded-full border border-emerald-600 py-3 text-sm font-semibold text-emerald-700"
        >
          이메일로 로그인 링크 받기
        </button>
      </div>

      {status && <p className="text-xs text-zinc-500">{status}</p>}

      <Link href="/" className="text-xs text-zinc-400 underline">
        로그인 없이 데모 둘러보기
      </Link>
    </div>
  );
}
