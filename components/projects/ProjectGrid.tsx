"use client"

import { motion } from "framer-motion"
import { ProjectCard, ProjectData } from "./ProjectCard"

interface ProjectGridProps {
  projects: ProjectData[]
  columns?: 1 | 2
  className?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export function ProjectGrid({ projects, columns = 2, className = "" }: ProjectGridProps) {
  const gridClass = columns === 2 ? "grid grid-cols-1 lg:grid-cols-2 gap-8" : "grid grid-cols-1 gap-8"
  
  return (
    <motion.div
      className={`${gridClass} ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={containerVariants}
    >
      {projects.map((project, index) => (
        <ProjectCard
          key={project.title}
          project={project}
          index={index}
          variant="small"
        />
      ))}
    </motion.div>
  )
}
