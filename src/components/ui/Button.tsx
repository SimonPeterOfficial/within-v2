import { clsx } from "clsx";
import Link from "next/link";
import { gradients } from "@/lib/design";

type ButtonVariant = "primary" | "gradient" | "outline" | "ghost" | "light";
type ButtonSize = "sm" | "md" | "lg" | "xl";

type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Renders an anchor — internal routes get a next/link for fast navigation */
  href?: string;
  target?: string;
  rel?: string;
  type?: "button" | "submit";
  className?: string;
  onClick?: (event?: React.MouseEvent) => void;
  ariaLabel?: string;
  disabled?: boolean;
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-5 py-2 text-xs",
  md: "px-7 py-3 text-sm",
  lg: "px-8 py-3.5 text-sm",
  xl: "px-9 py-4 text-sm"
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "btn-tactile bg-[rgba(var(--mood-rgb),1)] text-black font-bold hover:shadow-[0_0_32px_rgba(var(--mood-rgb),0.35)] focus-visible:ring-2 focus-visible:ring-[rgba(var(--mood-rgb),0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-black",
  gradient:
    "btn-tactile text-black font-bold hover:shadow-[0_0_36px_rgba(168,85,247,0.3)] focus-visible:ring-2 focus-visible:ring-[rgba(var(--mood-rgb),0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-black",
  outline:
    "btn-tactile border border-white/[0.12] bg-white/[0.03] text-white font-semibold backdrop-blur-sm hover:border-white/[0.2] hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
  ghost: "text-gray-400 font-semibold hover:text-white hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
  light: "btn-tactile bg-white text-black font-semibold hover:shadow-[0_4px_20px_rgba(255,255,255,0.12)] focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
};

/**
 * One button language for the whole universe.
 * `primary` glows with the live mood, `gradient` is the brand sweep,
 * `outline`/`ghost` stay quiet and elegant, and `light` is the bright pill.
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  target,
  rel,
  type = "button",
  className = "",
  onClick,
  ariaLabel,
  disabled = false
}: ButtonProps) {
  const isGradient = variant === "gradient";
  const classes = clsx(
    "inline-flex select-none items-center justify-center rounded-full transition-all duration-200 ease-out active:scale-[0.97] hover:scale-[1.015]",
    sizes[size],
    variants[variant],
    disabled && "pointer-events-none opacity-50",
    className
  );
  const style = isGradient ? { backgroundImage: gradients.brand } : undefined;

  if (href) {
    // A disabled link must not be focusable or navigable, so it becomes a span.
    if (disabled) {
      return (
        <span className={classes} style={style} aria-disabled="true">
          {children}
        </span>
      );
    }

    const shared = {
      "aria-label": ariaLabel,
      onClick,
      className: classes,
      style,
      target,
      rel
    } as const;

    return href.startsWith("/") ? (
      <Link href={href} {...shared}>
        {children}
      </Link>
    ) : (
      <a href={href} {...shared}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      disabled={disabled}
      className={classes}
      style={style}
    >
      {children}
    </button>
  );
}
