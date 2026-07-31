type LogoProps = {
  size?: "sm" | "lg";
};

export default function Logo({ size = "lg" }: LogoProps) {
  if (size === "sm") {
    return (
      <span className="text-xl font-extrabold tracking-tight text-white">
        WithIn
      </span>
    );
  }

  return (
    <div className="text-center">
      <h1 className="text-7xl font-extrabold tracking-tight">
        WithIn
      </h1>

      <p className="mt-2 text-sm tracking-[0.4em] uppercase text-emerald-400">
        A WithIn Original
      </p>
    </div>
  );
}