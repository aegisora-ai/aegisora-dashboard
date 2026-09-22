"use client";

import Link from "next/link";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspace } from "@/components/aegisora/workspace-provider";
import { focusRing } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function AccountSwitcher() {
  const { loading, workspaces, currentWorkspace, setCurrentWorkspaceId } = useWorkspace();

  if (loading) {
    return <span className="hidden font-mono text-xs text-muted-foreground sm:inline">workspace / loading...</span>;
  }

  if (!currentWorkspace) {
    return (
      <Link href="/onboarding" className="hidden font-mono text-xs text-cyan underline-offset-4 hover:underline sm:inline">
        workspace / create one
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "hidden items-center gap-1.5 rounded-sm px-2 py-1 font-mono text-xs text-muted-foreground hover:bg-surface-3 hover:text-foreground sm:flex",
            focusRing,
          )}
        >
          workspace / <span className="text-foreground">{currentWorkspace.slug}</span>
          <ChevronsUpDown className="size-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="font-mono text-[10px] tracking-wider text-muted-foreground">
          WORKSPACES
        </DropdownMenuLabel>
        {workspaces.map((w) => (
          <DropdownMenuItem key={w.id} onClick={() => setCurrentWorkspaceId(w.id)} className="flex items-center justify-between gap-2">
            <span>
              <span className="block text-sm">{w.name}</span>
              <span className="block font-mono text-[10px] text-muted-foreground">{w.role}</span>
            </span>
            {w.id === currentWorkspace.id && <Check className="size-4 text-cyan" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/onboarding" className="flex items-center gap-2">
            <Plus className="size-4" /> Create workspace
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}