import { examples } from "#site/content";
import ExamplePageClient from "./example-page-client";

interface ExamplePageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  return examples.map((example) => ({ slug: example.slugAsParams.split("/") }));
}

export default async function ExamplePage({ params }: ExamplePageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.join("/");
  return <ExamplePageClient slug={slug} />;
}
