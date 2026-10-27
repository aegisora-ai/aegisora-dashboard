/* eslint-disable @next/next/no-img-element */
import "./bw-brand.css";

export function BwBrand({ className = "" }: { className?: string }) {
  return (
    <span className={"bw-brand" + (className ? " " + className : "")}>
      <img className="bw-brand__mark" src="/logo-mark.png" width={40} height={28} alt="" aria-hidden="true" decoding="async" />
      <span className="bw-brand__txt">Aegisora</span>
    </span>
  );
}