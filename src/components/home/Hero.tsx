import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="min-h-screen bg-black text-white flex items-center justify-center px-6 relative overflow-hidden">

      <div className="absolute w-96 h-96 bg-purple-700/30 rounded-full blur-3xl animate-glow" />

      <div className="relative z-10 text-center">

        <Logo />

        <h1 className="mt-8 text-6xl md:text-7xl font-bold">
          A universe within you.
        </h1>

        <p className="mt-5 text-gray-300 text-xl max-w-xl mx-auto">
          Stories, emotions, and people connecting in one place.
        </p>

        <div className="mt-8">
          <Button>
            Enter WithIn
          </Button>
        </div>

      </div>

    </section>
  );
}