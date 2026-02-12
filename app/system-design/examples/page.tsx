"use client";

import { examples } from "#site/content";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { href: "/blog", label: "Writing" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
];

export default function SystemDesignExamplesPage() {
  const publishedExamples = examples.filter((e) => e.published);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#080808] text-neutral-900 dark:text-[#fafafa]">
      <ThemeToggle />

      <div className="lg:hidden">
        <motion.header
          className="space-y-6 px-6 pt-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div>
            <Link
              href="/"
              className="text-2xl leading-[1.1] font-medium tracking-tight text-neutral-900 dark:text-[#fafafa] hover:text-neutral-500 dark:hover:text-[#a1a1a1] transition-colors"
            >
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
        </motion.header>

        <main className="px-6 pb-16">
          <motion.section
            className="py-12 border-b border-neutral-200 dark:border-[#1a1a1a]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold tracking-tight mb-3 font-mono uppercase">
              Examples & Case Studies.
            </h1>
            <p className="text-base text-neutral-500 dark:text-[#a1a1a1] leading-relaxed">
              Real-world architecture deep dives and practical walkthroughs.
            </p>
          </motion.section>

          <motion.div
            className="py-6 border-b border-neutral-200 dark:border-[#1a1a1a]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.5 }}
          >
            <Link
              href="/system-design"
              className="group flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  System Design Chapters
                </h2>
                <p className="text-sm text-neutral-500 dark:text-[#a1a1a1]">
                  Back to fundamentals and theory
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            </Link>
          </motion.div>

          <motion.div
            className="py-6 border-b border-neutral-200 dark:border-[#1a1a1a] grid grid-cols-2 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <StatBlock
              label="Examples"
              value={String(publishedExamples.length)}
            />
          </motion.div>

          <motion.section
            className="py-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="grid grid-cols-2 gap-3">
              {publishedExamples.map((example) => (
                <ExampleCard key={example.slug} example={example} />
              ))}
            </div>
          </motion.section>
        </main>
      </div>

      <div className="hidden lg:block">
        <div className="max-w-6xl mx-auto px-8 py-16">
          <motion.header
            className="flex items-center justify-between mb-20"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Link
              href="/system-design"
              className="text-lg font-medium text-neutral-900 dark:text-[#fafafa] hover:text-neutral-500 dark:hover:text-[#a1a1a1] transition-colors"
            >
              ← Back to Chapters
            </Link>
            <nav className="flex items-center gap-6">
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
          </motion.header>

          <motion.section
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h1 className="text-[2.75rem] font-bold leading-tight tracking-tight mb-4 font-mono uppercase">
              Examples & Case Studies.
            </h1>
            <p className="text-lg text-neutral-500 dark:text-[#a1a1a1] leading-relaxed max-w-2xl">
              Real-world architecture deep dives — practical walkthroughs of
              production systems like Twitter, Uber, and OneDrive.
            </p>
          </motion.section>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.5 }}
            className="mb-12"
          >
            <Link
              href="/system-design"
              className="group block p-8 border border-neutral-200 dark:border-[#1a1a1a] rounded-xl hover:border-neutral-300 dark:hover:border-[#333] transition-all bg-neutral-50/50 dark:bg-[#0f0f0f]/50"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    System Design Chapters
                  </h2>
                  <p className="text-neutral-500 dark:text-[#a1a1a1]">
                    Back to the fundamentals — theory, patterns, and principles.
                  </p>
                </div>
                <ArrowRight className="w-6 h-6 text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors -rotate-45 group-hover:rotate-0 transform duration-300" />
              </div>
            </Link>
          </motion.div>

          <motion.div
            className="grid grid-cols-4 gap-8 py-8 px-0 border-y border-neutral-200 dark:border-[#1a1a1a] mb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <StatBlock
              label="Examples"
              value={String(publishedExamples.length)}
            />
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="grid grid-cols-[320px_1fr] gap-12 items-start">
              <div className="sticky top-24">
                <div className="text-xs text-neutral-400 dark:text-[#525252] uppercase tracking-wider font-mono mb-3">
                  Case Studies
                </div>
                <p className="text-sm text-neutral-500 dark:text-[#a1a1a1] leading-relaxed">
                  Detailed walkthroughs of how popular systems are designed and
                  scaled in production.
                </p>
              </div>

              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                {publishedExamples.map((example, i) => (
                  <motion.div
                    key={example.slug}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.3 + i * 0.05,
                      duration: 0.4,
                    }}
                  >
                    <ExampleCard example={example} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        </div>
      </div>

      <motion.footer
        className="w-full bg-neutral-100 dark:bg-[#050505] border-t border-neutral-200 dark:border-[#1a1a1a] py-12 mt-24"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <p className="text-sm text-neutral-500 dark:text-[#525252]">
              © {new Date().getFullYear()} Priyanshu Mahey
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/system-design"
                className="text-xs text-neutral-600 dark:text-[#737373] hover:text-neutral-900 dark:hover:text-[#fafafa] transition-colors uppercase tracking-wider"
              >
                Chapters
              </Link>
              <Link
                href="/blog"
                className="text-xs text-neutral-600 dark:text-[#737373] hover:text-neutral-900 dark:hover:text-[#fafafa] transition-colors uppercase tracking-wider"
              >
                Writing
              </Link>
              <Link
                href="/"
                className="text-xs text-neutral-600 dark:text-[#737373] hover:text-neutral-900 dark:hover:text-[#fafafa] transition-colors uppercase tracking-wider"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-neutral-400 dark:text-[#525252] uppercase tracking-widest mb-1.5 font-mono">
        {label}
      </div>
      <div className="text-lg font-mono font-medium">{value}</div>
    </div>
  );
}

function ExampleCard({
  example,
}: {
  example: (typeof examples)[number];
}) {
  const PagePreview = () => (
    <div className="aspect-[4/5] w-full rounded border flex flex-col items-center justify-center p-4 gap-2 transition-colors bg-white dark:bg-[#0e0e0e] border-neutral-200 dark:border-[#222] group-hover:border-neutral-400 dark:group-hover:border-[#444]">
      <div className="h-[3px] w-3/5 rounded-full bg-neutral-300 dark:bg-[#333]" />
      <div className="w-full space-y-[5px] mt-1">
        {[0.85, 0.92, 0.78, 0.88, 0.6, 0.9, 0.72].map((w, i) => (
          <div
            key={i}
            className="h-[2px] rounded-full bg-neutral-200 dark:bg-[#252525]"
            style={{ width: `${w * 100}%` }}
          />
        ))}
      </div>
      <div className="w-4/5 aspect-[3/2] mt-auto rounded bg-neutral-100 dark:bg-[#1a1a1a]" />
    </div>
  );

  return (
    <Link
      href={`/system-design/examples/${example.slugAsParams}`}
      className="group block"
    >
      <PagePreview />
      <div className="mt-3 px-0.5">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-[#fafafa] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
          {example.title}
        </h3>
        {example.description && (
          <div className="text-[10px] text-neutral-400 dark:text-[#525252] font-mono uppercase tracking-wider mt-1 line-clamp-1">
            {example.description}
          </div>
        )}
      </div>
    </Link>
  );
}
