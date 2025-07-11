'use client'

import { ReactNode } from "react"

interface StatsCardProps {
  value: string | number
  label: string
  icon?: ReactNode
  color?: "blue" | "green" | "purple" | "orange"
  className?: string
  index?: number
}

export const StatsCard = ({ 
  value, 
  label, 
  icon,
  color = "blue",
  className = "",
  index = 0
}: StatsCardProps) => {
  const colorClasses = {
    blue: "text-ca-blue",
    green: "text-green-600",
    purple: "text-purple-600", 
    orange: "text-orange-600"
  }

  return (
    <div
      className={`text-center ${className}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={`text-2xl font-bold ${colorClasses[color]} flex items-center justify-center`}>
        {icon && <span className="mr-1">{icon}</span>}
        {value}
      </div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  )
} 