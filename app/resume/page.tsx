import { EmploymentCardCompact } from "@/components/employmentCard"
import { ArrowLeft, Download, Github, Linkedin, Mail } from "lucide-react"
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
                    <section className="py-8">
                        {/* Currently */}
                        <div className="mb-8">
                            <h2 className="text-sm font-medium text-[#737373] uppercase tracking-wider mb-4">
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
                            <h2 className="text-sm font-medium text-[#737373] uppercase tracking-wider mb-4">
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
                            <h2 className="text-sm font-medium text-[#737373] uppercase tracking-wider mb-4">
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
                <div className="max-w-2xl mx-auto px-8 py-12">
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
                                    className={`text-sm transition-colors ${link.href === "/resume"
                                        ? "text-[#fafafa]"
                                        : "text-[#737373] hover:text-[#fafafa]"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </header>

                    {/* Currently */}
                    <section className="mb-10">
                        <h2 className="text-sm font-medium text-[#737373] uppercase tracking-wider mb-5">
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
                        <h2 className="text-sm font-medium text-[#737373] uppercase tracking-wider mb-5">
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
                        <h2 className="text-sm font-medium text-[#737373] uppercase tracking-wider mb-5">
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
                    <section className="pt-8 border-t border-[#1a1a1a]">
                        <h2 className="text-sm font-medium text-[#737373] uppercase tracking-wider mb-5">
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
                                        className="inline-flex items-center gap-2 text-sm text-[#a1a1a1] hover:text-[#fafafa] transition-colors"
                                    >
                                        <IconComponent className="w-4 h-4" />
                                        {link.label}
                                    </Link>
                                )
                            })}
                        </div>
                    </section>

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
    )
}
