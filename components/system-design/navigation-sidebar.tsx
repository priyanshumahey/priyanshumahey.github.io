"use client";

import { chapters, examples } from "#site/content";
import { groupChapters } from "@/lib/chapters";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function NavigationSidebar() {
  const pathname = usePathname();
  const chapterGroups = groupChapters(chapters);
  const [isHovered, setIsHovered] = useState(false);

  const publishedExamples = examples
    .filter((e) => e.published)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div
      className={cn(
        "focus-hideable fixed left-4 xl:left-8 top-24 z-40 hidden xl:flex flex-col gap-6 w-64 max-h-[80vh]",
        "transition-opacity duration-300",
        isHovered ? "opacity-100" : "opacity-50 hover:opacity-100"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="overflow-y-auto pr-2 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800 scrollbar-track-transparent">
        {/* Header */}
        <div>
           <Link 
             href="/system-design"
             className="text-xs font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-[#fafafa] transition-colors"
           >
             System Design
           </Link>
        </div>

        {/* Groups */}
        <div className="flex flex-col gap-8">
          {chapterGroups.map((group) => (
            <div key={group.id} className="flex flex-col gap-2">
              <div className="text-[10px] text-neutral-400 dark:text-[#525252] uppercase tracking-wider font-mono">
                {group.id}. {group.title}
              </div>
              <div className="flex flex-col gap-1.5 border-l border-neutral-200 dark:border-neutral-800 ml-1 pl-3">
                {group.chapters.map((chapter) => {
                  const isActive = pathname === `/system-design/${chapter.slugAsParams}`;
                  return (
                    <Link
                      key={chapter.slug}
                      href={`/system-design/${chapter.slugAsParams}`}
                      className={cn(
                        "text-sm transition-colors line-clamp-1 block py-0.5",
                        isActive
                          ? "text-blue-600 dark:text-blue-400 font-medium"
                          : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                      )}
                    >
                      {chapter.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-neutral-200 dark:border-neutral-800" />

        {/* Examples */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-mono uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            Examples
          </div>
          <div className="flex flex-col gap-1.5 border-l border-neutral-200 dark:border-neutral-800 ml-1 pl-3">
            {publishedExamples.map((example) => {
              const isActive =
                pathname === `/system-design/examples/${example.slugAsParams}`;
              return (
                <Link
                  key={example.slug}
                  href={`/system-design/examples/${example.slugAsParams}`}
                  className={cn(
                    "text-sm transition-colors line-clamp-1 block py-0.5",
                    isActive
                      ? "text-blue-600 dark:text-blue-400 font-medium"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                  )}
                >
                  {example.title}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
