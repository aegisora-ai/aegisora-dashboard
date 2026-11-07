"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { webglOk } from "./capability";

const Scene = dynamic(() => import("./gradient-scene"), { ssr: false });

export function GradientBackdrop() {
  const [on, setOn] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setOn(webglOk()), 600);
    const vis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", vis);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  return (
    <div aria-hidden="true" className="aeg-backdrop">
      <div className="aeg-backdrop__base" />
      {on && visible ? <Scene /> : null}
      <div className="aeg-backdrop__veil" />
    </div>
  );
}