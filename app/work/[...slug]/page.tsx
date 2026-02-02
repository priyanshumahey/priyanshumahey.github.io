import { works } from "#site/content";
import { MDXContent } from "@/components/blog/mdx-components";
import { ThemeToggle } from "@/components/theme-toggle";
import { notFound } from "next/navigation";

import "@/styles/mdx.css";
import { ExternalLink } from "lucide-react";
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
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-[#fafafa]">
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
                                        className="text-neutral-400 dark:text-[#a1a1a1] hover:text-neutral-900 dark:hover:text-[#fafafa] transition-colors"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </Link>
                                )}
                            </div>
                            {work.description && (
                                <p className="text-lg text-neutral-500 dark:text-[#e5e5e5] leading-relaxed">
                                    {work.description}
                                </p>
                            )}
                        </header>

                        {/* Article Content */}
                        <div className="prose prose-neutral dark:prose-invert prose-base max-w-none">
                            <MDXContent code={work.body} />
                        </div>
                    </article>
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
                                    className="text-sm text-neutral-500 dark:text-[#737373] hover:text-neutral-900 dark:hover:text-[#fafafa] transition-colors"
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
                                        className="text-neutral-400 dark:text-[#a1a1a1] hover:text-neutral-900 dark:hover:text-[#fafafa] transition-colors"
                                    >
                                        <ExternalLink className="w-6 h-6" />
                                    </Link>
                                )}
                            </div>
                            {work.description && (
                                <p className="text-xl text-neutral-500 dark:text-[#e5e5e5] leading-relaxed">
                                    {work.description}
                                </p>
                            )}
                        </header>

                        {/* Article Content */}
                        <div className="prose prose-neutral dark:prose-invert prose-lg max-w-none">
                            <MDXContent code={work.body} />
                        </div>
                    </article>

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
                                href="/"
                                className="text-sm text-neutral-500 dark:text-[#e5e5e5] hover:text-neutral-900 dark:hover:text-[#fafafa] transition-colors"
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
