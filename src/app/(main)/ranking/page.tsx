import Link from "next/link";
import { getRanking } from "@/lib/data/ranking";
import { formatDistance } from "@/lib/geo";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: rawPeriod } = await searchParams;
  const period = rawPeriod === "month" ? "month" : "week";
  const ranking = await getRanking(period);

  return (
    <div className="px-4 py-3">
      <div className="mb-4 flex gap-2">
        <Link
          href="/ranking?period=week"
          className={`flex-1 rounded-full py-2 text-center text-sm font-medium ${
            period === "week" ? "bg-emerald-600 text-white" : "bg-white text-zinc-600 border border-zinc-200"
          }`}
        >
          주간
        </Link>
        <Link
          href="/ranking?period=month"
          className={`flex-1 rounded-full py-2 text-center text-sm font-medium ${
            period === "month" ? "bg-emerald-600 text-white" : "bg-white text-zinc-600 border border-zinc-200"
          }`}
        >
          월간
        </Link>
      </div>

      {ranking.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500">아직 랭킹 데이터가 없어요.</p>
      ) : (
        <ol className="space-y-2">
          {ranking.map((entry, i) => (
            <li
              key={entry.userId}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center text-lg">{MEDALS[i] ?? i + 1}</span>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{entry.nickname}</p>
                  <p className="text-xs text-zinc-500">
                    {entry.dong} · {entry.workoutCount}회
                  </p>
                </div>
              </div>
              <p className="text-sm font-bold text-emerald-700">{formatDistance(entry.totalDistanceM)}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
