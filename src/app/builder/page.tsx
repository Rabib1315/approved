import { Suspense } from "react"
import { Header } from "@/components/header"
import { BuilderContent } from "./components/builder-content"
import { AIInsights } from "@/components/ai-insights"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function BuilderPage() {
  return (
    <>
      <Header title="Application Builder" showBackButton={true} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Build Your Application</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Builder Content */}
            <div className="lg:col-span-2">
              <Suspense fallback={<LoadingSpinner />}>
                <BuilderContent />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 