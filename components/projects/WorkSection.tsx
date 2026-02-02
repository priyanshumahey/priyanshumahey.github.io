"use client"

import { motion } from "framer-motion"
import { ProjectCard, ProjectData } from "./ProjectCard"

interface WorkSectionProps {
  title: string
  projects: ProjectData[]
  className?: string
}

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const titleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
}

export function WorkSection({ title, projects, className = "" }: WorkSectionProps) {
  return (
    <motion.section
      className={`space-y-8 ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={sectionVariants}
    >
      <motion.p
        className="text-xs uppercase tracking-wider text-neutral-500 dark:text-[#a1a1a1]"
        variants={titleVariants}
      >
        {title}
      </motion.p>
      <div className="space-y-16">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.title}
            project={project}
            index={index}
            variant="large"
          />
        ))}
      </div>
    </motion.section>
  )
}
