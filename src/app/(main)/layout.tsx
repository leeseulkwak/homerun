import BottomNav from "@/components/nav/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-zinc-50">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white px-4 py-3">
        <h1 className="text-lg font-bold text-emerald-700">🏃 홈런</h1>
      </header>
      <main className="flex-1 overflow-y-auto pb-4">{children}</main>
      <BottomNav />
    </div>
  );
}
