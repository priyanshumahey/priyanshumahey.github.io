import { projects } from "#site/content";
import { MDXContent } from "@/components/blog/mdx-components";
import { notFound } from "next/navigation";

import { formatDate } from "@/lib/utils";
import "@/styles/mdx.css";
import { ArrowLeft, Calendar, ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
    { href: "/blog", label: "Writing" },
    { href: "/fun", label: "Fun" },
    { href: "/about", label: "About" },
    { href: "/resume", label: "Resume" },
];

interface ProjectPageProps {
    params: Promise<{
        slug: string[];
    }>;
}

async function getProjectFromParams(params: { slug: string[] }) {
    const slug = params?.slug?.join("/");
    const project = projects.find((project) => project.slugAsParams === slug);
    return project;
}

function getAdjacentProjects(currentSlug: string) {
    const sortedProjects = projects.filter((p) => p.published).sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const currentIndex = sortedProjects.findIndex((p) => p.slugAsParams === currentSlug);
    return {
        prev: currentIndex < sortedProjects.length - 1 ? sortedProjects[currentIndex + 1] : null,
        next: currentIndex > 0 ? sortedProjects[currentIndex - 1] : null,
    };
}

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
    return projects.map((project) => ({ slug: project.slugAsParams.split("/") }));
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const resolvedParams = await params;
    const project = await getProjectFromParams(resolvedParams);

    if (!project || !project.published) {
        notFound();
    }

    const { prev, next } = getAdjacentProjects(project.slugAsParams);

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
                                    <time dateTime={project.date}>{formatDate(project.date)}</time>
                                </div>
                            </div>
                            <h1 className="text-3xl font-medium tracking-tight mb-4 leading-tight">
                                {project.title}
                            </h1>
                            {project.description && (
                                <p className="text-lg text-[#737373] leading-relaxed">
                                    {project.description}
                                </p>
                            )}
                            {/* Links */}
                            <div className="flex items-center gap-4 mt-4">
                                {project.github && (
                                    <Link
                                        href={project.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-[#a1a1a1] hover:text-[#fafafa] transition-colors"
                                    >
                                        <Github className="w-4 h-4" />
                                        GitHub
                                    </Link>
                                )}
                                {project.demo && (
                                    <Link
                                        href={project.demo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-[#a1a1a1] hover:text-[#fafafa] transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Live Demo
                                    </Link>
                                )}
                            </div>
                            {project.tags && project.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {project.tags.map((tag: string) => (
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
                        {project.image && (
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-[#171717] mb-8">
                                <Image
                                    src={project.image}
                                    alt={project.title}
                                    fill
                                    priority
                                    className="object-cover"
                                />
                            </div>
                        )}

                        {/* Article Content */}
                        <div className="prose prose-invert prose-base max-w-none prose-headings:text-[#fafafa] prose-headings:font-semibold prose-p:text-[#a1a1a1] prose-p:leading-relaxed prose-a:text-blue-400 prose-a:decoration-blue-400/50 prose-a:underline-offset-2 hover:prose-a:decoration-blue-400 prose-strong:text-[#fafafa] prose-code:text-[#fafafa] prose-li:text-[#a1a1a1] prose-blockquote:border-l-blue-400 prose-blockquote:text-[#737373] prose-blockquote:not-italic prose-img:rounded-xl">
                            <MDXContent code={project.body} />
                        </div>
                    </article>

                    {/* Project Navigation */}
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
                                    <time dateTime={project.date}>{formatDate(project.date)}</time>
                                </div>
                                {project.featured && (
                                    <>
                                        <span>·</span>
                                        <span className="text-blue-400">Featured</span>
                                    </>
                                )}
                            </div>
                            <h1 className="text-[2.5rem] lg:text-[3rem] font-bold leading-tight tracking-tight mb-6">
                                {project.title}
                            </h1>
                            {project.description && (
                                <p className="text-xl text-[#737373] leading-relaxed">
                                    {project.description}
                                </p>
                            )}
                            {/* Links */}
                            <div className="flex items-center gap-6 mt-6">
                                {project.github && (
                                    <Link
                                        href={project.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[#fafafa] bg-[#1a1a1a] hover:bg-[#252525] rounded-lg transition-colors"
                                    >
                                        <Github className="w-4 h-4" />
                                        View on GitHub
                                    </Link>
                                )}
                                {project.demo && (
                                    <Link
                                        href={project.demo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[#fafafa] bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Live Demo
                                    </Link>
                                )}
                            </div>
                            {project.tags && project.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-6">
                                    {project.tags.map((tag: string) => (
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
                        {project.image && (
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#171717] mb-12">
                                <Image
                                    src={project.image}
                                    alt={project.title}
                                    fill
                                    priority
                                    className="object-cover"
                                />
                            </div>
                        )}

                        {/* Article Content */}
                        <div className="prose prose-invert prose-lg max-w-none prose-headings:text-[#fafafa] prose-headings:font-semibold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-[#a1a1a1] prose-p:leading-[1.8] prose-a:text-blue-400 prose-a:decoration-blue-400/50 prose-a:underline-offset-2 hover:prose-a:decoration-blue-400 prose-strong:text-[#fafafa] prose-code:text-[#fafafa] prose-code:bg-[#1a1a1a] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-li:text-[#a1a1a1] prose-li:leading-relaxed prose-ul:my-6 prose-ol:my-6 prose-blockquote:border-l-2 prose-blockquote:border-l-blue-400 prose-blockquote:text-[#737373] prose-blockquote:not-italic prose-blockquote:pl-6 prose-img:rounded-xl prose-hr:border-[#1a1a1a]">
                            <MDXContent code={project.body} />
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
