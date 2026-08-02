import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Providers } from "@/components/providers";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none gradient-hero opacity-40" />
          <Header />
          <main className="flex-1 overflow-y-auto p-6 relative z-10">{children}</main>
        </div>
      </div>
    </Providers>
  );
}
