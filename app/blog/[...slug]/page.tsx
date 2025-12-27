import { posts } from "#site/content";
import { MDXContent } from "@/components/blog/mdx-components";
import { notFound } from "next/navigation";

import { formatDate, sortPosts } from "@/lib/utils";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import "@/styles/mdx.css";

const navLinks = [
  { href: "/work", label: "Work" },
  { href: "/blog", label: "Writing" },
  { href: "/fun", label: "Fun" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
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

function estimateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  return posts.map((post) => ({ slug: post.slugAsParams.split("/") }));
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const post = await getPostFromParams(resolvedParams);

  if (!post || !post.published) {
    notFound();
  }

  const { prev, next } = getAdjacentPosts(post.slugAsParams);
  const readTime = estimateReadTime(post.body);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fafafa]">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <header className="px-6 pt-6 pb-4 border-b border-[#1a1a1a]">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-[#a1a1a1] hover:text-[#fafafa] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All posts
          </Link>
        </header>

        <main className="px-6 pb-16">
          <article className="py-8">
            {/* Article Header */}
            <header className="mb-8">
              <div className="flex items-center gap-3 text-sm text-[#525252] mb-4">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span>·</span>
                <span>{readTime} min read</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-4 leading-tight">
                {post.title}
              </h1>
              {post.description && (
                <p className="text-lg text-[#737373] leading-relaxed">
                  {post.description}
                </p>
              )}
              {post.authors && (
                <p className="text-sm text-[#a1a1a1] mt-4">
                  By {post.authors.join(", ")}
                </p>
              )}
            </header>

            {/* Featured Image */}
            {post.image && (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-[#171717] mb-8">
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
            <div className="prose prose-invert prose-base max-w-none prose-headings:text-[#fafafa] prose-headings:font-semibold prose-p:text-[#a1a1a1] prose-p:leading-relaxed prose-a:text-blue-400 prose-a:decoration-blue-400/50 prose-a:underline-offset-2 hover:prose-a:decoration-blue-400 prose-strong:text-[#fafafa] prose-code:text-[#fafafa] prose-li:text-[#a1a1a1] prose-blockquote:border-l-blue-400 prose-blockquote:text-[#737373] prose-blockquote:not-italic prose-img:rounded-xl">
              <MDXContent code={post.body} />
            </div>
          </article>

          {/* Post Navigation */}
          <nav className="border-t border-[#1a1a1a] pt-8 space-y-4">
            {prev && (
              <Link
                href={`/${prev.slug}`}
                className="block p-4 rounded-xl border border-[#1a1a1a] hover:border-[#333] hover:bg-[#0f0f0f] transition-all group"
              >
                <span className="text-xs text-[#525252] uppercase tracking-wider">
                  Previous
                </span>
                <p className="text-base font-medium text-[#fafafa] group-hover:text-blue-400 transition-colors mt-1">
                  {prev.title}
                </p>
              </Link>
            )}
            {next && (
              <Link
                href={`/${next.slug}`}
                className="block p-4 rounded-xl border border-[#1a1a1a] hover:border-[#333] hover:bg-[#0f0f0f] transition-all group"
              >
                <span className="text-xs text-[#525252] uppercase tracking-wider">
                  Next
                </span>
                <p className="text-base font-medium text-[#fafafa] group-hover:text-blue-400 transition-colors mt-1">
                  {next.title}
                </p>
              </Link>
            )}
          </nav>
        </main>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-3xl mx-auto px-8 py-12">
          {/* Top Navigation */}
          <header className="flex items-center justify-between mb-16">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-[#a1a1a1] hover:text-[#fafafa] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              All posts
            </Link>
            <nav className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors ${
                    link.href === "/blog"
                      ? "text-[#fafafa]"
                      : "text-[#737373] hover:text-[#fafafa]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </header>

          <article>
            {/* Article Header */}
            <header className="mb-12">
              <div className="flex items-center gap-3 text-sm text-[#525252] mb-6">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span>·</span>
                <span>{readTime} min read</span>
                {post.authors && (
                  <>
                    <span>·</span>
                    <span>{post.authors.join(", ")}</span>
                  </>
                )}
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-[1.1]">
                {post.title}
              </h1>
              {post.description && (
                <p className="text-xl text-[#737373] leading-relaxed">
                  {post.description}
                </p>
              )}
            </header>

            {/* Featured Image */}
            {post.image && (
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#171717] mb-12">
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
            <div className="prose prose-invert prose-lg max-w-none prose-headings:text-[#fafafa] prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-[#a1a1a1] prose-p:leading-[1.8] prose-a:text-blue-400 prose-a:decoration-blue-400/50 prose-a:underline-offset-2 hover:prose-a:decoration-blue-400 prose-strong:text-[#fafafa] prose-code:text-[#fafafa] prose-code:bg-[#1a1a1a] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-li:text-[#a1a1a1] prose-li:leading-relaxed prose-ul:my-6 prose-ol:my-6 prose-blockquote:border-l-2 prose-blockquote:border-l-blue-400 prose-blockquote:text-[#737373] prose-blockquote:not-italic prose-blockquote:pl-6 prose-img:rounded-xl prose-hr:border-[#1a1a1a]">
              <MDXContent code={post.body} />
            </div>
          </article>

          {/* Post Navigation */}
          <nav className="mt-12 pt-12 border-t border-[#1a1a1a]">
            <div className="grid grid-cols-2 gap-6">
              {prev ? (
                <Link
                  href={`/${prev.slug}`}
                  className="group p-6 rounded-2xl border border-[#1a1a1a] hover:border-[#333] hover:bg-[#0f0f0f] transition-all"
                >
                  <div className="flex items-center gap-2 text-xs text-[#525252] uppercase tracking-wider mb-2">
                    <ArrowLeft className="w-3 h-3" />
                    Previous
                  </div>
                  <p className="text-base font-medium text-[#fafafa] group-hover:text-blue-400 transition-colors line-clamp-2">
                    {prev.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
              {next ? (
                <Link
                  href={`/${next.slug}`}
                  className="group p-6 rounded-2xl border border-[#1a1a1a] hover:border-[#333] hover:bg-[#0f0f0f] transition-all text-right"
                >
                  <div className="flex items-center justify-end gap-2 text-xs text-[#525252] uppercase tracking-wider mb-2">
                    Next
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <p className="text-base font-medium text-[#fafafa] group-hover:text-blue-400 transition-colors line-clamp-2">
                    {next.title}
                  </p>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </nav>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-[#1a1a1a]">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="text-sm text-[#525252] hover:text-[#fafafa] transition-colors"
              >
                © {new Date().getFullYear()} Priyanshu Mahey
              </Link>
              <Link
                href="/blog"
                className="text-sm text-[#737373] hover:text-[#fafafa] transition-colors"
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
