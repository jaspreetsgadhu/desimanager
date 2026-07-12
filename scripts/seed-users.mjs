// One-time seed script: creates the demo employees as real Supabase auth users,
// pre-confirmed, using the admin API (service role key — server-side only).
// Each user creation triggers the `handle_new_user` DB trigger, which auto-creates
// a matching `profiles` row assigned to the single seeded demo organization.
//
// Prerequisite: run supabase/migrations/001_schema.sql and 002_seed_org.sql first.
//
// Usage: node scripts/seed-users.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
const env = Object.fromEntries(
  envFile
    .split("\n")
    .filter((line) => line.includes("="))
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return [key.trim(), rest.join("=").trim()];
    })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_PASSWORD = "DemoPass123!";

const EMPLOYEES = [
  { name: "Aarav Shah", email: "aarav@desimanager.ai", department: "Executive", designation: "Product Manager", reporting_manager: null, role: "super_admin", status: "active" },
  { name: "Priya Nair", email: "priya@desimanager.ai", department: "Operations", designation: "Operations Lead", reporting_manager: "Aarav Shah", role: "admin", status: "active" },
  { name: "Rohan Mehta", email: "rohan@desimanager.ai", department: "Sales", designation: "Sales Executive", reporting_manager: "Priya Nair", role: "manager", status: "active" },
  { name: "Simran Kaur", email: "simran@desimanager.ai", department: "Customer Support", designation: "Customer Support Associate", reporting_manager: "Priya Nair", role: "employee", status: "active" },
  { name: "Neha Kapoor", email: "neha@desimanager.ai", department: "HR", designation: "HR Manager", reporting_manager: "Aarav Shah", role: "manager", status: "active" },
  { name: "Vikram Singh", email: "vikram@desimanager.ai", department: "Products", designation: "Product Manager", reporting_manager: "Aarav Shah", role: "manager", status: "active" },
  { name: "Ananya Verma", email: "ananya@desimanager.ai", department: "Sales", designation: "Sales Executive", reporting_manager: "Rohan Mehta", role: "employee", status: "invited" },
  { name: "Karan Malhotra", email: "karan@desimanager.ai", department: "Customer Support", designation: "Customer Support Associate", reporting_manager: "Simran Kaur", role: "employee", status: "inactive" },
];

for (const employee of EMPLOYEES) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: employee.email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: {
      name: employee.name,
      department: employee.department,
      designation: employee.designation,
      reporting_manager: employee.reporting_manager,
      role: employee.role,
      status: employee.status,
    },
  });

  if (error) {
    console.error(`✗ ${employee.email}: ${error.message}`);
  } else {
    console.log(`✓ ${employee.email} (${data.user?.id ?? "no id returned"})`);
  }
}

console.log("\nDone. All demo accounts share the password:", DEMO_PASSWORD);
