import { RequireAuth } from "@/lib/auth-context";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopNav } from "@/components/top-nav";
import { PageTransition } from "@/components/page-transition";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopNav />
          <div className="flex-1 overflow-y-auto p-6">
            <PageTransition>{children}</PageTransition>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RequireAuth>
  );
}
