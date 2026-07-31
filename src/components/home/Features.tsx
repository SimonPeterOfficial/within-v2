const features = [
  {
    title: "Stories",
    description: "Explore stories that connect with your emotions."
  },
  {
    title: "Originals",
    description: "Discover unique films, books, and creations."
  },
  {
    title: "Connection",
    description: "Find people and communities where you belong."
  }
];

export default function Features() {
  return (
    <section id="community" className="scroll-mt-24 bg-black px-6 py-24 text-white">

      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">

        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
          >
            <h3 className="text-2xl font-bold">
              {feature.title}
            </h3>

            <p className="mt-4 text-gray-400">
              {feature.description}
            </p>
          </div>
        ))}

      </div>

    </section>
  );
}