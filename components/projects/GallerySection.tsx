"use client"

import { motion } from "framer-motion"
import { Lock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { ProjectData } from "./ProjectCard"

interface GallerySectionProps {
  projects: ProjectData[]
  isMobile: boolean
  showAll?: boolean
  onShowMore?: () => void
}

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: index * 0.08,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
}

function GalleryItem({ 
  project, 
  index, 
  isFirst = false 
}: { 
  project: ProjectData
  index: number
  isFirst?: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      if (isHovered) {
        videoRef.current.play().catch(() => {
          // Autoplay might be blocked, that's okay
        })
      } else {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
      }
    }
  }, [isHovered])

  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={itemVariants}
    >
      <Link
        href={project.link}
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div 
          className={`relative rounded-xl overflow-hidden bg-[#0a0a0a] ${isFirst ? 'aspect-4/3 lg:aspect-2/1' : 'aspect-4/3'}`}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.4 }}
        >
          {/* Base image */}
          <motion.div
            className="absolute inset-0"
            animate={{ 
              opacity: isHovered && (project.hoverImage || project.hoverVideo || project.hoverComponent) ? 0 : 0.9,
              scale: isHovered ? 1.05 : 1 
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Image
              src={project.image}
              alt={project.title}
              fill
              loading="eager"
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>

          {/* Base component overlay (if exists) */}
          {project.baseComponent && (
            <motion.div
              className="absolute inset-0 select-none pointer-events-none"
              animate={{ 
                opacity: isHovered && project.hoverComponent ? 0 : 1,
                scale: isHovered ? 1.05 : 1 
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {project.baseComponent}
            </motion.div>
          )}
          
          {/* Hover image */}
          {project.hoverImage && (
            <motion.div
              className="absolute inset-0"
              animate={{ 
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1.05 : 1 
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Image
                src={project.hoverImage}
                alt={`${project.title} hover`}
                fill
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </motion.div>
          )}
          
          {/* Hover video */}
          {project.hoverVideo && (
            <motion.div
              className="absolute inset-0"
              animate={{ 
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1.05 : 1 
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <video
                ref={videoRef}
                src={project.hoverVideo}
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          {/* Hover component (if exists) */}
          {project.hoverComponent && (
            <motion.div
              className="absolute inset-0 select-none pointer-events-none z-10"
              animate={{ 
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1.05 : 1 
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {project.hoverComponent}
            </motion.div>
          )}
        </motion.div>
        
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            {project.isPrivate && (
              <Lock className="w-3 h-3 text-[#525252] flex-shrink-0" />
            )}
            <h3 className="text-base font-medium text-[#fafafa] group-hover:text-[#d4d4d4] transition-colors truncate">
              {project.title}
            </h3>
          </div>
          <p className="text-xs text-[#737373] uppercase tracking-wider whitespace-nowrap shrink-0">
            {project.year}
          </p>
        </div>
        <p className="text-sm text-[#737373] mt-1 line-clamp-2">
          {project.description}
        </p>
      </Link>
    </motion.div>
  )
}

export function GallerySection({ 
  projects, 
  isMobile, 
  showAll = false, 
  onShowMore 
}: GallerySectionProps) {
  const leftColumnProjects = projects.filter((_, index) => index % 2 === 0)
  const rightColumnProjects = projects.filter((_, index) => index % 2 === 1)
  
  // On mobile, show all projects in a single column (limited if showAll is false)
  const displayedMobileProjects = !showAll 
    ? projects.slice(0, 6) 
    : projects

  return (
    <div className="w-full bg-[#050505] border-t border-[#1a1a1a]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-24">
        {/* Mobile: Single column with all projects */}
        <div className="flex flex-col gap-12 lg:hidden">
          {displayedMobileProjects.map((project, i) => (
            <GalleryItem
              key={project.title}
              project={project}
              index={i}
              isFirst={i === 0}
            />
          ))}
        </div>

        {/* Desktop: Two columns */}
        <div className="hidden lg:flex flex-row gap-8">
          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-12">
            {leftColumnProjects.map((project, i) => (
              <GalleryItem
                key={project.title}
                project={project}
                index={i * 2}
                isFirst={i === 0}
              />
            ))}
          </div>
          
          {/* Right Column */}
          <div className="flex-1 flex flex-col gap-12">
            {rightColumnProjects.map((project, i) => (
              <GalleryItem
                key={project.title}
                project={project}
                index={i * 2 + 1}
              />
            ))}
          </div>
        </div>
        
        {/* Show More Button */}
        {isMobile && !showAll && projects.length > 6 && onShowMore && (
          <motion.div 
            className="mt-12 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              onClick={onShowMore}
              className="px-6 py-3 text-sm text-[#a1a1a1] border border-[#333] rounded-full hover:text-[#fafafa] hover:border-[#555] transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Show more projects
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
