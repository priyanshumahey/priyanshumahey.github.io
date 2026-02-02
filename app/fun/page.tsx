"use client";

import { BookDescription, BookTitle, ModernBookCover } from "@/components/book";
import { ThemeToggle } from "@/components/theme-toggle";
import { FileText, Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

const socialLinks = [
  { href: "https://www.linkedin.com/in/priyanshu-mahey/", label: "LinkedIn", icon: "linkedin" },
  { href: "https://x.com/PriyanshuMahey", label: "X", icon: "x" },
  { href: "https://github.com/priyanshumahey", label: "GitHub", icon: "github" },
  { href: "mailto:priyanshu.mahey02@gmail.com", label: "Email", icon: "email" },
]

const navLinks = [
  { href: "/blog", label: "Writing" },
  { href: "/fun", label: "Fun" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
]

const Icons = {
  linkedin: () => <Linkedin className="w-5 h-5" />,
  x: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  github: () => <Github className="w-5 h-5" />,
  email: () => <Mail className="w-5 h-5" />,
}

export default function FunPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-[#fafafa]">
      {/* Theme Toggle */}
      <ThemeToggle />
      
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <header className="space-y-6 px-6 pt-8">
          <div>
            <Link href="/" className="text-2xl leading-[1.1] font-medium tracking-tight text-neutral-900 dark:text-[#fafafa] hover:text-neutral-500 dark:hover:text-[#a1a1a1] transition-colors">
              Priyanshu Mahey.
            </Link>
            <nav className="flex flex-row gap-4 pt-3">
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
        </header>

        <main className="px-6 pb-16">
          <section className="py-12 border-b border-neutral-200 dark:border-[#1a1a1a]">
            <h1 className="text-3xl font-medium tracking-tight mb-3">Fun</h1>
            <p className="text-base text-neutral-500 dark:text-[#a1a1a1] leading-relaxed">
              Things I enjoy outside of work.
            </p>
          </section>

          {/* Currently Reading */}
          <section className="py-8 border-b border-neutral-200 dark:border-[#1a1a1a]">
            <h2 className="text-sm font-medium text-neutral-400 dark:text-[#525252] uppercase tracking-wider mb-6">Currently Reading</h2>
            <div className="flex justify-center">
              <ModernBookCover size="md" color="amber">
                <BookTitle>Northanger Abbey</BookTitle>
                <BookDescription>
                  Jane Austen
                </BookDescription>
              </ModernBookCover>
            </div>
          </section>
          {/* Social Links */}
          <footer className="flex items-center gap-3 pt-8 pb-6">
            {socialLinks.map((link) => {
              const IconComponent = Icons[link.icon as keyof typeof Icons]
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="w-10 h-10 rounded-full border border-neutral-300 dark:border-[#333] flex items-center justify-center text-neutral-500 dark:text-[#888] hover:text-neutral-900 dark:hover:text-white hover:border-neutral-500 dark:hover:border-[#555] transition-all"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                >
                  <IconComponent />
                </Link>
              )
            })}
          </footer>
        </main>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-4xl mx-auto px-8 py-16">
          {/* Header */}
          <header className="flex items-center justify-between mb-16">
            <Link href="/" className="text-lg font-medium text-neutral-900 dark:text-[#fafafa] hover:text-neutral-500 dark:hover:text-[#a1a1a1] transition-colors">
              ← Back
            </Link>
            <nav className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors ${link.href === "/fun"
                    ? "text-neutral-900 dark:text-[#fafafa]"
                    : "text-neutral-500 dark:text-[#737373] hover:text-neutral-900 dark:hover:text-[#fafafa]"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </header>

          {/* Title Section */}
          <section className="mb-16">
            <h1 className="text-[2.5rem] font-bold leading-tight tracking-tight mb-4">Fun</h1>
            <p className="text-xl text-neutral-500 dark:text-[#a1a1a1] leading-relaxed max-w-2xl">
              Things I enjoy outside of work.
            </p>
          </section>

          {/* Currently Reading */}
          <section className="mb-16">
            <h2 className="text-sm font-medium text-neutral-400 dark:text-[#525252] uppercase tracking-wider mb-8">Currently Reading</h2>
            <div className="flex justify-center py-8">
              <ModernBookCover size="md" color="amber">
                <BookTitle>Northanger Abbey</BookTitle>
                <BookDescription>
                  Jane Austen
                </BookDescription>
              </ModernBookCover>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-neutral-100 dark:bg-[#050505] border-t border-neutral-200 dark:border-[#1a1a1a] py-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <p className="text-sm text-neutral-400 dark:text-[#525252]">
              © {new Date().getFullYear()} Priyanshu Mahey
            </p>
            <div className="flex items-center gap-6">
              {socialLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-neutral-500 dark:text-[#737373] hover:text-neutral-900 dark:hover:text-[#fafafa] transition-colors uppercase tracking-wider"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
