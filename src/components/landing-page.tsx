'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, GraduationCap, Bot, Clock, Headphones, Star, Shield, ArrowRight, Facebook, Twitter, Instagram } from "lucide-react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { FeatureCard } from "@/components/ui/feature-card"
import { StatsCard } from "@/components/ui/stats-card"
import { TestimonialCard } from "@/components/ui/testimonial-card"
import { AIChat } from "@/components/ai-chat"

export function LandingPage() {
  const router = useRouter()

  const handleNavigateToUpload = (e?: React.MouseEvent) => {
    if (e) e.preventDefault()
    router.push("/upload")
  }

  const features = [
    {
      icon: <Check className="w-4 h-4" />,
      title: "Document Checklist",
      description: "Get a personalized list of required documents for your specific situation",
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      icon: <Bot className="w-4 h-4" />,
      title: "AI Form Helper", 
      description: "Smart assistance to fill out complex government forms correctly",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: <Clock className="w-4 h-4" />,
      title: "Real-time Updates",
      description: "Track your application status and get notified of any changes",
      bgColor: "bg-purple-100", 
      iconColor: "text-purple-600"
    },
    {
      icon: <Headphones className="w-4 h-4" />,
      title: "Expert Support",
      description: "Get help from licensed immigration consultants when needed",
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600"
    }
  ]

  const stats = [
    { value: "2,847", label: "Students Helped" },
    { value: "4.9", label: "Average Rating", icon: <Star className="w-4 h-4 text-yellow-400 fill-current" /> },
    { value: "94%", label: "Success Rate" }
  ]

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen relative">
      <Header />

      {/* Hero Section */}
      <section className="px-4 py-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-ca-red rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Get Your Canadian Student Visa</h1>
          <p className="text-gray-600 text-sm leading-relaxed">Skip the confusion. Our AI-powered assistant guides you through every step of your study permit application.</p>
        </div>
        
        <Button 
          onClick={handleNavigateToUpload}
          className="w-full bg-ca-blue text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
        >
          Start Your Application
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </section>

      {/* Key Features */}
      <section className="px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Why Choose VisaNavigator?</h2>
        <div className="space-y-4">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              bgColor={feature.bgColor}
              iconColor={feature.iconColor}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-4 py-6 bg-gray-50">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Trusted by Students Worldwide</h2>
          <div className="flex justify-center space-x-6">
            {stats.map((stat, index) => (
              <StatsCard
                key={index}
                value={stat.value}
                label={stat.label}
                icon={stat.icon}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* AI Chat Assistant */}
      <section className="px-4 py-6">
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Ask Our AI Assistant</h2>
          <p className="text-gray-600 text-sm">Get instant answers to your visa questions</p>
        </div>
        <AIChat />
      </section>

      {/* Testimonial */}
      <section className="px-4 py-6">
        <TestimonialCard
          name="Sarah Chen"
          location="Toronto, ON"
          rating={5}
          text="VisaNavigator made the entire process so much easier. I was confused about which documents I needed, but their checklist was perfect. Got my study permit approved in just 6 weeks!"
        />
      </section>

      {/* Comparison Table */}
      <section className="px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">Why Not Go Elsewhere?</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Gov Site</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Lawyers</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-ca-blue uppercase tracking-wider">VisaNavigator</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-3 py-2 text-sm text-gray-900">Guidance</td>
                <td className="px-3 py-2 text-center">
                  <span className="text-red-500">✕</span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="text-green-500">✓</span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="text-green-500">✓</span>
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-sm text-gray-900">Cost</td>
                <td className="px-3 py-2 text-center text-xs text-gray-600">Free</td>
                <td className="px-3 py-2 text-center text-xs text-gray-600">$2000+</td>
                <td className="px-3 py-2 text-center text-xs text-ca-blue font-medium">$99</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-sm text-gray-900">Speed</td>
                <td className="px-3 py-2 text-center text-xs text-gray-600">Slow</td>
                <td className="px-3 py-2 text-center text-xs text-gray-600">Medium</td>
                <td className="px-3 py-2 text-center text-xs text-ca-blue font-medium">Fast</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-sm text-gray-900">24/7 Support</td>
                <td className="px-3 py-2 text-center">
                  <span className="text-red-500">✕</span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="text-red-500">✕</span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="text-green-500">✓</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-8 bg-gradient-to-br from-ca-blue to-blue-700">
        <div className="text-center text-white">
          <h2 className="text-xl font-bold mb-2">Ready to Start Your Journey?</h2>
          <p className="text-blue-100 text-sm mb-6">Join thousands of students who've successfully obtained their Canadian study permits</p>
          <Button 
            onClick={handleNavigateToUpload}
            className="w-full bg-white text-ca-blue py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Get Started Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-blue-200 text-xs mt-3">
            <Shield className="w-3 h-3 inline mr-1" />
            Secure & Confidential • Money-back Guarantee
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-6 bg-gray-800 text-center">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <div className="w-6 h-6 bg-ca-red rounded-full flex items-center justify-center">
            <span className="text-white text-xs">🍁</span>
          </div>
          <span className="text-white font-medium">VisaNavigator</span>
        </div>
        <p className="text-gray-400 text-xs mb-2">Making Canadian dreams accessible</p>
        <div className="flex justify-center space-x-4 text-gray-400">
          <a href="#" className="hover:text-white transition-colors">
            <Facebook className="w-4 h-4" />
          </a>
          <a href="#" className="hover:text-white transition-colors">
            <Twitter className="w-4 h-4" />
          </a>
          <a href="#" className="hover:text-white transition-colors">
            <Instagram className="w-4 h-4" />
          </a>
        </div>
      </footer>
    </div>
  )
} 