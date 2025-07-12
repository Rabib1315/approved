"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet"
import { 
  Menu, 
  Upload, 
  FileText, 
  Bot, 
  Brain, 
  MessageSquare,
  Home,
  CheckCircle,
  Package,
  Settings
} from "lucide-react"
import { useRouter } from "next/navigation"

export const NavigationMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const menuItems = [
    {
      icon: <Home className="h-5 w-5" />,
      title: "Home",
      description: "Landing page",
      href: "/",
      color: "text-blue-600"
    },
    {
      icon: <Upload className="h-5 w-5" />,
      title: "Upload Documents",
      description: "Upload and manage your documents",
      href: "/upload",
      color: "text-green-600"
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Application Builder",
      description: "Build your visa application",
      href: "/builder",
      color: "text-purple-600"
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      title: "Review Application",
      description: "Review and finalize your application",
      href: "/review",
      color: "text-orange-600"
    },
    {
      icon: <Package className="h-5 w-5" />,
      title: "Generate Package",
      description: "Create your final application package",
      href: "/package",
      color: "text-red-600"
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: "AI Template Generator",
      description: "Generate personalized application templates",
      href: "/templates",
      color: "text-indigo-600"
    },
    {
      icon: <Bot className="h-5 w-5" />,
      title: "AI Test Page",
      description: "Test AI features and insights",
      href: "/ai-test",
      color: "text-pink-600"
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "AI Chat Assistant",
      description: "Get answers to your visa questions",
      href: "/chat",
      color: "text-teal-600"
    }
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
          <Menu className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="w-6 h-6 bg-ca-red rounded-full flex items-center justify-center">
              <span className="text-white text-xs">🍁</span>
            </div>
            VisaNavigator
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <div className="text-sm text-gray-500 mb-4">
            AI-Powered Canadian Student Visa Assistant
          </div>
          
          {menuItems.map((item, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleNavigation(item.href)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`${item.color}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="pt-4 border-t">
            <div className="text-xs text-gray-400 text-center">
              Powered by Claude AI • Secure & Confidential
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 