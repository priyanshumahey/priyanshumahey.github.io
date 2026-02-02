import { EmploymentCardCompact } from "@/components/employmentCard"
import { ThemeToggle } from "@/components/theme-toggle"
import { Download, Github, Linkedin, Mail } from "lucide-react"
import Link from "next/link"

const navLinks = [
    { href: "/blog", label: "Writing" },
    { href: "/fun", label: "Fun" },
    { href: "/about", label: "About" },
    { href: "/resume", label: "Resume" },
]

const socialLinks = [
    { href: "https://www.linkedin.com/in/priyanshu-mahey/", label: "LinkedIn", icon: Linkedin },
    { href: "https://github.com/priyanshumahey", label: "GitHub", icon: Github },
    { href: "mailto:priyanshu.mahey02@gmail.com", label: "Email", icon: Mail },
]

// Current positions
const currentPositions = [
    {
        logo: "/microsoft-logo.png",
        department: "Engineering",
        company: "Microsoft",
        link: "/work/microsoft",
    }
]

// Previous positions
const previousPositions = [
    {
        logo: "/microsoft-logo.png",
        department: "Engineering",
        company: "Microsoft",
        link: "/work/microsoft",
    }
]


// Projects
const projects = [
    {
        logo: "/projects/genwiki.png",
        department: "GenWiki",
        company: "AI Knowledge Base",
        link: "/projects/genwiki",
    }
]

export default function ResumePage() {
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
                    <section className="py-8">
                        {/* Currently */}
                        <div className="mb-8">
                            <h2 className="text-sm font-medium text-neutral-500 dark:text-[#737373] uppercase tracking-wider mb-4">
                                Currently
                            </h2>
                            <div className="space-y-2">
                                {currentPositions.map((position, index) => (
                                    <EmploymentCardCompact
                                        key={index}
                                        logo={position.logo}
                                        department={position.department}
                                        company={position.company}
                                        link={position.link}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Previously */}
                        <div className="mb-8">
                            <h2 className="text-sm font-medium text-neutral-500 dark:text-[#737373] uppercase tracking-wider mb-4">
                                Previously
                            </h2>
                            <div className="space-y-2">
                                {previousPositions.map((position, index) => (
                                    <EmploymentCardCompact
                                        key={index}
                                        logo={position.logo}
                                        department={position.department}
                                        company={position.company}
                                        link={position.link}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Projects */}
                        <div>
                            <h2 className="text-sm font-medium text-neutral-500 dark:text-[#737373] uppercase tracking-wider mb-4">
                                Projects
                            </h2>
                            <div className="space-y-2">
                                {projects.map((project, index) => (
                                    <EmploymentCardCompact
                                        key={index}
                                        logo={project.logo}
                                        department={project.department}
                                        company={project.company}
                                        link={project.link}
                                    />
                                ))}
                            </div>
                        </div>
                    </section>
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
                                    className={`text-sm transition-colors ${link.href === "/resume"
                                        ? "text-neutral-900 dark:text-[#fafafa]"
                                        : "text-neutral-500 dark:text-[#737373] hover:text-neutral-900 dark:hover:text-[#fafafa]"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </header>

                    {/* Title Section */}
                    <section className="mb-16">
                        <h1 className="text-[2.5rem] font-bold leading-tight tracking-tight mb-4">Resume</h1>
                        <p className="text-xl text-neutral-500 dark:text-[#a1a1a1] leading-relaxed max-w-2xl">
                            My professional experience and projects.
                        </p>
                    </section>

                    {/* Currently */}
                    <section className="mb-10">
                        <h2 className="text-sm font-medium text-neutral-500 dark:text-[#737373] uppercase tracking-wider mb-5">
                            Currently
                        </h2>
                        <div className="space-y-1">
                            {currentPositions.map((position, index) => (
                                <EmploymentCardCompact
                                    key={index}
                                    logo={position.logo}
                                    department={position.department}
                                    company={position.company}
                                    link={position.link}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Previously */}
                    <section className="mb-10">
                        <h2 className="text-sm font-medium text-neutral-500 dark:text-[#737373] uppercase tracking-wider mb-5">
                            Previously
                        </h2>
                        <div className="space-y-1">
                            {previousPositions.map((position, index) => (
                                <EmploymentCardCompact
                                    key={index}
                                    logo={position.logo}
                                    department={position.department}
                                    company={position.company}
                                    link={position.link}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Projects */}
                    <section className="mb-10">
                        <h2 className="text-sm font-medium text-neutral-500 dark:text-[#737373] uppercase tracking-wider mb-5">
                            Projects
                        </h2>
                        <div className="space-y-1">
                            {projects.map((project, index) => (
                                <EmploymentCardCompact
                                    key={index}
                                    logo={project.logo}
                                    department={project.department}
                                    company={project.company}
                                    link={project.link}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="pt-8 border-t border-neutral-200 dark:border-[#1a1a1a]">
                        <h2 className="text-sm font-medium text-neutral-500 dark:text-[#737373] uppercase tracking-wider mb-5">
                            Contact
                        </h2>
                        <div className="flex items-center gap-4">
                            {socialLinks.map((link) => {
                                const IconComponent = link.icon
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm text-neutral-500 dark:text-[#a1a1a1] hover:text-neutral-900 dark:hover:text-[#fafafa] transition-colors"
                                    >
                                        <IconComponent className="w-4 h-4" />
                                        {link.label}
                                    </Link>
                                )
                            })}
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="mt-16 pt-8 border-t border-neutral-200 dark:border-[#1a1a1a]">
                        <div className="flex items-center justify-between">
                            <Link
                                href="/"
                                className="text-sm text-neutral-400 dark:text-[#525252] hover:text-neutral-900 dark:hover:text-[#fafafa] transition-colors"
                            >
                                © {new Date().getFullYear()} Priyanshu Mahey
                            </Link>
                            <Link
                                href="/"
                                className="text-sm text-neutral-500 dark:text-[#737373] hover:text-neutral-900 dark:hover:text-[#fafafa] transition-colors"
                            >
                                Back to home
                            </Link>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    )
}
