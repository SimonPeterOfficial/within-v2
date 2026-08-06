import { clsx } from "clsx";
import { typography } from "@/lib/design";

type TextVariant = keyof typeof typography;
type TextTag = "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "small" | "label";

type TextProps = {
  children: React.ReactNode;
  /** Style recipe — every style comes from the typography system */
  variant?: TextVariant;
  /** Semantic tag — defaults to <p> */
  as?: TextTag;
  className?: string;
};

const tags: Record<TextTag, string> = {
  p: "p",
  span: "span",
  div: "div",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  small: "small",
  label: "label"
};

/**
 * The typography primitive — semantic tag + design-system recipe in one.
 * Use this instead of hand-rolled text classes so every caption, eyebrow,
 * and heading speaks the same visual language.
 */
export default function Text({ children, variant = "body", as = "p", className = "" }: TextProps) {
  return React.createElement(tags[as], { className: clsx(typography[variant], className) }, children);
}
