"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface FileNode {
  name: string
  type: "file" | "folder"
  children?: FileNode[]
  extension?: string
}

interface FileTreeProps {
  data: FileNode[]
  className?: string
}

interface FileItemProps {
  node: FileNode
  depth: number
  isLast: boolean
  parentPath: boolean[]
}

const getFileIcon = (extension?: string) => {
  const iconMap: Record<string, { color: string; icon: string }> = {
    tsx: { color: "text-[#3178c6]", icon: "⚛" },
    ts: { color: "text-[#3178c6]", icon: "◆" },
    jsx: { color: "text-[#61dafb]", icon: "⚛" },
    js: { color: "text-[#f7df1e]", icon: "◆" },
    css: { color: "text-[#a78bfa]", icon: "◈" },
    json: { color: "text-[#f7df1e]", icon: "{}" },
    md: { color: "text-gray-500", icon: "◊" },
    svg: { color: "text-[#10b981]", icon: "◐" },
    png: { color: "text-[#10b981]", icon: "◑" },
    default: { color: "text-gray-500", icon: "◇" },
  }
  return iconMap[extension || "default"] || iconMap.default
}

function FileItem({ node, depth, isLast, parentPath }: FileItemProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  const isFolder = node.type === "folder"
  const hasChildren = isFolder && node.children && node.children.length > 0
  const fileIcon = getFileIcon(node.extension)

  return (
    <div className="select-none">
      <div
        className={cn(
          "group relative flex items-center gap-3 py-2 px-3 rounded-md cursor-pointer",
          "transition-all duration-200 ease-out",
          isHovered && "bg-black/5",
        )}
        onClick={() => isFolder && setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
      >
        {depth > 0 && (
          <div className="absolute left-0 top-0 bottom-0 flex" style={{ left: `${(depth - 1) * 24 + 22}px` }}>
            <div className={cn("w-px transition-colors [transition-duration:var(--default-transition-duration)]", isHovered ? "bg-black/30" : "bg-black/10")} />
          </div>
        )}

        <div
          className={cn(
            "flex items-center justify-center w-4 h-4 transition-transform [transition-duration:var(--default-transition-duration)] [transition-timing-function:var(--ease-out)]",
            isFolder && isOpen && "rotate-90",
          )}
        >
          {isFolder ? (
            <svg
              width="8"
              height="10"
              viewBox="0 0 6 8"
              fill="none"
              className={cn("transition-colors [transition-duration:var(--default-transition-duration)]", isHovered ? "text-black" : "text-gray-400")}
            >
              <path
                d="M1 1L5 4L1 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <span className={cn("text-xs transition-opacity [transition-duration:var(--default-transition-duration)]", fileIcon.color)}>{fileIcon.icon}</span>
          )}
        </div>

        <div
          className={cn(
            "flex items-center justify-center w-5 h-5 rounded transition-all [transition-duration:var(--default-transition-duration)]",
            isFolder
              ? "text-black/80"
              : cn(fileIcon.color),
          )}
        >
          {isFolder ? (
            <svg width="18" height="16" viewBox="0 0 16 14" fill="currentColor">
              <path d="M1.5 1C0.671573 1 0 1.67157 0 2.5V11.5C0 12.3284 0.671573 13 1.5 13H14.5C15.3284 13 16 12.3284 16 11.5V4.5C16 3.67157 15.3284 3 14.5 3H8L6.5 1H1.5Z" />
            </svg>
          ) : (
            <svg width="16" height="18" viewBox="0 0 14 16" fill="currentColor" opacity="0.9">
              <path d="M1.5 0C0.671573 0 0 0.671573 0 1.5V14.5C0 15.3284 0.671573 16 1.5 16H12.5C13.3284 16 14 15.3284 14 14.5V4.5L9.5 0H1.5Z" />
              <path d="M9 0V4.5H14" fill="currentColor" fillOpacity="0.5" />
            </svg>
          )}
        </div>

        <span
          className={cn(
            "text-sm transition-colors [transition-duration:var(--default-transition-duration)] font-[family-name:var(--default-mono-font-family)]",
            isFolder
              ? "text-gray-800 font-medium"
              : "text-gray-600",
          )}
        >
          {node.name}
        </span>
      </div>

      {hasChildren && (
        <div
          className={cn(
            "overflow-hidden transition-all duration-300 [transition-timing-function:var(--ease-out)]",
            isOpen ? "opacity-100" : "opacity-0 h-0",
          )}
          style={{
            maxHeight: isOpen ? `${node.children!.length * 100}px` : "0px",
          }}
        >
          {node.children!.map((child, index) => (
            <FileItem
              key={child.name}
              node={child}
              depth={depth + 1}
              isLast={index === node.children!.length - 1}
              parentPath={[...parentPath, !isLast]}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function FileTree({ data, className }: FileTreeProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-black/10 p-3 shadow-lg",
        className,
      )}
    >
      <div className="flex items-center gap-2 pb-4 mb-3 border-b border-black/10">
        <div className="flex gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f56]" />
          <div className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e]" />
          <div className="w-3.5 h-3.5 rounded-full bg-[#27c93f]" />
        </div>
        <span className="text-sm text-gray-500 ml-2 font-[family-name:var(--default-mono-font-family)]">explorer</span>
      </div>

      <div className="space-y-0.5">
        {data.map((node, index) => (
          <FileItem key={node.name} node={node} depth={0} isLast={index === data.length - 1} parentPath={[]} />
        ))}
      </div>
    </div>
  )
}