import { ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">

      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-blue-900/40" />

      <section className="relative flex min-h-screen items-center justify-center px-6">

        <div className="max-w-5xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-xl">
            <Sparkles size={18}/>
            <span>
              The future starts here
            </span>
          </div>


          <h1 className="mt-8 text-6xl md:text-8xl font-bold tracking-tight">

            Build.
            <span className="text-purple-400">
              Create.
            </span>
            Grow.

          </h1>


          <p className="mx-auto mt-8 max-w-2xl text-xl text-gray-400">

            FreeBuff gives creators and communities the tools
            to build something bigger than themselves.

          </p>


          <button className="
          mt-10
          group
          flex
          mx-auto
          items-center
          gap-3
          rounded-full
          bg-white
          px-8
          py-4
          font-semibold
          text-black
          transition
          hover:scale-105
          ">

            Enter FreeBuff

            <ArrowRight
            className="group-hover:translate-x-1 transition"
            />

          </button>


        </div>

      </section>

    </main>
  );
}