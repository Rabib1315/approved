import { Suspense } from "react"
import { Header } from "@/components/header"
import { BuilderContent } from "./components/builder-content"

export default function BuilderPage() {
  return (
    <>
      <Header title="Application Builder" showBackButton={true} />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Build Your Application</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <BuilderContent />
        </Suspense>
      </div>
    </>
  )
} 