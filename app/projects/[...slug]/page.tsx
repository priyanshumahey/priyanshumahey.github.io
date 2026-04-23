import { projects } from "#site/content";
import { MDXContent } from "@/components/blog/mdx-components";
import { ThemeToggle } from "@/components/theme-toggle";
import { notFound } from "next/navigation";
import { Metadata } from "next";

import "@/styles/mdx.css";
import { ExternalLink, Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReadingProgress } from "@/components/blog/reading-progress";

const navLinks = [
    { href: "/blog", label: "Writing" },
    // { href: "/fun", label: "Fun" },,
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

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
    return projects.map((project) => ({ slug: project.slugAsParams.split("/") }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const project = await getProjectFromParams(resolvedParams);

    if (!project) {
        return {
            title: "Project Not Found",
        };
    }

    return {
        title: project.title,
        description: project.description,
        alternates: {
            canonical: `https://priyanshumahey.github.io/projects/${project.slugAsParams}`,
        },
        authors: [{ name: "Priyanshu Mahey", url: "https://priyanshumahey.github.io" }],
        openGraph: {
            title: project.title,
            description: project.description,
            type: "article",
            url: `https://priyanshumahey.github.io/projects/${project.slugAsParams}`,
            ...(project.image && { images: [{ url: project.image }] }),
        },
        twitter: {
            card: "summary_large_image",
            title: project.title,
            description: project.description,
            creator: "@PriyanshuMahey",
            ...(project.image && { images: [project.image] }),
        },
    };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const resolvedParams = await params;
    const project = await getProjectFromParams(resolvedParams);

    if (!project || !project.published) {
        notFound();
    }

    const projectJsonLd = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: project.title,
        description: project.description,
        url: `https://priyanshumahey.github.io/projects/${project.slugAsParams}`,
        dateCreated: project.date,
        author: {
            "@type": "Person",
            name: "Priyanshu Mahey",
            url: "https://priyanshumahey.github.io",
        },
        ...(project.image && { image: [project.image] }),
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-[#fafafa]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
            />
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
                        <header className="mb-8">
                            <h1 className="text-3xl font-medium tracking-tight mb-4 leading-tight">
                                {project.title}
                            </h1>
                            {project.description && (
                                <p className="text-lg text-neutral-500 dark:text-[#e5e5e5] leading-relaxed">
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
                                        className="inline-flex items-center gap-2 text-sm text-neutral-500 dark:text-[#a1a1a1] hover:text-neutral-900 dark:hover:text-[#fafafa] transition-colors"
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
                                        className="inline-flex items-center gap-2 text-sm text-neutral-500 dark:text-[#a1a1a1] hover:text-neutral-900 dark:hover:text-[#fafafa] transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Live Demo
                                    </Link>
                                )}
                            </div>
                        </header>

                        {/* Featured Image */}
                        {project.image && (
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-100 dark:bg-[#171717] mb-8">
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
                        <div className="prose prose-neutral dark:prose-invert prose-base max-w-none">
                            <MDXContent code={project.body} />
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
                            <h1 className="text-[2.5rem] lg:text-[3rem] font-bold leading-tight tracking-tight mb-6">
                                {project.title}
                            </h1>
                            {project.description && (
                                <p className="text-xl text-neutral-500 dark:text-[#e5e5e5] leading-relaxed">
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
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-neutral-900 dark:text-[#fafafa] bg-neutral-100 dark:bg-[#1a1a1a] hover:bg-neutral-200 dark:hover:bg-[#252525] rounded-lg transition-colors"
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
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Live Demo
                                    </Link>
                                )}
                            </div>
                        </header>

                        {/* Featured Image */}
                        {project.image && (
                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-100 dark:bg-[#171717] mb-12">
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
                            <div className="prose prose-neutral dark:prose-invert prose-lg max-w-none">
                                <MDXContent code={project.body} />
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
