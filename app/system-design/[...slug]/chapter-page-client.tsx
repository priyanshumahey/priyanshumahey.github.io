"use client";

import { chapters } from "#site/content";
import { MDXContent } from "@/components/blog/mdx-components";
import { ChapterSidebar, FocusMode, NavigationSidebar } from "@/components/system-design";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  VideoPlayer,
  VideoPlayerContent,
  VideoPlayerControlBar,
  VideoPlayerFullscreenButton,
  VideoPlayerMuteButton,
  VideoPlayerPlayButton,
  VideoPlayerSeekBackwardButton,
  VideoPlayerSeekForwardButton,
  VideoPlayerTimeDisplay,
  VideoPlayerTimeRange,
  VideoPlayerVolumeRange,
} from "@/components/ui/video-player";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getAdjacentChapters, getChapterBySlug, getChapterGroupBySlug } from "@/lib/chapters";
import "@/styles/mdx.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

interface ChapterPageClientProps {
  slug: string;
}

export default function ChapterPageClient({ slug }: ChapterPageClientProps) {
  const chapter = getChapterBySlug(chapters, slug);
  const group = getChapterGroupBySlug(chapters, slug);

  if (!chapter || !chapter.published) {
    notFound();
  }

  const { prev, next } = getAdjacentChapters(chapters, slug);
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-[#080808] text-neutral-900 dark:text-[#fafafa]">
      {mounted && isDesktop && <NavigationSidebar />}

      {mounted && isDesktop && <ChapterSidebar />}

      <FocusMode />

      <div className="focus-hideable">
        <ThemeToggle />
      </div>

      <header className="focus-hideable sticky top-0 z-30 bg-neutral-100/80 dark:bg-[#080808]/80 backdrop-blur-sm border-b border-neutral-200 dark:border-[#1a1a1a]">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 h-12 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {prev && prev.published ? (
              <Link
                href={`/system-design/${prev.slugAsParams}`}
                className="p-1 text-neutral-400 dark:text-[#525252] hover:text-neutral-900 dark:hover:text-[#fafafa] transition-colors"
                aria-label="Previous chapter"
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
            ) : (
              <span className="p-1 text-neutral-200 dark:text-[#222]">
                <ChevronLeft className="w-4 h-4" />
              </span>
            )}
            {next && next.published ? (
              <Link
                href={`/system-design/${next.slugAsParams}`}
                className="p-1 text-neutral-400 dark:text-[#525252] hover:text-neutral-900 dark:hover:text-[#fafafa] transition-colors"
                aria-label="Next chapter"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="p-1 text-neutral-200 dark:text-[#222]">
                <ChevronRight className="w-4 h-4" />
              </span>
            )}

            <nav className="ml-3 flex items-center gap-2 text-xs font-mono uppercase tracking-wider">
              <Link
                href="/system-design"
                className="text-neutral-400 dark:text-[#525252] hover:text-neutral-900 dark:hover:text-[#fafafa] transition-colors hidden sm:inline"
              >
                {group?.title}
              </Link>
              <span className="text-neutral-300 dark:text-[#333] hidden sm:inline">/</span>
              <span className="text-neutral-900 dark:text-[#fafafa] font-medium truncate max-w-[200px] sm:max-w-none">
                {chapter.title}
              </span>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="bg-white dark:bg-[#0e0e0e] rounded-sm sm:rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.15)] border border-neutral-200/60 dark:border-[#1a1a1a] px-6 sm:px-10 lg:px-16">
          <article className="py-12 lg:py-20 max-w-[680px] mx-auto">
            <header className="text-center mb-16 lg:mb-20">
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-medium leading-[1.2] tracking-tight mb-6">
                {chapter.title}
              </h1>

              {chapter.description && (
                <p className="text-base lg:text-lg text-neutral-500 dark:text-[#a1a1a1] leading-relaxed max-w-xl mx-auto">
                  {chapter.description}
                </p>
              )}

              <div className="mt-10 flex justify-center">
                <div className="w-16 h-px bg-neutral-300 dark:bg-[#333]" />
              </div>
            </header>

            {chapter.video && (
              <div className="mb-12 lg:mb-16 rounded-xl overflow-hidden border border-neutral-200 dark:border-[#1a1a1a]">
                <VideoPlayer>
                  <VideoPlayerContent
                    slot="media"
                    src={chapter.video}
                    preload="metadata"
                    crossOrigin="anonymous"
                  />
                  <VideoPlayerControlBar>
                    <VideoPlayerPlayButton />
                    <VideoPlayerSeekBackwardButton />
                    <VideoPlayerSeekForwardButton />
                    <VideoPlayerTimeRange />
                    <VideoPlayerTimeDisplay showDuration />
                    <VideoPlayerMuteButton />
                    <VideoPlayerVolumeRange />
                    <VideoPlayerFullscreenButton />
                  </VideoPlayerControlBar>
                </VideoPlayer>
              </div>
            )}

            <div className="prose prose-neutral dark:prose-invert max-w-none chapter-content text-base lg:text-[1.0625rem] leading-[1.8] lg:leading-[1.85]">
              <MDXContent code={chapter.body} />
            </div>
          </article>

          <footer className="focus-hideable max-w-[680px] mx-auto mt-8 py-8 border-t border-neutral-200 dark:border-[#1a1a1a]">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="text-xs text-neutral-400 dark:text-[#525252] hover:text-neutral-900 dark:hover:text-[#fafafa] transition-colors"
              >
                © {new Date().getFullYear()} Priyanshu Mahey
              </Link>
              <Link
                href="/system-design"
                className="text-xs text-neutral-400 dark:text-[#525252] hover:text-neutral-900 dark:hover:text-[#fafafa] transition-colors font-mono uppercase tracking-wider"
              >
                All Chapters
              </Link>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
