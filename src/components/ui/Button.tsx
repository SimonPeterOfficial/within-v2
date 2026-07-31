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
  onClick?: () => void;
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
    "bg-[rgba(var(--mood-rgb),1)] text-black font-bold hover:scale-[1.03] hover:shadow-mood-lg",
  gradient:
    "text-black font-bold hover:scale-[1.03] hover:shadow-brand-cta",
  outline:
    "border border-white/15 bg-white/5 text-white font-bold backdrop-blur hover:border-white/30 hover:bg-white/10",
  ghost: "text-gray-300 font-semibold hover:text-white hover:bg-white/5",
  light: "bg-white text-black font-semibold hover:scale-[1.03]"
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
    "inline-flex select-none items-center justify-center rounded-full transition duration-300",
    sizes[size],
    variants[variant],
    disabled && "pointer-events-none opacity-60",
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
