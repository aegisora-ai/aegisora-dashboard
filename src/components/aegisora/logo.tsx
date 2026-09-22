import Image from "next/image"
import Link from "next/link"

export type AegisoraLogoProps = {
  compact?: boolean
  href?: string
  size?: number
  className?: string
  showWordmark?: boolean
}

export function AegisoraLogo({
  compact = false,
  href = "/",
  size = 30,
  className = "",
  showWordmark = true,
}: AegisoraLogoProps) {

  const logoClassName = [
    compact
      ? "ae-logo ae-logo-compact"
      : "ae-logo",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  const content = (
    <span
      className={logoClassName}
      aria-label="Aegisora"
    >

      <span
        className="ae-logo-image-wrap"
        style={{
          width: size,
          height: size,
        }}
      >

        <Image
          src="/LOGO.png"
          alt="Aegisora"
          width={size}
          height={size}
          className="ae-logo-image"
          priority
        />

      </span>

      {!compact && showWordmark ? (
        <span>

          <span className="ae-logo-wordmark">
            AEGISORA
          </span>

          <span className="ae-logo-subtitle">
            RUNTIME SECURITY
          </span>

        </span>
      ) : null}

    </span>
  )

  return (
    <Link
      href={href}
      aria-label="Aegisora home"
    >
      {content}
    </Link>
  )
}

export function Logo(
  props: AegisoraLogoProps = {},
) {
  return (
    <AegisoraLogo
      {...props}
    />
  )
}