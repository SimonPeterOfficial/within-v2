import Link from "next/link";
import Logo from "@/components/ui/Logo";

const links = [
  { label: "Home", href: "/home" },
  { label: "Sanctuary", href: "#sanctuary" },
  { label: "Mood", href: "#mood" },
  { label: "Memories", href: "#memories" }
];

export default function DashboardNav() {
  return (
    <nav className="fixed top-0 z-50 w-full px-4 py-6 sm:px-8">
      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-xl sm:px-6">
        <Link href="/home" className="shrink-0">
          <Logo size="sm" />
        </Link>

        <div className="hidden items-center gap-8 text-sm text-gray-300 md:flex">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
        >
          Exit
        </Link>
      </div>
    </nav>
  );
}
