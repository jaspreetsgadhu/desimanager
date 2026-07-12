"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types/user";
import { createClient } from "@/lib/supabase/client";

// All seeded demo accounts share this password (see scripts/seed-users.mjs).
// This is a prototype with known, disposable demo credentials — not a real secret.
const DEMO_PASSWORD = "DemoPass123!";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchUser: (email: string) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(supabase: ReturnType<typeof createClient>, userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, email, role, department")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    role: data.role,
    department: data.department ?? "",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      if (session?.user) {
        const profile = await fetchProfile(supabase, session.user.id);
        if (active) setUser(profile);
      }
      if (active) setIsLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(supabase, session.user.id);
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  const login = React.useCallback(
    async (email: string, password: string = DEMO_PASSWORD) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },
    [supabase]
  );

  const logout = React.useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  const switchUser = React.useCallback(
    async (email: string) => {
      await supabase.auth.signInWithPassword({ email, password: DEMO_PASSWORD });
    },
    [supabase]
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, switchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
