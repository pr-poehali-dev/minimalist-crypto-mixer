"use client"

import { useEffect, useState, useCallback } from "react"

const words = ["Здравствуйте", "Hello", "Hallo", "Bonjour", "Ciao", "Olà", "やあ", "Hallå", "مرحبا", "你好"]

interface PreloaderProps {
  onComplete?: () => void
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'words' | 'fadeout' | 'done'>('words')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    if (phase !== 'words') return
    if (index === words.length - 1) {
      const t = setTimeout(() => setPhase('fadeout'), 800)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setIndex(i => i + 1), index === 0 ? 1000 : 150)
    return () => clearTimeout(t)
  }, [index, phase])

  const handleTransitionEnd = useCallback(() => {
    if (phase === 'fadeout') {
      setPhase('done')
      document.body.style.overflow = ''
      onComplete?.()
    }
  }, [phase, onComplete])

  if (phase === 'done') return null

  return (
    <div
      onTransitionEnd={handleTransitionEnd}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)',
        opacity: phase === 'fadeout' ? 0 : 1,
        transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <p
        style={{
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 500,
          opacity: 0.8,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <span
          style={{
            display: 'block',
            width: 10,
            height: 10,
            backgroundColor: 'white',
            borderRadius: '50%',
            marginRight: 10,
          }}
        />
        {words[index]}
      </p>
    </div>
  )
}
