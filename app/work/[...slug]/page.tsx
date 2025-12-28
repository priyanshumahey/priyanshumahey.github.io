import { works } from "#site/content";
import { MDXContent } from "@/components/blog/mdx-components";
import { notFound } from "next/navigation";

import { formatDate } from "@/lib/utils";
import "@/styles/mdx.css";
import { ArrowLeft, Briefcase, Calendar, ExternalLink, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
    { href: "/blog", label: "Writing" },
    { href: "/fun", label: "Fun" },
    { href: "/about", label: "About" },
    { href: "/resume", label: "Resume" },
];

interface WorkPageProps {
    params: Promise<{
        slug: string[];
    }>;
}

async function getWorkFromParams(params: { slug: string[] }) {
    const slug = params?.slug?.join("/");
    const work = works.find((work) => work.slugAsParams === slug);
    return work;
}

function getAdjacentWorks(currentSlug: string) {
    const sortedWorks = works.filter((w) => w.published).sort((a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    const currentIndex = sortedWorks.findIndex((w) => w.slugAsParams === currentSlug);
    return {
        prev: currentIndex < sortedWorks.length - 1 ? sortedWorks[currentIndex + 1] : null,
        next: currentIndex > 0 ? sortedWorks[currentIndex - 1] : null,
    };
}

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
    return works.map((work) => ({ slug: work.slugAsParams.split("/") }));
}

export default async function WorkPage({ params }: WorkPageProps) {
    const resolvedParams = await params;
    const work = await getWorkFromParams(resolvedParams);

    if (!work || !work.published) {
        notFound();
    }

    const { prev, next } = getAdjacentWorks(work.slugAsParams);
    const dateRange = work.endDate
        ? `${formatDate(work.startDate)} - ${formatDate(work.endDate)}`
        : `${formatDate(work.startDate)} - Present`;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-[#fafafa]">
            {/* Mobile Layout */}
            <div className="lg:hidden">
                <header className="px-6 pt-6 pb-4 border-b border-[#1a1a1a]">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-[#a1a1a1] hover:text-[#fafafa] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to home
                    </Link>
                </header>

                <main className="px-6 pb-16">
                    <article className="py-8">
                        {/* Article Header */}
                        <header className="mb-8">
                            <div className="flex items-center gap-3 text-sm text-[#525252] mb-4">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{dateRange}</span>
                                </div>
                                {work.isPrivate && (
                                    <>
                                        <span>·</span>
                                        <div className="flex items-center gap-1.5">
                                            <Lock className="w-3.5 h-3.5" />
                                            <span>Private</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <h1 className="text-3xl font-medium tracking-tight leading-tight">
                                    {work.title}
                                </h1>
                                {work.link && (
                                    <Link
                                        href={work.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#525252] hover:text-[#fafafa] transition-colors"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </Link>
                                )}
                            </div>
                            {work.role && (
                                <div className="flex items-center gap-2 text-base text-[#737373] mb-3">
                                    <Briefcase className="w-4 h-4" />
                                    <span>{work.role}</span>
                                </div>
                            )}
                            {work.description && (
                                <p className="text-lg text-[#737373] leading-relaxed">
                                    {work.description}
                                </p>
                            )}
                            {work.tags && work.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {work.tags.map((tag: string) => (
                                        <span
                                            key={tag}
                                            className="px-2.5 py-1 text-xs text-[#a1a1a1] bg-[#1a1a1a] rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </header>

                        {/* Featured Image */}
                        {work.image && (
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-[#171717] mb-8">
                                <Image
                                    src={work.image}
                                    alt={work.title}
                                    fill
                                    priority
                                    className="object-cover"
                                />
                            </div>
                        )}

                        {/* Article Content */}
                        <div className="prose prose-invert prose-base max-w-none prose-headings:text-[#fafafa] prose-headings:font-semibold prose-p:text-[#a1a1a1] prose-p:leading-relaxed prose-a:text-blue-400 prose-a:decoration-blue-400/50 prose-a:underline-offset-2 hover:prose-a:decoration-blue-400 prose-strong:text-[#fafafa] prose-code:text-[#fafafa] prose-li:text-[#a1a1a1] prose-blockquote:border-l-blue-400 prose-blockquote:text-[#737373] prose-blockquote:not-italic prose-img:rounded-xl">
                            <MDXContent code={work.body} />
                        </div>
                    </article>

                    {/* Work Navigation */}
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
                            href="/"
                            className="inline-flex items-center gap-2 text-sm text-[#a1a1a1] hover:text-[#fafafa] transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to home
                        </Link>
                        <nav className="flex items-center gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm text-[#737373] hover:text-[#fafafa] transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </header>

                    <article>
                        {/* Article Header */}
                        <header className="mb-12">
                            <div className="flex items-center gap-4 text-sm text-[#525252] mb-6">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{dateRange}</span>
                                </div>
                                {work.role && (
                                    <>
                                        <span>·</span>
                                        <div className="flex items-center gap-1.5">
                                            <Briefcase className="w-3.5 h-3.5" />
                                            <span>{work.role}</span>
                                        </div>
                                    </>
                                )}
                                {work.isPrivate && (
                                    <>
                                        <span>·</span>
                                        <div className="flex items-center gap-1.5">
                                            <Lock className="w-3.5 h-3.5" />
                                            <span>Private</span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-4 mb-6">
                                <h1 className="text-[2.5rem] lg:text-[3rem] font-bold leading-tight tracking-tight">
                                    {work.title}
                                </h1>
                                {work.link && (
                                    <Link
                                        href={work.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#525252] hover:text-[#fafafa] transition-colors"
                                    >
                                        <ExternalLink className="w-6 h-6" />
                                    </Link>
                                )}
                            </div>
                            {work.description && (
                                <p className="text-xl text-[#737373] leading-relaxed">
                                    {work.description}
                                </p>
                            )}
                            {work.tags && work.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-6">
                                    {work.tags.map((tag: string) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1.5 text-sm text-[#a1a1a1] bg-[#1a1a1a] rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </header>

                        {/* Featured Image */}
                        {work.image && (
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#171717] mb-12">
                                <Image
                                    src={work.image}
                                    alt={work.title}
                                    fill
                                    priority
                                    className="object-cover"
                                />
                            </div>
                        )}

                        {/* Article Content */}
                        <div className="prose prose-invert prose-lg max-w-none prose-headings:text-[#fafafa] prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-[#a1a1a1] prose-p:leading-[1.8] prose-a:text-blue-400 prose-a:decoration-blue-400/50 prose-a:underline-offset-2 hover:prose-a:decoration-blue-400 prose-strong:text-[#fafafa] prose-code:text-[#fafafa] prose-code:bg-[#1a1a1a] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-li:text-[#a1a1a1] prose-li:leading-relaxed prose-ul:my-6 prose-ol:my-6 prose-blockquote:border-l-2 prose-blockquote:border-l-blue-400 prose-blockquote:text-[#737373] prose-blockquote:not-italic prose-blockquote:pl-6 prose-img:rounded-xl prose-hr:border-[#1a1a1a]">
                            <MDXContent code={work.body} />
                        </div>
                    </article>
                    
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
                                href="/"
                                className="text-sm text-[#737373] hover:text-[#fafafa] transition-colors"
                            >
                                Back to home
                            </Link>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}
