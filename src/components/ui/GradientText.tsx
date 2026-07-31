import { colors } from "@/lib/design";

type GradientTextProps = {
  children: React.ReactNode;
  className?: string;
  /** Direction of the gradient sweep */
  direction?: "ltr" | "rtl";
  /** Optional custom from/to colors (defaults to the brand palette) */
  from?: string;
  to?: string;
};

/**
 * Signature gradient text — purple to emerald by default.
 * The single gradient used across the whole universe, sourced from the
 * brand color tokens so the palette can never drift.
 */
export default function GradientText({
  children,
  className = "",
  direction = "ltr",
  from = colors.purple,
  to = colors.emerald
}: GradientTextProps) {
  const gradient = `linear-gradient(${direction === "ltr" ? "90deg" : "270deg"}, ${from} 0%, ${to} 100%)`;
  return (
    <span
      className={`bg-clip-text text-transparent ${className}`}
      style={{ backgroundImage: gradient }}
    >
      {children}
    </span>
  );
}
