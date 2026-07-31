import Logo from "@/components/ui/Logo";

const navLinks = [
  { label: "Stories", href: "#stories" },
  { label: "Originals", href: "#originals" },
  { label: "Community", href: "#community" }
];

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full px-8 py-6">

      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl">

        <a href="#top" className="shrink-0">
          <Logo size="sm" />
        </a>

        <div className="hidden gap-8 text-sm text-gray-300 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <a
          href="#join"
          className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:scale-105"
        >
          Enter
        </a>

      </div>

    </nav>
  );
}