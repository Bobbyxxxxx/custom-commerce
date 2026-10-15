"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { ProfileParams } from "@/shared.types";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: ProfileParams | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Kept with the id it belongs to, so a stale profile is never shown for another user
  const [loadedProfile, setLoadedProfile] = useState<{
    userId: string;
    data: ProfileParams | null;
  } | null>(null);

  const user = session?.user ?? null;
  const userId = user?.id;

  useEffect(() => {
    // Fires once with the stored session on subscribe, then on every sign in, sign out and token refresh.
    // Don't await other Supabase calls in here, it can deadlock the client.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!userId) return;

    let ignore = false;

    supabase
      .from("eldics_users")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (ignore) return;
        if (error) console.error("Error fetching profile:", error);
        setLoadedProfile({ userId, data: (data as ProfileParams) ?? null });
      });

    return () => {
      ignore = true;
    };
  }, [supabase, userId]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error);
    // Re-render server components now that the session cookie is gone
    router.refresh();
  }, [supabase, router]);

  const profile =
    loadedProfile && loadedProfile.userId === userId
      ? loadedProfile.data
      : null;

  const value = useMemo(
    () => ({ user, session, profile, isLoading, signOut }),
    [user, session, profile, isLoading, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
