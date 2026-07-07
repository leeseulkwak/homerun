import { getChallenges } from "@/lib/data/challenges";
import ChallengeCard from "@/components/challenges/ChallengeCard";

export default async function ChallengesPage() {
  const challenges = await getChallenges();

  return (
    <div className="px-4 py-3">
      <h2 className="mb-3 text-base font-semibold text-zinc-800">진행 중인 챌린지</h2>
      {challenges.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500">진행 중인 챌린지가 없어요.</p>
      ) : (
        challenges.map((c) => <ChallengeCard key={c.id} challenge={c} />)
      )}
    </div>
  );
}
