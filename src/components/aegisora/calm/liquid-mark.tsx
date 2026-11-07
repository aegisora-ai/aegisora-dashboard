"use client";

import dynamic from "next/dynamic";
import "@/styles/aeg-liquid.css";
import { useLiveShader } from "./use-live-shader";

const LiquidMetal = dynamic(() => import("@paper-design/shaders-react").then((m) => m.LiquidMetal), { ssr: false });

export function LiquidMark() {
  const { ref, enabled, active, dark } = useLiveShader();
  return (
    <div ref={ref} aria-hidden="true" className={"vc-mark" + (enabled ? " vc-mark--on" : "")}>
      <span className="vc-mark__fallback" />
      {enabled ? (
        <div className="vc-mark__gl">
          <LiquidMetal
            image="/aegisora-shield.svg"
            width={112}
            height={112}
            colorBack={dark ? "#2a3550" : "#aab4c8"}
            colorTint={dark ? "#8db8ff" : "#ffffff"}
            repetition={2}
            softness={0.1}
            shiftRed={0.3}
            shiftBlue={0.3}
            distortion={0.07}
            contour={0.4}
            angle={70}
            speed={active ? 0.6 : 0}
            scale={0.9}
            fit="contain"
            minPixelRatio={1}
            maxPixelCount={200000}
          />
        </div>
      ) : null}
    </div>
  );
}