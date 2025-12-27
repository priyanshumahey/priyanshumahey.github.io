"use client"

import { LinkPreview } from "@/components/ui/link-preview"
import { WorkSection, GallerySection, ProjectGrid, type ProjectData } from "@/components/projects"
import { motion } from "framer-motion"
import { FileText, Github, Linkedin, Mail } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

// Project data - Work experiences (ordered by year, newest first)
const projects: ProjectData[] = [
  {
    title: "Microsoft",
    description: "Building agents, AI software, and recommendation systems.",
    year: "2025",
    link: "/projects/microsoft",
    image: "/work/msft1.png",
    hoverImage: "/work/msft2.png",
    isPrivate: true,
  },
  {
    title: "Zofiq",
    description: "AI-powered platform transforming how businesses interact with customers.",
    year: "2024",
    link: "https://zofiq.ai/",
    image: "/work/zofiq1.png",
    hoverImage: "/work/zofiq2.png",
  },
  {
    title: "Purple Lotus",
    description: "Built a healthcare technology platform enabling better patient outcomes through AI-driven diagnostics.",
    year: "2023",
    link: "https://purplelotusmh.com",
    image: "/work/purplelotus1.png"

  },
  {
    title: "Input Retrieval",
    description: "Advanced search and retrieval platform powered by cutting-edge AI technology.",
    year: "2024",
    link: "https://www.inputretrieval.com/",
    image: "/work/ir.png",
    hoverVideo: "/work/inputretrieval.mp4",
  },
  {
    title: "Index",
    description: "AI-powered knowledge management system for organizing and retrieving information intelligently.",
    year: "2024",
    link: "/projects/index",
    image: "/hero.jpg",
    isPrivate: true,
  },
  {
    title: "WikiLLM",
    description: "Bridging Wikipedia's knowledge with large language models for enhanced information retrieval.",
    year: "2024",
    link: "/projects/wikillm",
    image: "/hero.jpg",
  },
  {
    title: "EEG Research",
    description: "Neural signal processing research at UBC exploring brain-computer interfaces.",
    year: "2022",
    link: "/projects/eeg",
    image: "/hero.jpg",
  },
]

const smallProjects: ProjectData[] = [
  {
    title: "Task Manager",
    description: "Minimal productivity app",
    year: "2024",
    image: "/hero.jpg",
    link: "/projects/task-manager",
  },
  {
    title: "Weather Dashboard",
    description: "Real-time weather data visualization",
    year: "2023",
    image: "/hero.jpg",
    link: "/projects/weather",
  },
  {
    title: "Portfolio Template",
    description: "Open source portfolio builder",
    year: "2023",
    image: "/hero.jpg",
    link: "/projects/portfolio",
  },
  {
    title: "Code Snippets",
    description: "Developer utility tools collection",
    year: "2024",
    image: "/hero.jpg",
    link: "/projects/snippets",
  },
  {
    title: "Link Shortener",
    description: "Fast URL shortening service",
    year: "2022",
    image: "/hero.jpg",
    link: "/projects/shortener",
  },
  {
    title: "Blog Engine",
    description: "Lightweight markdown blogging",
    year: "2023",
    image: "/hero.jpg",
    link: "/projects/blog",
  },
]

// Additional full-width gallery projects
const galleryProjects: ProjectData[] = [
  {
    title: "E-commerce Platform",
    description: "Full-stack shopping experience",
    year: "2024",
    image: "/hero.jpg",
    link: "/projects/ecommerce",
  },
  {
    title: "Social Network",
    description: "Community engagement platform",
    year: "2023",
    image: "/hero.jpg",
    link: "/projects/social",
  },
  {
    title: "Analytics Dashboard",
    description: "Business intelligence tools",
    year: "2024",
    image: "/hero.jpg",
    link: "/projects/analytics",
    isPrivate: true,
  },
  {
    title: "Fitness Tracker",
    description: "Health and workout logging",
    year: "2023",
    image: "/hero.jpg",
    link: "/projects/fitness",
  },
  {
    title: "Recipe App",
    description: "Culinary discovery platform",
    year: "2022",
    image: "/hero.jpg",
    link: "/projects/recipes",
  },
  {
    title: "Music Player",
    description: "Audio streaming service",
    year: "2024",
    image: "/hero.jpg",
    link: "/projects/music",
  },
  {
    title: "Travel Planner",
    description: "Trip organization system",
    year: "2023",
    image: "/hero.jpg",
    link: "/projects/travel",
  },
  {
    title: "Note Taking",
    description: "Knowledge management tool",
    year: "2024",
    image: "/hero.jpg",
    link: "/projects/notes",
  },
  {
    title: "Video Editor",
    description: "Browser-based video tools",
    year: "2022",
    image: "/hero.jpg",
    link: "/projects/video",
  },
]

// Social/nav links
const socialLinks = [
  { href: "https://www.linkedin.com/in/priyanshu-mahey/", label: "LinkedIn", icon: "linkedin" },
  { href: "https://x.com/PriyanshuMahey", label: "X", icon: "x" },
  { href: "https://github.com/priyanshumahey", label: "GitHub", icon: "github" },
  { href: "https://substack.com/@priyanshumahey", label: "Substack", icon: "substack" },
  { href: "mailto:priyanshu.mahey02@gmail.com", label: "Email", icon: "email" },
]

const navLinks = [
  { href: "/work", label: "Work" },
  { href: "/blog", label: "Writing" },
  { href: "/fun", label: "Fun" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

const Icons = {
  linkedin: () => <Linkedin className="w-5 h-5" />,
  x: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  github: () => <Github className="w-5 h-5" />,
  substack: () => <FileText className="w-5 h-5" />,
  email: () => <Mail className="w-5 h-5" />,
}

export default function Page() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [showAllGallery, setShowAllGallery] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile) return

    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      const progress = Math.min(scrollY / (windowHeight * 0.5), 1)
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isMobile])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fafafa]">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Header */}
        <motion.header
          className="space-y-6 px-6 pt-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div>
            <motion.h1
              className="text-2xl leading-[1.1] font-medium tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Priyanshu Mahey.
            </motion.h1>
            {/* Navigation Links */}
            <nav className="flex flex-row gap-4 pt-3">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05, duration: 0.4 }}
                >
                  <Link
                    href={link.href}
                    className="text-sm text-[#a1a1a1] hover:text-[#fafafa] transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>
          <motion.div
            className="text-base leading-relaxed text-[#a1a1a1]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Building agents, AI software, and recommendation systems at{" "}
            <LinkPreview
              url="https://www.microsoft.com/"
              className="text-[#fafafa] hover:text-[#a1a1a1] transition-colors font-medium decoration-blue-400 decoration-2 underline-offset-2 underline"
            >
              Microsoft
            </LinkPreview>
            . Previously built{" "}
            <LinkPreview
              url="https://purplelotusmh.com/"
              className="text-[#fafafa] hover:text-[#a1a1a1] transition-colors font-medium decoration-blue-400 decoration-2 underline-offset-2 underline"
            >
              Purple Lotus
            </LinkPreview>
            ,{" "}
            <LinkPreview
              url="https://www.zofiq.com/"
              className="text-[#fafafa] hover:text-[#a1a1a1] transition-colors font-medium decoration-blue-400 decoration-2 underline-offset-2 underline"
            >
              Zofiq
            </LinkPreview>
            , research @ <span className="text-[#fafafa]">UBC</span>.
          </motion.div>

          {/* Social Links */}
          <motion.div
            className="flex items-center gap-3 pt-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {socialLinks.map((link, index) => {
              const IconComponent = Icons[link.icon as keyof typeof Icons]
              return (
                <motion.div
                  key={link.href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.05, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    className="w-9 h-9 rounded-full border border-[#333] flex items-center justify-center text-[#888] hover:text-white hover:border-[#555] transition-all"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                  >
                    <IconComponent />
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </motion.header>

        {/* Content */}
        <main className="px-6 pb-16">
          {/* Hero Section */}
          <section className="py-12"></section>

          {/* Work */}
          <WorkSection title="Selected Work" projects={projects} />

          {/* Small Projects */}
          <section className="space-y-6 mt-16">
            <ProjectGrid projects={smallProjects} columns={1} />
          </section>

          {/* Social Links */}
          <footer className="flex items-center gap-3 pt-12 pb-6">
            {socialLinks.map((link) => {
              const IconComponent = Icons[link.icon as keyof typeof Icons]
              return (
                <motion.div
                  key={link.href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={link.href}
                    className="w-10 h-10 rounded-full border border-[#333] flex items-center justify-center text-[#888] hover:text-white hover:border-[#555] transition-all"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                  >
                    <IconComponent />
                  </Link>
                </motion.div>
              )
            })}
          </footer>
        </main>
      </div>

      {/* Desktop Split Layout */}
      <div className="hidden lg:block">
        <div className="flex">
          {/* Left Panel - Sticky */}
          <div className="sticky top-0 h-screen overflow-y-auto border-r border-[#1a1a1a] w-[35%]">
            <div className="p-12 xl:p-16 flex flex-col h-full justify-between">
              {/* Top Content */}
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <motion.h1
                    className="font-bold text-[2.5rem] leading-tight text-[#fafafa] mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    Priyanshu Mahey
                  </motion.h1>
                  <motion.div
                    className="text-base text-[#a1a1a1] leading-relaxed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    Building agents, AI software, and recommendation systems at{" "}
                    <LinkPreview
                      url="https://www.microsoft.com/"
                      className="text-[#fafafa] hover:text-[#d4d4d4] transition-colors font-medium decoration-blue-400 decoration-2 underline-offset-2 underline"
                    >
                      Microsoft
                    </LinkPreview>
                    . Previously built{" "}
                    <LinkPreview
                      url="https://purplelotusmh.com/"
                      className="text-[#fafafa] hover:text-[#d4d4d4] transition-colors font-medium decoration-blue-400 decoration-2 underline-offset-2 underline"
                    >
                      Purple Lotus
                    </LinkPreview>
                    ,{" "}
                    <LinkPreview
                      url="https://www.zofiq.com/"
                      className="text-[#fafafa] hover:text-[#d4d4d4] transition-colors font-medium decoration-blue-400 decoration-2 underline-offset-2 underline"
                    >
                      Zofiq
                    </LinkPreview>
                    , research @ <span className="text-[#fafafa]">UBC</span>.
                  </motion.div>
                </motion.div>

                <nav
                  className="flex flex-col gap-2.5 transition-all duration-700 ease-out"
                  style={{
                    opacity: scrollProgress,
                    transform: `translateY(-${(1 - scrollProgress) * 10}px)`,
                  }}
                >
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-xs text-[#a1a1a1] hover:text-[#fafafa] transition-colors w-fit"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Bottom - Social Links */}
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {socialLinks.map((link, index) => {
                  const IconComponent = Icons[link.icon as keyof typeof Icons]
                  return (
                    <motion.div
                      key={link.href}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.05, duration: 0.3 }}
                    >
                      <Link
                        href={link.href}
                        className="w-10 h-10 rounded-full border border-[#333] flex items-center justify-center text-[#888] hover:text-white hover:border-[#555] transition-all"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.label}
                      >
                        <IconComponent />
                      </Link>
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>
          </div>

          {/* Right Panel - Scrollable Content */}
          <div className="w-[65%] relative">
            <div className="h-[90vh] relative flex items-center justify-end px-20 xl:px-24">
              <div
                className="transition-all duration-700 ease-out"
                style={{
                  opacity: 1 - scrollProgress,
                  transform: `translateX(${scrollProgress * 80}px)`,
                  pointerEvents: scrollProgress > 0.5 ? "none" : "auto",
                }}
              >
                <nav className="flex flex-col gap-5 items-end">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-xs text-[#a1a1a1] hover:text-[#fafafa] transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            {/* Projects Section */}
            <div className="px-12 xl:px-16 pb-24 space-y-16">
              {/* Selected Work */}
              <WorkSection title="Selected Work" projects={projects} />
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Gallery Section */}
      <GallerySection
        projects={galleryProjects}
        isMobile={isMobile}
        showAll={showAllGallery}
        onShowMore={() => setShowAllGallery(true)}
      />

      {/* Footer */}
      <motion.footer
        className="w-full bg-[#050505] border-t border-[#1a1a1a] py-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <p className="text-sm text-[#525252]">
              © {new Date().getFullYear()} Priyanshu Mahey
            </p>
            <div className="flex items-center gap-6">
              {socialLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                >
                  <Link
                    href={link.href}
                    className="text-xs text-[#737373] hover:text-[#fafafa] transition-colors uppercase tracking-wider"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}
