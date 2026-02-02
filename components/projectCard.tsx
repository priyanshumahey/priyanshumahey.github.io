import { Code2, Flower2, Sparkles, type LucideIcon } from "lucide-react";
import Link from "next/link";

type IconName = "flower" | "code" | "sparkles";

const iconMap: Record<IconName, LucideIcon> = {
  flower: Flower2,
  code: Code2,
  sparkles: Sparkles,
};

const gradientMap: Record<IconName, string> = {
  flower: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
  code: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
  sparkles: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
};

const iconColorMap: Record<IconName, string> = {
  flower: "text-pink-400",
  code: "text-emerald-400",
  sparkles: "text-amber-400",
};

interface ProjectLinkCardProps {
  slug: string;
  title: string;
  description?: string;
  icon?: IconName;
}

export default function ProjectLinkCard({
  slug,
  title,
  description,
  icon = "code"
}: ProjectLinkCardProps) {
  const href = `/projects/${slug}`;
  const IconComponent = iconMap[icon];
  const gradientClass = gradientMap[icon];
  const iconColorClass = iconColorMap[icon];

  return (
    <Link href={href} className="block not-prose">
      <div className="flex items-center gap-3 rounded-lg bg-neutral-100 dark:bg-[#1a1a1a] hover:bg-neutral-200 dark:hover:bg-[#222222] transition-colors px-4 py-3 w-full border border-neutral-200 dark:border-[#2a2a2a]">
        <div className={`flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br ${gradientClass} flex-shrink-0`}>
          <IconComponent className={`h-5 w-5 ${iconColorClass}`} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-neutral-900 dark:text-white leading-tight truncate">{title}</span>
          <span className="text-sm text-neutral-500 dark:text-[#d4d4d4] leading-tight truncate">
            {description || "Project"}
          </span>
        </div>
      </div>
    </Link>
  );
}
