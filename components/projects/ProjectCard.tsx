"use client"

import { motion } from "framer-motion"
import { Lock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"

export interface ProjectData {
  title: string
  description: string
  year: string
  link: string
  image: string
  hoverImage?: string
  hoverVideo?: string
  isPrivate?: boolean
}

interface ProjectCardProps {
  project: ProjectData
  index: number
  variant?: "large" | "small" | "gallery"
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: index * 0.1,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
}

const imageVariants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { duration: 0.7, ease: "easeOut" as const }
  },
}

export function ProjectCard({ project, index, variant = "large" }: ProjectCardProps) {
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

  const aspectClass = variant === "large" 
    ? "aspect-video" 
    : variant === "gallery" 
      ? "aspect-4/3" 
      : "aspect-4/3"

  const currentImage = isHovered && project.hoverImage ? project.hoverImage : project.image
  const hasHoverMedia = !!(project.hoverImage || project.hoverVideo)

  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={cardVariants}
    >
      <Link
        href={project.link}
        className="block group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          className={`relative ${aspectClass} rounded-xl overflow-hidden bg-[#0f0f0f] mb-4`}
          initial="rest"
          whileHover="hover"
          animate="rest"
        >
          {/* Base image */}
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: isHovered && project.hoverImage ? 0 : 1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <Image
              src={project.image}
              alt={project.title}
              fill
              loading="eager"
              priority={index === 0}
              sizes={variant === "large" ? "(max-width: 1024px) 100vw, 65vw" : "(max-width: 1024px) 100vw, 50vw"}
              className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
            />
          </motion.div>
          
          {/* Hover image (if exists) */}
          {project.hoverImage && (
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <Image
                src={project.hoverImage}
                alt={`${project.title} hover`}
                fill
                loading="eager"
                sizes={variant === "large" ? "(max-width: 1024px) 100vw, 65vw" : "(max-width: 1024px) 100vw, 50vw"}
                className="object-cover"
              />
            </motion.div>
          )}
          
          {/* Hover video (if exists) */}
          {project.hoverVideo && (
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
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
          
          {/* Zoom effect container */}
          <motion.div
            className="absolute inset-0"
            variants={imageVariants}
          />
        </motion.div>

        {/* Content */}
        <div className="flex items-baseline justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            {project.isPrivate && (
              <Lock className="w-3.5 h-3.5 text-[#525252] flex-shrink-0" />
            )}
            <h3 className="text-lg font-normal text-[#fafafa] group-hover:text-[#d4d4d4] transition-colors truncate">
              {project.title}
            </h3>
          </div>
          <span className="text-sm text-[#737373] flex-shrink-0">{project.year}</span>
        </div>
        
        <p className="text-sm text-[#737373] mt-1 line-clamp-2">
          {project.description}
        </p>
      </Link>
    </motion.div>
  )
}
