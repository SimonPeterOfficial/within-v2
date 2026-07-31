const features = [
  {
    title: "Stories",
    text: "Discover worlds, emotions, and experiences."
  },
  {
    title: "Originals",
    text: "Watch and create unique content."
  },
  {
    title: "Connection",
    text: "Find a place where you belong."
  }
];

export default function Features() {
  return (
    <section className="bg-black text-white px-6 py-20 grid md:grid-cols-3 gap-6">

      {features.map((feature) => (
        <div
          key={feature.title}
          className="rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur"
        >
          <h3 className="text-2xl font-bold">
            {feature.title}
          </h3>

          <p className="mt-3 text-gray-400">
            {feature.text}
          </p>
        </div>
      ))}

    </section>
  );
}