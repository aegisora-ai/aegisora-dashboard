/* eslint-disable @next/next/no-img-element */

/** Single source of truth for the logo (mark image plus wordmark text). */
export function AegxBrand({ height = 22 }: { height?: number }) {
  const width = Math.round((height * 369) / 256);
  return (
    <span className="aegx-logo">
      <img data-logo="" src="/logo-mark.png" alt="" aria-hidden="true" width={width} height={height} style={{ width, height }} />
      <span className="aegx-logo__text">Aegisora</span>
    </span>
  );
}