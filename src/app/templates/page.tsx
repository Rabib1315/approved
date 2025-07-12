import { Header } from "@/components/header"
import { AITemplateGenerator } from "@/components/ai-template-generator"

export default function TemplatesPage() {
  return (
    <>
      <Header title="AI Template Generator" showBackButton={true} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <AITemplateGenerator />
        </div>
      </div>
    </>
  )
} 