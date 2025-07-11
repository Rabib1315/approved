'use client'

import clsx from "clsx"

interface ProgressBarProps {
  value: number
  max?: number
  color?: "blue" | "green" | "yellow" | "red" | "gray"
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

export const ProgressBar = ({ 
  value, 
  max = 100, 
  color = "blue",
  size = "md",
  showLabel = false,
  className = ""
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  const colorClasses = {
    blue: "bg-ca-blue",
    green: "bg-green-500", 
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    gray: "bg-gray-500"
  }

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3"
  }

  return (
    <div className={clsx("w-full", className)}>
      <div className={clsx("w-full bg-gray-200 rounded-full", sizeClasses[size])}>
        <div 
          className={clsx("rounded-full transition-all duration-1000 ease-out", colorClasses[color], sizeClasses[size])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-600">{value}/{max}</span>
          <span className="text-xs font-medium text-gray-600">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  )
} 