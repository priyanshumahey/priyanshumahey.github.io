import { works } from "#site/content";
import { MDXContent } from "@/components/blog/mdx-components";
import { notFound } from "next/navigation";

import "@/styles/mdx.css";
import { ArrowLeft, ExternalLink } from "lucide-react";
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
                            {work.description && (
                                <p className="text-lg text-[#737373] leading-relaxed">
                                    {work.description}
                                </p>
                            )}
                        </header>

                        {/* Article Content */}
                        <div className="prose prose-invert prose-base max-w-none">
                            <MDXContent code={work.body} />
                        </div>
                    </article>
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
                        </header>

                        {/* Article Content */}
                        <div className="prose prose-invert prose-lg max-w-none">
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
