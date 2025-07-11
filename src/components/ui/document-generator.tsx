"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Edit3 } from "lucide-react"
import { Button } from "./button"

interface DocumentGeneratorProps {
  icon: string
  title: string
  initialContent: string
  onGenerate: () => void
  placeholder?: string
  formattingTip?: string
  className?: string
}

export const DocumentGenerator = ({ 
  icon, 
  title, 
  initialContent, 
  onGenerate, 
  placeholder = "Enter your content...",
  formattingTip = "Formatting tips: Use clear paragraphs",
  className = ""
}: DocumentGeneratorProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(initialContent)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border border-gray-200 rounded-lg p-4 mb-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1 text-ca-blue hover:text-ca-blue/80 text-xs"
        >
          <Edit3 className="w-3 h-3" />
          Edit
        </button>
      </div>
      
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ca-blue"
            placeholder={placeholder}
          />
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{content.length} characters</span>
            <span>{formattingTip}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed max-h-32 overflow-y-auto">
            {content}
          </div>
          <Button
            onClick={onGenerate}
            className="w-full"
          >
            Generate {title}
          </Button>
        </div>
      )}
    </motion.div>
  )
} 