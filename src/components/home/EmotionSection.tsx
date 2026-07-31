const emotions = [
  "Happy",
  "Lost",
  "Inspired",
  "Calm",
  "Curious"
];

export default function EmotionSection() {
  return (
    <section id="emotions" className="scroll-mt-24 bg-black px-6 py-24 text-white">

      <h2 className="text-center text-4xl font-bold">
        How are you feeling today?
      </h2>

      <div className="mt-10 flex flex-wrap justify-center gap-4">

        {emotions.map((emotion) => (
          <button
            key={emotion}
            className="rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur hover:bg-white/10 transition"
          >
            {emotion}
          </button>
        ))}

      </div>

    </section>
  );
}