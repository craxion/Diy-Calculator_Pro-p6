"use client"

import { motion } from "framer-motion"
import type React from "react"

interface AnimatedOnScrollProps {
  children: React.ReactNode
  className?: string
  animationType?: "fade-in" | "slide-up-fade" | "slide-left-fade" | "slide-right-fade"
  delay?: number
  duration?: number
  style?: React.CSSProperties
}

export function AnimatedOnScroll({
  children,
  className,
  animationType = "fade-in",
  delay = 0,
  duration = 0.5,
  style,
}: AnimatedOnScrollProps) {
  const variants = {
    hidden: {
      opacity: 0,
      y: animationType === "slide-up-fade" ? 20 : 0,
      x: animationType === "slide-left-fade" ? -20 : animationType === "slide-right-fade" ? 20 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        delay,
        duration,
        ease: "easeOut",
      },
    },
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }} // Trigger when 20% of element is visible
      variants={variants}
      style={style}
    >
      {children}
    </motion.div>
  )
}
