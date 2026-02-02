"use client";

import { ExternalLink } from "lucide-react";

interface CitationProps {
  id: number;
  href?: string;
}

export function Citation({ id, href }: CitationProps) {
  const handleClick = () => {
    const element = document.getElementById(`ref-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("bg-blue-500/20");
      setTimeout(() => element.classList.remove("bg-blue-500/20"), 2000);
    }
  };

  return (
    <sup
      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 cursor-pointer transition-colors ml-0.5"
      onClick={handleClick}
      role="button"
      aria-label={`Jump to reference ${id}`}
    >
      [{id}]
    </sup>
  );
}

interface Reference {
  id: number;
  title: string;
  url: string;
  source?: string;
}

interface ReferencesProps {
  references: Reference[];
}

export function References({ references }: ReferencesProps) {
  return (
    <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
      <h3 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-200">References</h3>
      <div className="space-y-3">
        {references.map((ref) => (
          <div
            key={ref.id}
            id={`ref-${ref.id}`}
            className="flex items-start gap-3 text-sm text-neutral-600 dark:text-neutral-400 rounded-md px-2 py-1.5 -mx-2 transition-colors duration-500"
          >
            <span className="text-neutral-400 dark:text-neutral-500 font-mono min-w-[24px]">[{ref.id}]</span>
            <div className="flex flex-col gap-0.5">
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-700 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1.5 group"
              >
                {ref.title}
                <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
              </a>
              {ref.source && (
                <span className="text-neutral-500 text-xs">{ref.source}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
