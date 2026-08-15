import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "@/lib/auth-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto flex flex-col">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
