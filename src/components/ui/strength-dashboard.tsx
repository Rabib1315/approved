"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ProgressBar } from "./progress-bar"

interface StrengthCategory {
  name: string
  score: number
  color: "green" | "yellow" | "red"
}

interface StrengthDashboardProps {
  categories: StrengthCategory[]
  overallScore?: number
  className?: string
}

export const StrengthDashboard = ({ 
  categories, 
  overallScore = 9.2,
  className = ""
}: StrengthDashboardProps) => {
  const [animatedScore, setAnimatedScore] = useState(0)
  
  useEffect(() => {
    // Animate the overall score
    const timer = setTimeout(() => {
      setAnimatedScore(overallScore)
    }, 500)
    return () => clearTimeout(timer)
  }, [overallScore])

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border border-gray-200 rounded-lg p-4 mb-6 ${className}`}
    >
      <div className="text-center mb-4">
        <motion.div 
          className="text-3xl font-bold text-gray-900 mb-1"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {animatedScore.toFixed(1)}/10
        </motion.div>
        <div className="text-sm text-gray-600">
          Stronger than 89% of successful student applicants
        </div>
      </div>
      
      <div className="space-y-3">
        {categories.map((category, index) => (
          <motion.div 
            key={category.name} 
            className="flex items-center justify-between"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <span className="text-sm text-gray-700">{category.name}</span>
            <div className="flex items-center gap-2 w-24">
              <ProgressBar 
                value={category.score} 
                max={100} 
                color={category.color} 
                size="sm"
                showLabel={false}
              />
              <span className="text-xs font-medium text-gray-600 w-8 text-right">
                {category.score}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
} 