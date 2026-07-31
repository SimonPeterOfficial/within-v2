import Logo from "@/components/ui/Logo";

export default function Navbar() {
  return (
    <nav className="absolute top-0 left-0 w-full px-8 py-6 flex justify-between items-center z-20">

      <Logo />

      <div className="flex gap-6 text-gray-300">
        <button>Stories</button>
        <button>Originals</button>
        <button>About</button>
      </div>

    </nav>
  );
}