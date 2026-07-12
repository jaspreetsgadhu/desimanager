export type Role = "super_admin" | "admin" | "manager" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  avatarUrl?: string;
}

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  employee: "Employee",
};
