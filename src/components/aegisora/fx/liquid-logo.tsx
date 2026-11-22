"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ComponentType } from "react";
import { webglOk } from "./capability";

type AnyProps = Record<string, unknown>;
const Metal = dynamic(
  () => import("@paper-design/shaders-react").then((m) => m.LiquidMetal as unknown as ComponentType<AnyProps>),
  { ssr: false },
);

export function LiquidLogo({ size = 48, src = "/aegisora-mark.svg", className = "" }: { size?: number; src?: string; className?: string }) {
  const [live, setLive] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setLive(webglOk()), 400);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <span className={className} style={{ position: "relative", display: "inline-block", width: size, height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={size} height={size} style={{ position: "absolute", inset: 0, opacity: live ? 0 : 1, transition: "opacity .6s ease" }} />
      {live ? (
        <span style={{ position: "absolute", inset: 0 }}>
          <Metal
            width={size}
            height={size}
            image={src}
            colorBack="#00000000"
            colorTint="#2f7cff"
            repetition={4}
            softness={0.5}
            shiftRed={0.3}
            shiftBlue={0.3}
            distortion={0.1}
            contour={0.5}
            angle={70}
            speed={0.6}
            scale={0.8}
            fit="contain"
          />
        </span>
      ) : null}
    </span>
  );
}