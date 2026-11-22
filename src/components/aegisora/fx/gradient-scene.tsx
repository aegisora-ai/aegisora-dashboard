"use client";

import type { ComponentType, CSSProperties } from "react";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

type AnyProps = Record<string, unknown>;
const Canvas = ShaderGradientCanvas as unknown as ComponentType<AnyProps>;
const Gradient = ShaderGradient as unknown as ComponentType<AnyProps>;
const style: CSSProperties = { position: "absolute", inset: 0, pointerEvents: "none" };

export default function GradientScene() {
  return (
    <Canvas style={style} pixelDensity={1} fov={45}>
      <Gradient
        type="waterPlane"
        animate="on"
        uSpeed={0.12}
        uStrength={1.4}
        uDensity={1.1}
        color1="#0a3cff"
        color2="#1463ff"
        color3="#020b24"
        grain="off"
        lightType="3d"
        envPreset="city"
        brightness={1}
        reflection={0.1}
        cAzimuthAngle={180}
        cPolarAngle={90}
        cDistance={2.8}
        cameraZoom={9.1}
      />
    </Canvas>
  );
}