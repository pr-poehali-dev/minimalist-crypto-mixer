'use client';
import { ArrowRight } from 'lucide-react';

export function FlowButton({ text = "Modern Button" }: { text?: string }) {
  return (
    <button className="group relative flex w-full items-center justify-center gap-1 overflow-hidden rounded-full border-[1.5px] border-[#333333]/40 bg-transparent px-8 py-3 text-sm font-semibold text-[#111111] cursor-pointer transition-all duration-500 ease-out hover:border-transparent hover:text-white hover:rounded-xl active:scale-[0.97] active:border-transparent active:text-white active:rounded-xl">
      <ArrowRight
        className="absolute w-4 h-4 left-[-25%] stroke-[#111111] fill-none z-[9] transition-all duration-500 ease-out group-hover:left-4 group-hover:stroke-white group-active:left-4 group-active:stroke-white"
      />

      <span className="relative z-[1] -translate-x-3 transition-all duration-500 ease-out group-hover:translate-x-3 group-active:translate-x-3">
        {text}
      </span>

      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#111111] rounded-full opacity-0 transition-all duration-500 ease-out group-hover:w-[220px] group-hover:h-[220px] group-hover:opacity-100 group-active:w-[220px] group-active:h-[220px] group-active:opacity-100"></span>

      <ArrowRight
        className="absolute w-4 h-4 right-4 stroke-[#111111] fill-none z-[9] transition-all duration-500 ease-out group-hover:right-[-25%] group-hover:stroke-white group-active:right-[-25%] group-active:stroke-white"
      />
    </button>
  );
}