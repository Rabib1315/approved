import { Header } from "@/components/header"
import { AIChat } from "@/components/ai-chat"

export default function ChatPage() {
  return (
    <>
      <Header title="AI Chat Assistant" showBackButton={true} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Visa Assistant</h1>
            <p className="text-gray-600">
              Ask me anything about Canadian student visas, application requirements, 
              timelines, or any other questions you have about studying in Canada.
            </p>
          </div>
          <AIChat />
        </div>
      </div>
    </>
  )
} 