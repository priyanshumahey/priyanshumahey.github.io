"use client";

import { chapters } from "#site/content";
import { ThemeToggle } from "@/components/theme-toggle";
import { getChapterStats, groupChapters } from "@/lib/chapters";
import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { href: "/blog", label: "Writing" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
];

export default function SystemDesignChaptersPage() {
  const chapterGroups = groupChapters(chapters);
  const stats = getChapterStats(chapters);

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
              Table of Contents.
            </h1>
            <p className="text-base text-neutral-500 dark:text-[#a1a1a1] leading-relaxed">
              A series on the fundamentals of system design.
            </p>
          </motion.section>

          <motion.div
            className="py-6 border-b border-neutral-200 dark:border-[#1a1a1a]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.5 }}
          >
            <Link href="/system-design/examples" className="group flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">Examples & Case Studies</h2>
                <p className="text-sm text-neutral-500 dark:text-[#a1a1a1]">Learn from real production systems</p>
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
            <StatBlock label="Finished Chapters" value={`${stats.published} / ${stats.total}`} />
            <StatBlock label="Sections" value={String(chapterGroups.length)} />
          </motion.div>

          {chapterGroups.map((group, groupIndex) => (
            <motion.section
              key={group.id}
              className="py-10 border-b border-neutral-200 dark:border-[#1a1a1a] last:border-b-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + groupIndex * 0.1, duration: 0.5 }}
            >
              <div className="mb-6">
                <div className="text-xs text-neutral-400 dark:text-[#525252] uppercase tracking-wider font-mono mb-2">
                  {group.id}. {group.title}
                </div>
                <p className="text-sm text-neutral-500 dark:text-[#a1a1a1] leading-relaxed">
                  {group.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {group.chapters.map((chapter) => (
                  <ChapterCard key={chapter.slug} chapter={chapter} />
                ))}
              </div>
            </motion.section>
          ))}
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
              href="/"
              className="text-lg font-medium text-neutral-900 dark:text-[#fafafa] hover:text-neutral-500 dark:hover:text-[#a1a1a1] transition-colors"
            >
              ← Back
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
              Table of Contents.
            </h1>
            <p className="text-lg text-neutral-500 dark:text-[#a1a1a1] leading-relaxed max-w-2xl">
              A series on the fundamentals of system design — from first
              principles to production architectures.
            </p>
          </motion.section>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.5 }}
            className="mb-12"
          >
            <Link href="/system-design/examples" className="group block p-8 border border-neutral-200 dark:border-[#1a1a1a] rounded-xl hover:border-neutral-300 dark:hover:border-[#333] transition-all bg-neutral-50/50 dark:bg-[#0f0f0f]/50">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">System Design by Example</h2>
                  <p className="text-neutral-500 dark:text-[#a1a1a1]">Real-world architecture deep dives: Twitter, Uber, OneDrive, and more.</p>
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
            <StatBlock label="Finished Chapters" value={`${stats.published} / ${stats.total}`} />
            <StatBlock label="Sections" value={String(chapterGroups.length)} />
          </motion.div>

          <section className="space-y-24">
            {chapterGroups.map((group, groupIndex) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + groupIndex * 0.1, duration: 0.5 }}
              >
                <div className="grid grid-cols-[320px_1fr] gap-12 items-start">
                  <div className="sticky top-24">
                    <div className="text-xs text-neutral-400 dark:text-[#525252] uppercase tracking-wider font-mono mb-3">
                      {group.id}. {group.title}
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-[#a1a1a1] leading-relaxed">
                      {group.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                    {group.chapters.map((chapter, chapterIndex) => (
                      <motion.div
                        key={chapter.slug}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.3 + groupIndex * 0.1 + chapterIndex * 0.05,
                          duration: 0.4,
                        }}
                      >
                        <ChapterCard chapter={chapter} />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {groupIndex < chapterGroups.length - 1 && (
                  <div className="mt-24 border-b border-neutral-200 dark:border-[#1a1a1a]" />
                )}
              </motion.div>
            ))}
          </section>
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

// Group accent colors
const groupAccents: Record<number, { bg: string; text: string; darkBg: string; darkText: string }> = {
  1: { bg: "bg-blue-50", text: "text-blue-600", darkBg: "dark:bg-blue-950/20", darkText: "dark:text-blue-400" },
  2: { bg: "bg-emerald-50", text: "text-emerald-600", darkBg: "dark:bg-emerald-950/20", darkText: "dark:text-emerald-400" },
  3: { bg: "bg-violet-50", text: "text-violet-600", darkBg: "dark:bg-violet-950/20", darkText: "dark:text-violet-400" },
  4: { bg: "bg-amber-50", text: "text-amber-600", darkBg: "dark:bg-amber-950/20", darkText: "dark:text-amber-400" },
  5: { bg: "bg-rose-50", text: "text-rose-600", darkBg: "dark:bg-rose-950/20", darkText: "dark:text-rose-400" },
};

const accentBarColors: Record<number, string> = {
  1: "bg-blue-400 dark:bg-blue-500",
  2: "bg-emerald-400 dark:bg-emerald-500",
  3: "bg-violet-400 dark:bg-violet-500",
  4: "bg-amber-400 dark:bg-amber-500",
  5: "bg-rose-400 dark:bg-rose-500",
};

// Extract content structure from compiled MDX body
type ContentItem = { type: "h2" | "h3" | "p" | "li" | "code"; text: string };

function extractContentPreview(body: string): ContentItem[] {
  const items: ContentItem[] = [];

  // Detect variable names from compiled MDX
  // Pattern: const{Fragment:X,jsx:Y,jsxs:Z}=arguments[0];function _createMdxContent(A){const B={...
  const varsMatch = body.match(/const\{Fragment:(\w+),jsx:(\w+),jsxs:(\w+)\}/);
  const objMatch = body.match(/function _createMdxContent\(\w+\)\{const (\w+)=\{/);
  if (!varsMatch || !objMatch) return items;

  const jsxFn = varsMatch[2]; // the jsx() function name
  const obj = objMatch[1]; // the element object variable name

  // Escape for regex
  const o = obj.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const j = jsxFn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Match: obj.h2,{...children:jsxFn(obj.a,{...children:"text"})}) — headings with anchor
  // Match: obj.p,{children:"text"}) — simple paragraphs
  // Match: obj.li,{children:"text"}) — list items
  const regex = new RegExp(
    `${o}\\.(h2|h3|p|li),\\{(?:[^}]*children:${j}\\(${o}\\.a,\\{[^}]*children:"([^"]+)"\\}\\)|[^}]*children:"([^"]+)")`,
    'g'
  );

  let match;
  while ((match = regex.exec(body)) !== null) {
    const type = match[1] as ContentItem["type"];
    const text = match[2] || match[3];
    if (text && text.length > 2 && !text.includes("┌") && !text.includes("│") && !text.includes("└")) {
      items.push({ type, text });
    }
  }
  return items;
}

function hasCodeBlocks(body: string): boolean {
  return body.includes("data-language") || body.includes('a.pre,');
}

// Tiny markdown-styled content preview
function ContentPreviewBlock({ body, muted }: { body: string; muted?: boolean }) {
  const allItems = extractContentPreview(body);
  const showCode = hasCodeBlocks(body);

  // Curate a balanced preview: for each heading section, keep the heading + up to 2 body items
  // This avoids paragraph-heavy pages from becoming a giant wall of text
  const previewItems: ContentItem[] = [];
  let bodyInSection = 0;
  for (const item of allItems) {
    if (item.type === "h2" || item.type === "h3") {
      bodyInSection = 0;
      previewItems.push(item);
    } else {
      bodyInSection++;
      if (bodyInSection <= 2) {
        previewItems.push(item);
      }
    }
    if (previewItems.length >= 18) break;
  }
  // If the first item is a paragraph (before any heading), include it
  if (allItems.length > 0 && allItems[0].type === "p" && (previewItems.length === 0 || previewItems[0] !== allItems[0])) {
    previewItems.unshift(allItems[0]);
  }

  const textColor = muted ? "text-neutral-300 dark:text-[#282828]" : "text-neutral-500 dark:text-[#555]";
  const headingColor = muted ? "text-neutral-300 dark:text-[#2a2a2a]" : "text-neutral-600 dark:text-[#888]";
  const lineColor = muted ? "bg-neutral-200 dark:bg-[#181818]" : "bg-neutral-200 dark:bg-[#1f1f1f]";
  const codeColor = muted ? "bg-neutral-100 dark:bg-[#0f0f0f] border-neutral-200 dark:border-[#1a1a1a]" : "bg-neutral-50 dark:bg-[#121212] border-neutral-200 dark:border-[#222]";

  return (
    <div className="flex-1 flex flex-col gap-[6px] overflow-hidden min-h-0">
      {previewItems.map((item, i) => {
        if (item.type === "h2") {
          return (
            <div key={i} className={`${i > 0 ? "mt-[6px]" : ""}`}>
              <div className={`text-[5px] sm:text-[6px] font-bold leading-normal truncate ${headingColor}`}>
                {item.text}
              </div>
              <div className={`w-full h-px mt-[3px] ${lineColor} opacity-60`} />
            </div>
          );
        }
        if (item.type === "h3") {
          return (
            <div key={i} className={`${i > 0 ? "mt-[4px]" : ""}`}>
              <div className={`text-[4.5px] sm:text-[5.5px] font-semibold leading-normal truncate ${headingColor} opacity-80`}>
                {item.text}
              </div>
            </div>
          );
        }
        if (item.type === "li") {
          return (
            <div key={i} className="flex items-start gap-[3px]">
              <div className={`w-[2px] h-[2px] rounded-full mt-[4px] shrink-0 ${muted ? "bg-neutral-250 dark:bg-[#222]" : "bg-neutral-300 dark:bg-[#444]"}`} />
              <div className={`text-[4px] sm:text-[5px] leading-relaxed truncate ${textColor}`}>
                {item.text}
              </div>
            </div>
          );
        }
        // paragraph
        return (
          <div key={i} className={`text-[4px] sm:text-[5px] leading-relaxed truncate ${textColor}`}>
            {item.text}
          </div>
        );
      })}

      {/* Code block indicator if content has code */}
      {showCode && (
        <div className={`rounded border px-1.5 py-1 mt-[4px] ${codeColor}`}>
          <div className="flex items-center gap-1 mb-[2px]">
            <div className={`w-[3px] h-[3px] rounded-full ${muted ? "bg-neutral-200 dark:bg-[#1a1a1a]" : "bg-red-300 dark:bg-red-800/50"}`} />
            <div className={`w-[3px] h-[3px] rounded-full ${muted ? "bg-neutral-200 dark:bg-[#1a1a1a]" : "bg-yellow-300 dark:bg-yellow-800/50"}`} />
            <div className={`w-[3px] h-[3px] rounded-full ${muted ? "bg-neutral-200 dark:bg-[#1a1a1a]" : "bg-green-300 dark:bg-green-800/50"}`} />
          </div>
          <div className="space-y-[2px]">
            <div className={`h-[1px] w-[60%] rounded-full ${muted ? "bg-neutral-200 dark:bg-[#181818]" : "bg-neutral-300 dark:bg-[#2a2a2a]"}`} />
            <div className={`h-[1px] w-[80%] rounded-full ${muted ? "bg-neutral-200 dark:bg-[#181818]" : "bg-neutral-300 dark:bg-[#2a2a2a]"}`} />
            <div className={`h-[1px] w-[45%] rounded-full ${muted ? "bg-neutral-200 dark:bg-[#181818]" : "bg-neutral-300 dark:bg-[#2a2a2a]"}`} />
          </div>
        </div>
      )}
    </div>
  );
}

function ChapterCard({
  chapter,
}: {
  chapter: (typeof chapters)[number];
}) {
  const isPublished = chapter.published;
  const accent = groupAccents[chapter.groupId] || groupAccents[1];
  const accentBar = accentBarColors[chapter.groupId] || accentBarColors[1];

  const PagePreview = ({ muted }: { muted?: boolean }) => (
    <div
      className={`aspect-[4/5] w-full rounded-lg border flex flex-col overflow-hidden transition-all duration-200 ${
        muted
          ? "bg-neutral-100 dark:bg-[#111] border-neutral-200 dark:border-[#1a1a1a]"
          : "bg-white dark:bg-[#0e0e0e] border-neutral-200 dark:border-[#222] group-hover:border-neutral-400 dark:group-hover:border-[#444] group-hover:shadow-lg dark:group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] group-hover:scale-[1.02]"
      }`}
    >
      {/* Color accent strip */}
      <div className={`h-[3px] w-full ${muted ? "bg-neutral-200 dark:bg-[#1a1a1a]" : accentBar} opacity-80`} />

      {/* Mini header bar */}
      <div className={`flex items-center gap-1.5 px-3 py-1.5 border-b ${
        muted
          ? "border-neutral-200 dark:border-[#1a1a1a] bg-neutral-50 dark:bg-[#0c0c0c]"
          : "border-neutral-100 dark:border-[#1a1a1a] bg-neutral-50/80 dark:bg-[#090909]"
      }`}>
        <div className="flex gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${muted ? "bg-neutral-200 dark:bg-[#1a1a1a]" : "bg-neutral-300 dark:bg-[#333]"}`} />
          <div className={`w-1.5 h-1.5 rounded-full ${muted ? "bg-neutral-200 dark:bg-[#1a1a1a]" : "bg-neutral-300 dark:bg-[#333]"}`} />
          <div className={`w-1.5 h-1.5 rounded-full ${muted ? "bg-neutral-200 dark:bg-[#1a1a1a]" : "bg-neutral-300 dark:bg-[#333]"}`} />
        </div>
        {!muted && (
          <span className={`text-[5px] font-mono px-1 py-0.5 rounded ${accent.bg} ${accent.text} ${accent.darkBg} ${accent.darkText}`}>
            {chapter.group}
          </span>
        )}
        <span className={`text-[6px] font-mono ml-auto ${
          muted ? "text-neutral-300 dark:text-[#222]" : "text-neutral-400 dark:text-[#444]"
        }`}>
          Ch. {chapter.chapter}
        </span>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col p-2.5 gap-1 overflow-hidden">
        {/* Title preview */}
        <div className={`text-[7px] sm:text-[8px] font-bold leading-tight truncate ${
          muted ? "text-neutral-300 dark:text-[#333]" : "text-neutral-700 dark:text-[#ccc]"
        }`}>
          {chapter.title}
        </div>

        {/* Separator under title */}
        <div className={`w-10 h-px ${muted ? "bg-neutral-200 dark:bg-[#1a1a1a]" : "bg-neutral-200 dark:bg-[#333]"}`} />

        {/* Content preview — real text from MDX */}
        <ContentPreviewBlock body={chapter.body} muted={muted} />
      </div>
    </div>
  );

  if (!isPublished) {
    return (
      <div className="group opacity-50 cursor-default">
        <PagePreview muted />
        <div className="mt-3 px-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-neutral-400 dark:text-[#525252] leading-snug line-clamp-2">
              {chapter.title}
            </h3>
            <Lock className="w-3 h-3 text-neutral-300 dark:text-[#333] shrink-0" />
          </div>
          <div className="text-[10px] text-neutral-400 dark:text-[#444] font-mono uppercase tracking-wider mt-1">
            Coming soon
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/system-design/${chapter.slugAsParams}`}
      className="group block"
    >
      <PagePreview />
      <div className="mt-3 px-0.5">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-[#fafafa] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
          {chapter.title}
        </h3>
        {chapter.wordCount && (
          <div className="text-[10px] text-neutral-400 dark:text-[#525252] font-mono uppercase tracking-wider mt-1">
            {chapter.wordCount >= 1000
              ? `${(chapter.wordCount / 1000).toFixed(1)}K`
              : chapter.wordCount}{" "}
            Words
          </div>
        )}
      </div>
    </Link>
  );
}
