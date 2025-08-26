"use client"

import { useState } from "react"
import { motion, Reorder, useDragControls } from "framer-motion"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface DraggableItemProps {
  children: React.ReactNode
  className?: string
  dragHandleClassName?: string
  showDragHandle?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
}

export function DraggableItem({
  children,
  className,
  dragHandleClassName,
  showDragHandle = true,
  onDragStart,
  onDragEnd
}: DraggableItemProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dragControls = useDragControls()

  const handleDragStart = () => {
    setIsDragging(true)
    onDragStart?.()
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    onDragEnd?.()
  }

  return (
    <motion.div
      className={cn(
        "relative group",
        isDragging && "z-50 rotate-2 scale-105",
        className
      )}
      dragControls={dragControls}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileDrag={{
        scale: 1.05,
        rotate: 2,
        zIndex: 50,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      {showDragHandle && (
        <div
          className={cn(
            "absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10",
            dragHandleClassName
          )}
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="p-1 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm border">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      )}
      {children}
    </motion.div>
  )
}

interface DraggableListProps<T> {
  items: T[]
  onReorder: (newOrder: T[]) => void
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  itemClassName?: string
}

export function DraggableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  className,
  itemClassName
}: DraggableListProps<T>) {
  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={onReorder}
      className={cn("space-y-4", className)}
    >
      {items.map((item, index) => (
        <Reorder.Item
          key={item.id}
          value={item}
          className={itemClassName}
          whileDrag={{
            scale: 1.05,
            rotate: 2,
            zIndex: 50,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        >
          <DraggableItem className="group">
            {renderItem(item, index)}
          </DraggableItem>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  )
}