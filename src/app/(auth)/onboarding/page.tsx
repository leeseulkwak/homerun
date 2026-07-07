import { listApartmentComplexes } from "@/lib/data/complexes";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage() {
  const complexes = await listApartmentComplexes();
  return (
    <div className="py-10">
      <h1 className="mb-1 text-xl font-bold text-zinc-900">프로필을 설정해주세요</h1>
      <p className="mb-6 text-sm text-zinc-500">단지 이웃들에게 표시될 정보예요</p>
      <OnboardingForm complexes={complexes} />
    </div>
  );
}
