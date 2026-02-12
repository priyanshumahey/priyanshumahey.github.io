import Link from "next/link";

const navLinks = [
  { href: "/work", label: "Work" },
  { href: "/blog", label: "Writing" },
  // { href: "/fun", label: "Fun" },,
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <div className="space-y-3">
      <Link
        href="/"
        className="text-2xl leading-[1.1] font-medium tracking-tight text-neutral-900 dark:text-[#fafafa] hover:text-neutral-500 dark:hover:text-[#a1a1a1] transition-colors"
      >
        Priyanshu Mahey.
      </Link>
      <nav className="flex flex-row gap-4">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-sm text-neutral-500 dark:text-[#a1a1a1] hover:text-neutral-900 dark:hover:text-[#fafafa] transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
