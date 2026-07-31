type GradientTextProps = {
  children: React.ReactNode;
  className?: string;
};

export default function GradientText({ children, className = "" }: GradientTextProps) {
  return <span className={`text-gradient ${className}`}>{children}</span>;
}
