type ButtonProps = {
  children: React.ReactNode;
};

export default function Button({ children }: ButtonProps) {
  return (
    <button className="px-8 py-3 rounded-full bg-white text-black font-semibold hover:scale-105 transition">
      {children}
    </button>
  );
}