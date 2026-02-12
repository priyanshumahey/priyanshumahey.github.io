"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface Section {
  id: string;
  title: string;
  top: number;
  bottom: number;
  /** Normalized length 0–1 relative to the longest section */
  normalizedLength: number;
  /** Estimated paragraph count for filler lines */
  paragraphCount: number;
}

function estimateFillerLines(normalizedLength: number, paragraphCount: number): number {
  if (paragraphCount > 0) return Math.min(paragraphCount, 4);
  return Math.max(1, Math.round(normalizedLength * 4));
}

export function ChapterSidebar() {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const discoverSections = useCallback(() => {
    const headings = document.querySelectorAll<HTMLHeadingElement>(
      "article h2[id]"
    );
    const rawSections: Omit<Section, "normalizedLength">[] = [];

    const seen = new Set<string>();
    headings.forEach((heading, index) => {
      if (seen.has(heading.id)) return;
      seen.add(heading.id);

      const nextHeading = headings[index + 1];
      const top = heading.offsetTop;
      const bottom = nextHeading
        ? nextHeading.offsetTop
        : document.documentElement.scrollHeight;

      let paragraphCount = 0;
      let sibling = heading.nextElementSibling;
      while (sibling && sibling !== nextHeading) {
        if (
          sibling.matches("p, ul, ol, pre, blockquote, table, .callout, figure")
        ) {
          paragraphCount++;
        }
        sibling = sibling.nextElementSibling;
      }

      rawSections.push({
        id: heading.id,
        title: heading.textContent || "",
        top,
        bottom,
        paragraphCount,
      });
    });

    const lengths = rawSections.map((s) => s.bottom - s.top);
    const maxLen = Math.max(...lengths, 1);

    const sectionData: Section[] = rawSections.map((s, i) => ({
      ...s,
      normalizedLength: Math.max(lengths[i] / maxLen, 0.15),
    }));

    setSections(sectionData);
  }, []);

  useEffect(() => {
    const timer = setTimeout(discoverSections, 500);
    window.addEventListener("resize", discoverSections);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", discoverSections);
    };
  }, [discoverSections]);

  const [sectionProgress, setSectionProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      setScrollProgress(progress);

      const viewportMiddle = scrollTop + window.innerHeight / 3;
      for (const section of sections) {
        if (viewportMiddle >= section.top && viewportMiddle < section.bottom) {
          setActiveSection(section.id);
          const sectionLen = section.bottom - section.top;
          const progressInSection =
            sectionLen > 0
              ? Math.min((viewportMiddle - section.top) / sectionLen, 1)
              : 0;
          setSectionProgress(progressInSection);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 60;
      const top = element.offsetTop - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const activeIndex = useMemo(
    () => sections.findIndex((s) => s.id === activeSection),
    [sections, activeSection]
  );

  useEffect(() => {
    if (activeSection && sidebarRef.current) {
      const activeEl = document.getElementById(`sidebar-section-${activeSection}`);
      if (activeEl) {
        const container = sidebarRef.current;
        const containerRect = container.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();

        if (activeRect.top < containerRect.top + 40 || activeRect.bottom > containerRect.bottom - 40) {
          activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    }
  }, [activeSection]);

  if (sections.length === 0) return null;

  const HEADING_W = 32;
  const HEADING_ACTIVE_W = 44;
  const FILLER_W_MIN = 14;
  const FILLER_W_MAX = 26;

  return (
    <div
      className="focus-hideable fixed right-4 xl:right-8 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-end"
      style={{ maxHeight: "80vh" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`absolute -top-6 right-0 text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded transition-all duration-300 ${
          isHovered
            ? "opacity-0 scale-95"
            : "opacity-70 text-neutral-600 dark:text-neutral-400"
        }`}
      >
        {Math.round(scrollProgress * 100)}%
      </div>

      <div 
        ref={sidebarRef}
        className="overflow-y-auto scrollbar-hide py-2 pr-1 flex flex-col items-end"
        style={{ maxHeight: "100%" }}
      >
        <div className="flex flex-col items-end gap-0">
          {sections.map((section, sectionIdx) => {
            const isActive = activeSection === section.id;
            const isPast = activeIndex > sectionIdx;
            const fillerCount = estimateFillerLines(
              section.normalizedLength,
              section.paragraphCount
            );

            return (
              <div 
                key={section.id} 
                id={`sidebar-section-${section.id}`}
                className="flex flex-col items-end"
              >
                <button
                  onClick={() => scrollToSection(section.id)}
                  className="group flex items-center gap-2.5 cursor-pointer py-[3px] transition-all duration-200"
                >
                  <span
                    className={`text-[11px] font-mono uppercase tracking-wider whitespace-nowrap transition-all duration-300 select-none ${
                      isHovered
                        ? isActive
                          ? "opacity-100 translate-x-0 text-neutral-900 dark:text-[#fafafa] font-medium"
                          : "opacity-40 translate-x-0 text-neutral-500 dark:text-neutral-500 group-hover:opacity-70"
                        : "opacity-0 translate-x-2 pointer-events-none"
                    }`}
                  >
                    {section.title}
                  </span>

                  <div
                    className={`shrink-0 rounded-full transition-all duration-200 ${
                      isActive
                        ? "h-[3px] bg-blue-600 dark:bg-blue-400"
                        : isPast
                          ? "h-[2.5px] bg-neutral-500 dark:bg-neutral-400 group-hover:bg-neutral-600 dark:group-hover:bg-neutral-300"
                          : "h-[2.5px] bg-neutral-300 dark:bg-neutral-600 group-hover:bg-neutral-500 dark:group-hover:bg-neutral-400"
                    }`}
                    style={{
                      width: `${isActive ? HEADING_ACTIVE_W : HEADING_W}px`,
                    }}
                  />
                </button>

                <div className="flex flex-col items-end gap-[4px] py-[3px]">
                  {Array.from({ length: fillerCount }).map((_, i) => {
                    const fillerW =
                      FILLER_W_MIN +
                      ((i * 7 + sectionIdx * 3) % (FILLER_W_MAX - FILLER_W_MIN + 1));

                    const fillerProgress = fillerCount > 0 ? (i + 1) / fillerCount : 1;
                    const isFillerActive = isActive && fillerProgress <= sectionProgress;
                    const isFillerPast = isPast;

                    return (
                      <div
                        key={i}
                        className={`shrink-0 h-[1.5px] rounded-full transition-all duration-300 ${
                          isFillerActive
                            ? "bg-blue-500/60 dark:bg-blue-400/50"
                            : isFillerPast
                              ? "bg-neutral-400 dark:bg-neutral-500"
                              : "bg-neutral-200 dark:bg-neutral-700"
                        }`}
                        style={{ width: `${fillerW}px` }}
                      />
                    );
                  })}
                </div>

                {sectionIdx < sections.length - 1 && (
                  <div className="h-[6px]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={`absolute -bottom-6 right-0 text-[10px] font-mono tracking-wide whitespace-nowrap transition-all duration-300 pointer-events-none ${
          !isHovered && activeSection
            ? "opacity-50 text-neutral-600 dark:text-neutral-400"
            : "opacity-0"
        }`}
      >
        {sections[activeIndex]?.title}
      </div>
    </div>
  );
}
