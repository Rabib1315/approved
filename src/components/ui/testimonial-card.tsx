'use client'

import { Card, CardContent } from "@/components/ui/card"
import { User, Star } from "lucide-react"

interface TestimonialCardProps {
  name: string
  location: string
  rating: number
  text: string
  avatar?: string
  className?: string
}

export const TestimonialCard = ({ 
  name, 
  location, 
  rating, 
  text, 
  avatar,
  className = ""
}: TestimonialCardProps) => {
  return (
    <div className={className}>
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
              {avatar ? (
                <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-gray-600" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{name}</h3>
              <div className="flex items-center">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${i < rating ? 'fill-current' : ''}`} 
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">{location}</span>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-700 italic leading-relaxed">
            "{text}"
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 