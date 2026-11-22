"use client";
import { useSyncExternalStore, type ReactNode } from "react";

const subscribe = () => () => {};

export function NoSsr({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return mounted ? <>{children}</> : null;
}
