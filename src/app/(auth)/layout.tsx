export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center bg-zinc-50 px-6">
      {children}
    </div>
  );
}
