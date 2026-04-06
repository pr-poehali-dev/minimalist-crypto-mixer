"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

const words = ["Здравствуйте", "Hello", "Hallo", "Bonjour", "Ciao", "Olà", "やあ", "Hallå", "مرحبا", "你好"]

interface PreloaderProps {
  onComplete?: () => void
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [index, setIndex] = useState(0)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    if (index === words.length - 1) {
      setTimeout(() => {
        setIsExiting(true)
        setTimeout(() => {
          document.body.style.overflow = ''
          onComplete?.()
        }, 900)
      }, 1000)
      return
    }

    setTimeout(
      () => {
        setIndex(index + 1)
      },
      index === 0 ? 1000 : 150,
    )
  }, [index, onComplete])

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: isExiting ? "-100%" : 0 }}
      transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 flex items-center justify-center z-[99999999999]"
      style={{
        width: '100vw',
        height: 'calc(100dvh + env(safe-area-inset-bottom, 0px))',
        background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)',
        willChange: 'transform',
      }}
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="flex items-center text-white text-4xl md:text-5xl lg:text-6xl absolute z-10 font-medium"
      >
        <span className="block w-2.5 h-2.5 bg-white rounded-full mr-2.5"></span>
        {words[index]}
      </motion.p>
    </motion.div>
  );
}
