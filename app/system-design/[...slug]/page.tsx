import { chapters } from "#site/content";
import ChapterPageClient from "./chapter-page-client";

interface ChapterPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  return chapters.map((chapter) => ({ slug: chapter.slugAsParams.split("/") }));
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug?.join("/");
  return <ChapterPageClient slug={slug} />;
}
