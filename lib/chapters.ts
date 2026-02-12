import { Chapter } from "#site/content";

export interface ChapterGroup {
  id: number;
  title: string;
  description: string;
  chapters: Chapter[];
}

export function groupChapters(chapters: Chapter[]): ChapterGroup[] {
  const groupMap = new Map<number, ChapterGroup>();

  for (const ch of chapters) {
    if (!groupMap.has(ch.groupId)) {
      groupMap.set(ch.groupId, {
        id: ch.groupId,
        title: ch.group,
        description: ch.groupDescription ?? "",
        chapters: [],
      });
    }
    groupMap.get(ch.groupId)!.chapters.push(ch);
  }

  const groups = Array.from(groupMap.values()).sort((a, b) => a.id - b.id);
  for (const group of groups) {
    group.chapters.sort((a, b) => a.chapter - b.chapter);
  }

  return groups;
}

export function getChapterBySlug(
  chapters: Chapter[],
  slugAsParams: string
): Chapter | undefined {
  return chapters.find((ch) => ch.slugAsParams === slugAsParams);
}

export function getChapterGroupBySlug(
  chapters: Chapter[],
  slugAsParams: string
): ChapterGroup | undefined {
  const chapter = getChapterBySlug(chapters, slugAsParams);
  if (!chapter) return undefined;
  const groups = groupChapters(chapters);
  return groups.find((g) => g.id === chapter.groupId);
}

export function getAdjacentChapters(chapters: Chapter[], slugAsParams: string) {
  const sorted = [...chapters].sort((a, b) => a.chapter - b.chapter);
  const idx = sorted.findIndex((c) => c.slugAsParams === slugAsParams);
  return {
    prev: idx > 0 ? sorted[idx - 1] : null,
    next: idx < sorted.length - 1 ? sorted[idx + 1] : null,
  };
}

export function getChapterStats(chapters: Chapter[]) {
  const published = chapters.filter((c) => c.published);
  return {
    total: chapters.length,
    published: published.length,
  };
}
