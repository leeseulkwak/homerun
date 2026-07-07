import TopNav from "@/components/nav/TopNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col bg-zinc-50">
      <div className="sticky top-0 z-10 bg-white">
        <header className="border-b border-zinc-200 px-4 py-3">
          <h1 className="text-lg font-bold text-emerald-700">🏃 홈런</h1>
        </header>
        <TopNav />
      </div>
      <main className="flex-1 overflow-y-auto pb-4">{children}</main>
    </div>
  );
}
