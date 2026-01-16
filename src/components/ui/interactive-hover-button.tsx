"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

export function InteractiveHoverButton({
  text = "Button",
  className,
  children,
  ...props
}: InteractiveHoverButtonProps) {
  return (
    <motion.button
      initial={{ "--x": "100%", scale: 1 } as any}
      animate={{ "--x": "-100%" } as any}
      whileTap={{ scale: 0.97 }}
      transition={{
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: 1,
        type: "spring",
        stiffness: 20,
        damping: 15,
        mass: 2,
        scale: {
          type: "spring",
          stiffness: 200,
          damping: 5,
          mass: 0.5,
        },
      }}
      className={cn(
        "relative rounded-md bg-black px-6 py-2 font-medium text-white transition-colors hover:bg-black/90",
        "radial-gradient",
        className
      )}
      {...props}
    >
      <span
        className="relative linear-mask block h-full w-full font-light tracking-wide text-white"
        style={{
          maskImage:
            "linear-gradient(-75deg, white calc(var(--x) + 20%), transparent calc(var(--x) + 30%), white calc(var(--x) + 100%))",
        }}
      >
        {children || text}
      </span>
      <span
        className="absolute inset-0 block rounded-md p-px linear-overlay"
        style={{
          backgroundImage:
            "linear-gradient(-75deg, rgba(255,255,255,0.1) calc(var(--x) + 20%), rgba(255,255,255,0.5) calc(var(--x) + 25%), rgba(255,255,255,0.1) calc(var(--x) + 100%))",
        }}
      />
    </motion.button>
  );
}
