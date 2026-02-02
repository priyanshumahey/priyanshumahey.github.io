import Link from "next/link";
import { FileText } from "lucide-react";

interface BlogLinkCardProps {
  slug: string;
  title: string;
  description?: string;
}

export default function BlogLinkCard({ slug, title, description }: BlogLinkCardProps) {
  const href = `/blog/${slug}`;

  return (
    <Link href={href} className="block not-prose">
      <div className="flex items-center gap-3 rounded-lg bg-neutral-100 dark:bg-[#1a1a1a] hover:bg-neutral-200 dark:hover:bg-[#222222] transition-colors px-4 py-3 w-full border border-neutral-200 dark:border-[#2a2a2a]">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex-shrink-0">
          <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-neutral-900 dark:text-white leading-tight truncate">{title}</span>
          <span className="text-sm text-neutral-500 dark:text-[#d4d4d4] leading-tight truncate">
            {description || "Blog Post"}
          </span>
        </div>
      </div>
    </Link>
  );
}
