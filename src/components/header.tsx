'use client'

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { NavigationMenu } from "@/components/navigation-menu"

interface HeaderProps {
  title?: string
  showBackButton?: boolean
  showMenuButton?: boolean
  onBackClick?: () => void
  onMenuClick?: () => void
  className?: string
}

export const Header = ({ 
  title = "VisaNavigator",
  showBackButton = false,
  showMenuButton = true,
  onBackClick,
  onMenuClick,
  className = ""
}: HeaderProps) => {
  const router = useRouter()

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick()
    } else {
      router.back()
    }
  }

  const handleMenuClick = () => {
    if (onMenuClick) {
      onMenuClick()
    }
  }

  return (
    <header className={`bg-white shadow-sm sticky top-0 z-50 ${className}`}>
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {showBackButton && (
            <button
              type="button"
              className="mr-2 p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 focus:outline-none"
              onClick={handleBackClick}
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 text-ca-blue" />
            </button>
          )}
          <div className="w-8 h-8 bg-ca-red rounded-full flex items-center justify-center">
            <span className="text-white text-sm">🍁</span>
          </div>
          <span className="font-semibold text-gray-800">{title}</span>
        </div>
        {showMenuButton && <NavigationMenu />}
      </div>
    </header>
  )
} 