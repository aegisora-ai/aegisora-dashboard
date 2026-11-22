"use client";

import dynamic from "next/dynamic";
import "@/styles/aeg-liquid.css";
import { useLiveShader } from "./use-live-shader";

const MeshGradient = dynamic(() => import("@paper-design/shaders-react").then((m) => m.MeshGradient), { ssr: false });

const LIGHT = ["#eaf1ff", "#c4dbff", "#d3ecff", "#e0dcff"];
const DARK = ["#050b1c", "#0f2f8f", "#0a5fae", "#2b2080"];

export function LiquidBackdrop() {
  const { ref, enabled, active, dark } = useLiveShader();
  return (
    <div ref={ref} aria-hidden="true" className={"vc-shader" + (enabled ? " vc-shader--on" : "")}>
      {enabled ? (
        <MeshGradient
          colors={dark ? DARK : LIGHT}
          distortion={0.85}
          swirl={0.2}
          speed={active ? 0.25 : 0}
          minPixelRatio={1}
          maxPixelCount={800000}
          style={{ width: "100%", height: "100%" }}
        />
      ) : null}
    </div>
  );
}