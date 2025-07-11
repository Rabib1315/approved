'use client'

import { ReactNode } from "react"

interface FeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  bgColor?: string
  iconColor?: string
  className?: string
  index?: number
}

export const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  bgColor = "bg-gray-100",
  iconColor = "text-gray-600",
  className = "",
  index = 0
}: FeatureCardProps) => {
  return (
    <div
      className={`flex items-start space-x-3 p-3 ${bgColor} rounded-lg ${className}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={`w-8 h-8 ${bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  )
} 