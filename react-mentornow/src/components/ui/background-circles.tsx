"use client"

import { motion } from "framer-motion"

export function BackgroundCircles() {
  return (
    <>
      {/* Light mode background - clean gradients and subtle patterns */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 block dark:hidden">
        {/* Main gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50/80" />
        
        {/* Subtle diagonal pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-blue-100/20 to-transparent" />
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-transparent via-indigo-100/15 to-transparent" />
        </div>
        
        {/* Very subtle accent elements */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-tr from-indigo-100/25 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Dark mode background - blue animated circles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 dark:block hidden">
        {/* Large faded blue circle - top right */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/60 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Medium faded blue circle - bottom left */}
        <motion.div
          className="absolute -bottom-40 -left-40 w-60 h-60 bg-blue-300/70 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        
        {/* Small faded blue circle - center right */}
        <motion.div
          className="absolute -bottom-1 -right-20 w-40 h-40 bg-blue-500/80 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
        
        {/* Extra small faded blue circle - top center */}
        <motion.div
          className="absolute top-20 left-1/2 transform -translate-x-1/2 w-32 h-32 bg-blue-600/70 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        
        {/* Subtle blue glow in center */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-blue-600/15" />
      </div>
    </>
  )
}
