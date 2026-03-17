import { BottomNav } from "@/components/layout/bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="max-w-lg mx-auto pb-20 min-h-screen">{children}</main>
      <BottomNav />
    </div>
  );
}
