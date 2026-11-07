"use client";

import { useEffect, useRef, useState } from "react";

/* Decides whether a WebGL shader may run, and pauses it when off-screen or hidden. */
export function useLiveShader() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(true);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    let mo: MutationObserver | undefined;
    let io: IntersectionObserver | undefined;
    let sync: (() => void) | undefined;

    const timer = window.setTimeout(() => {
      const root = document.documentElement;
      const readTheme = () => setDark(root.classList.contains("dark"));
      readTheme();
      mo = new MutationObserver(readTheme);
      mo.observe(root, { attributes: true, attributeFilter: ["class"] });

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const lowEnd = (navigator.hardwareConcurrency ?? 8) <= 2;
      let webgl = false;
      try {
        const c = document.createElement("canvas");
        const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
        webgl = Boolean(gl);
        gl?.getExtension("WEBGL_lose_context")?.loseContext();
      } catch { webgl = false; }
      if (reduce || lowEnd || !webgl) return;

      setEnabled(true);
      let inView = true;
      sync = () => setActive(inView && !document.hidden);
      io = new IntersectionObserver((entries) => { inView = entries[0]?.isIntersecting ?? true; sync?.(); }, { rootMargin: "120px" });
      if (ref.current) io.observe(ref.current);
      document.addEventListener("visibilitychange", sync);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      mo?.disconnect();
      io?.disconnect();
      if (sync) document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return { ref, enabled, active, dark };
}