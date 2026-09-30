"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type WorkspaceSummary = { id: string; name: string; slug: string; role: string };

type WorkspaceContextValue = {
  loading: boolean;
  userEmail: string | null;
  userName: string | null;
  workspaces: WorkspaceSummary[];
  currentWorkspace: WorkspaceSummary | null;
  setCurrentWorkspaceId: (id: string) => void;
  refresh: () => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export const WORKSPACE_STORAGE_KEY = "aeg-current-workspace";

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    setUserEmail(user?.email ?? null);
    setUserName((user?.user_metadata?.full_name as string) ?? null);

    if (!user) {
      setWorkspaces([]);
      setLoading(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.access_token) {
      await fetch("/api/v1/workspace/members/accept", {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
        cache: "no-store",
      }).catch(() => undefined);
    }

    const { data, error } = await supabase
      .from("workspace_members")
      .select("role, workspaces(id, name, slug)")
      .eq("user_id", user.id)
      .eq("status", "active");

    if (error || !data) {
      setWorkspaces([]);
      setLoading(false);
      return;
    }

    const list: WorkspaceSummary[] = data
  // Legacy boundary typing retained temporarily; runtime validation occurs at the Supabase boundary.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((m: any) => m.workspaces)
  // Legacy boundary typing retained temporarily; runtime validation occurs at the Supabase boundary.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((m: any) => ({
        id: m.workspaces.id,
        name: m.workspaces.name,
        slug: m.workspaces.slug,
        role: m.role,
      }));

    setWorkspaces(list);

    const stored = typeof window !== "undefined" ? window.localStorage.getItem(WORKSPACE_STORAGE_KEY) : null;
    const valid = list.find((w) => w.id === stored);
    setCurrentId(valid ? valid.id : (list[0]?.id ?? null));

    setLoading(false);
  }, []);

    useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  function setCurrentWorkspaceId(id: string) {
    setCurrentId(id);
    if (typeof window !== "undefined") window.localStorage.setItem(WORKSPACE_STORAGE_KEY, id);
  }

  const currentWorkspace = workspaces.find((w) => w.id === currentId) ?? null;

  return (
    <WorkspaceContext.Provider
      value={{ loading, userEmail, userName, workspaces, currentWorkspace, setCurrentWorkspaceId, refresh: load }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}





