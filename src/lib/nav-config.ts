import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Bot,
  BookOpen,
  Users,
  Briefcase,
  Headset,
  BarChart3,
  Settings,
  Building2,
} from "lucide-react";
import type { Role } from "@/types/user";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  roles?: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "AI Workspace", href: "/ai-workspace", icon: Bot },
  { title: "Knowledge Base", href: "/knowledge-base", icon: BookOpen },
  { title: "Employees", href: "/employees", icon: Users, roles: ["super_admin", "admin", "manager"] },
  { title: "Organization", href: "/organization", icon: Building2, roles: ["super_admin", "admin"] },
  { title: "HR", href: "/hr", icon: Briefcase },
  { title: "Customer Care", href: "/customer-care", icon: Headset },
  { title: "Reports", href: "/reports", icon: BarChart3, roles: ["super_admin", "admin", "manager"] },
  { title: "Settings", href: "/settings", icon: Settings },
];
