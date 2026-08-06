import { clsx } from "clsx";

type ContainerSize = "sm" | "md" | "lg" | "xl";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  /** Content width tier — lg is the default WithIn measure */
  size?: ContainerSize;
};

const sizes: Record<ContainerSize, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl"
};

/**
 * The single horizontal measure of the universe — every section aligns to the
 * same centered, responsive container so spacing never drifts between pages.
 */
export default function Container({ children, className = "", size = "lg" }: ContainerProps) {
  return <div className={clsx("mx-auto w-full px-6 sm:px-8", sizes[size], className)}>{children}</div>;
}
