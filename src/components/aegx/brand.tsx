/** Single source of truth for the logo: blue mark (masked from logo-mark.png) plus blue wordmark. */
export function AegxBrand({ height = 22 }: { height?: number }) {
  const width = Math.round((height * 369) / 256);
  return (
    <span className="aegx-logo">
      <span className="aegx-logo__mark" data-logo="" role="img" aria-label="Aegisora" style={{ width, height }} />
      <span className="aegx-logo__text">Aegisora</span>
    </span>
  );
}