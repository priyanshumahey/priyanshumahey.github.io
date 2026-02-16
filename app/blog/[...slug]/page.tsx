import { posts } from "#site/content";
import { MDXContent } from "@/components/blog/mdx-components";
import { ThemeToggle } from "@/components/theme-toggle";
import { notFound } from "next/navigation";
import { Metadata } from "next";

import { sortPosts } from "@/lib/utils";
import "@/styles/mdx.css";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReadingProgress } from "@/components/blog/reading-progress";

const navLinks = [
  { href: "/blog", label: "Writing" },
  // { href: "/fun", label: "Fun" },
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
];

interface PostPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

async function getPostFromParams(params: { slug: string[] }) {
  const slug = params?.slug?.join("/");
  const post = posts.find((post) => post.slugAsParams === slug);
  return post;
}

function getAdjacentPosts(currentSlug: string) {
  const sortedPosts = sortPosts(posts.filter((p) => p.published));
  const currentIndex = sortedPosts.findIndex((p) => p.slugAsParams === currentSlug);
  return {
    prev: currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null,
    next: currentIndex > 0 ? sortedPosts[currentIndex - 1] : null,
  };
}

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  return posts.map((post) => ({ slug: post.slugAsParams.split("/") }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPostFromParams(resolvedParams);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: `https://priyanshumahey.github.io/blog/${post.slugAsParams}`,
      ...(post.image && {
        images: [{ url: post.image }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      ...(post.image && {
        images: [post.image],
      }),
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const post = await getPostFromParams(resolvedParams);

  if (!post || !post.published) {
    notFound();
  }

  const { prev, next } = getAdjacentPosts(post.slugAsParams);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-[#fafafa]">
      {/* Reading Progress Bar */}
      <ReadingProgress />
      
      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <header className="space-y-6 px-6 pt-8">
          <div>
            <Link href="/" className="text-2xl leading-[1.1] font-medium tracking-tight text-neutral-900 dark:text-[#fafafa] hover:text-neutral-500 dark:hover:text-[#a1a1a1] transition-colors">
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
        </header>

        <main className="px-6 pb-16">
          <article className="py-8">
            {/* Article Header */}
            <header className="mb-10">
              <h1 className="text-3xl font-bold tracking-tight mb-4 leading-[1.15]">
                {post.title}
              </h1>
              {post.description && (
                <p className="text-lg text-neutral-500 dark:text-[#a1a1a1] leading-relaxed">
                  {post.description}
                </p>
              )}
            </header>

            {/* Featured Image */}
            {post.image && (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-100 dark:bg-[#171717] mb-8">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            )}

            {/* Article Content */}
              <div className="prose prose-neutral dark:prose-invert prose-base max-w-none">
                <MDXContent code={post.body} />
              </div>
          </article>

          {/* Post Navigation */}
          <nav className="border-t border-neutral-200 dark:border-[#1a1a1a] pt-8 space-y-4">
            {prev && (
              <Link
                href={`/${prev.slug}`}
                className="block p-4 rounded-xl border border-neutral-200 dark:border-[#1a1a1a] hover:border-neutral-400 dark:hover:border-[#333] hover:bg-neutral-50 dark:hover:bg-[#0f0f0f] transition-all group"
              >
                <span className="text-xs text-neutral-400 dark:text-[#a1a1a1] uppercase tracking-wider">
                  Previous
                </span>
                <p className="text-base font-medium text-neutral-900 dark:text-[#fafafa] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-1">
                  {prev.title}
                </p>
              </Link>
            )}
            {next && (
              <Link
                href={`/${next.slug}`}
                className="block p-4 rounded-xl border border-neutral-200 dark:border-[#1a1a1a] hover:border-neutral-400 dark:hover:border-[#333] hover:bg-neutral-50 dark:hover:bg-[#0f0f0f] transition-all group"
              >
                <span className="text-xs text-neutral-400 dark:text-[#a1a1a1] uppercase tracking-wider">
                  Next
                </span>
                <p className="text-base font-medium text-neutral-900 dark:text-[#fafafa] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mt-1">
                  {next.title}
                </p>
              </Link>
            )}
          </nav>
        </main>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-4xl mx-auto px-8 py-16">
          {/* Header */}
          <header className="flex items-center justify-between mb-16">
            <Link href="/" className="text-lg font-medium text-neutral-900 dark:text-[#fafafa] hover:text-neutral-500 dark:hover:text-[#a1a1a1] transition-colors">
              ← Back
            </Link>
            <nav className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors ${link.href === "/blog"
                    ? "text-neutral-900 dark:text-[#fafafa]"
                    : "text-neutral-500 dark:text-[#737373] hover:text-neutral-900 dark:hover:text-[#fafafa]"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </header>

          <article>
            {/* Article Header */}
            <header className="mb-16">
              <h1 className="text-[2.75rem] lg:text-[3.25rem] font-bold leading-[1.1] tracking-tight mb-6">
                {post.title}
              </h1>
              {post.description && (
                <p className="text-xl text-neutral-500 dark:text-[#a1a1a1] leading-relaxed max-w-2xl">
                  {post.description}
                </p>
              )}
            </header>

            {/* Featured Image */}
            {post.image && (
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-100 dark:bg-[#171717] mb-12">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            )}

            {/* Article Content */}
              <div className="prose prose-neutral dark:prose-invert prose-lg max-w-none">
                <MDXContent code={post.body} />
              </div>
          </article>

          {/* Post Navigation */}
          <nav className="mt-12 pt-12 border-t border-neutral-200 dark:border-[#1a1a1a]">
            <div className="grid grid-cols-2 gap-6">
              {prev ? (
                <Link
                  href={`/${prev.slug}`}
                  className="group p-6 rounded-2xl border border-neutral-200 dark:border-[#1a1a1a] hover:border-neutral-400 dark:hover:border-[#333] hover:bg-neutral-50 dark:hover:bg-[#0f0f0f] transition-all"
                >
                  <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-[#a1a1a1] uppercase tracking-wider mb-2">
                    <ArrowLeft className="w-3 h-3" />
                    Previous
                  </div>
                  <p className="text-base font-medium text-neutral-900 dark:text-[#fafafa] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {prev.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  href={`/${next.slug}`}
                  className="group p-6 rounded-2xl border border-neutral-200 dark:border-[#1a1a1a] hover:border-neutral-400 dark:hover:border-[#333] hover:bg-neutral-50 dark:hover:bg-[#0f0f0f] transition-all text-right"
                >
                  <div className="flex items-center justify-end gap-2 text-xs text-neutral-400 dark:text-[#a1a1a1] uppercase tracking-wider mb-2">
                    Next
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <p className="text-base font-medium text-neutral-900 dark:text-[#fafafa] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {next.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </nav>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-neutral-200 dark:border-[#1a1a1a]">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="text-sm text-neutral-400 dark:text-[#a1a1a1] hover:text-neutral-900 dark:hover:text-[#fafafa] transition-colors"
              >
                © {new Date().getFullYear()} Priyanshu Mahey
              </Link>
              <Link
                href="/blog"
                className="text-sm text-neutral-500 dark:text-[#d4d4d4] hover:text-neutral-900 dark:hover:text-[#fafafa] transition-colors"
              >
                View all posts
              </Link>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
