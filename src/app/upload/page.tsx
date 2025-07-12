"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import clsx from "clsx"
import { useMutation } from "@tanstack/react-query"
import { uploadDocument } from "@/actions/upload-actions"
import { Header } from "@/components/header"
import { UploadCard } from "@/components/ui/upload-card"
import { ProgressBar } from "@/components/ui/progress-bar"
import { AIDocumentAnalyzer } from "@/components/ai-document-analyzer"

// Types
type UploadKey = "acceptanceLetter" | "bankStatements" | "transcripts" | "passport"

type UploadState = {
  [K in UploadKey]: File | null
}

const uploadCards = [
  {
    key: "acceptanceLetter" as UploadKey,
    icon: "📄",
    title: "Acceptance Letter",
    description: "From your Canadian school",
  },
  {
    key: "bankStatements" as UploadKey,
    icon: "💳",
    title: "Bank Statements",
    description: "Last 3-4 months of statements",
  },
  {
    key: "transcripts" as UploadKey,
    icon: "🎓",
    title: "Academic Transcripts",
    description: "All previous education records",
  },
  {
    key: "passport" as UploadKey,
    icon: "🛂",
    title: "Passport Photo Page",
    description: "Clear photo of your passport details",
  },
] as const

export default function UploadPage() {
  const router = useRouter()
  const [uploads, setUploads] = useState<UploadState>({
    acceptanceLetter: null,
    bankStatements: null,
    transcripts: null,
    passport: null,
  })

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: { file: File; type: string }) => {
      const formData = new FormData()
      formData.append("file", data.file)
      formData.append("type", data.type)
      return uploadDocument(formData)
    },
    onSuccess: () => {
      console.log("Document uploaded successfully")
    },
    onError: (error) => {
      console.error("Upload failed:", error)
    }
  })

  // Count uploaded
  const uploadedCount = Object.values(uploads).filter(Boolean).length
  const percent = Math.round((uploadedCount / 4) * 100)

  // Handlers
  const handleDrop = (key: UploadKey) => (files: File[]) => {
    const file = files[0]
    setUploads(prev => ({ ...prev, [key]: file }))
    
    // Upload to backend
    uploadMutation.mutate({
      file,
      type: key
    })
  }
  
  const handleTakePhoto = (key: UploadKey) => () => {
    // Mock: just open file dialog for image
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (ev: any) => {
      if (ev.target.files && ev.target.files[0]) {
        const file = ev.target.files[0]
        setUploads(prev => ({ ...prev, [key]: file }))
        
        // Upload to backend
        uploadMutation.mutate({
          file,
          type: key
        })
      }
    }
    input.click()
  }

  const handleContinueToAnalysis = () => {
    router.push("/review")
  }

  const handleSkipUploads = () => {
    router.push("/review")
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start max-w-[400px] mx-auto pb-32 relative">
      <Header 
        title="Upload Your Documents"
        showBackButton={true}
        showMenuButton={false}
        className="border-b border-gray-200"
      />

      {/* Subtitle */}
      <div className="w-full px-4 pt-5 pb-2">
        <div className="text-sm text-gray-700 font-medium mb-2 text-center">
          Upload your key documents first - we'll extract all the details automatically
        </div>
        {/* Blue Callout */}
        <div className="bg-ca-blue/10 text-ca-blue text-xs rounded-lg px-3 py-2 flex items-center gap-2 mb-2">
          <span className="text-lg">💡</span>
          <span>Analyzing your documents will save you 15 minutes of form filling!</span>
        </div>
      </div>

      {/* Upload Cards */}
      <div className="w-full px-4 flex flex-col gap-2 mt-2">
        {uploadCards.map(card => (
          <UploadCard
            key={card.key}
            icon={card.icon}
            title={card.title}
            description={card.description}
            uploadedFile={uploads[card.key]}
            onDrop={handleDrop(card.key)}
            onTakePhoto={handleTakePhoto(card.key)}
          />
        ))}
      </div>

      {/* AI Document Analyzer */}
      {uploadedCount > 0 && (
        <div className="w-full px-4 mt-6">
          <AIDocumentAnalyzer />
        </div>
      )}

      {/* Bottom Sticky Section */}
      <div className="fixed bottom-0 left-0 w-full flex flex-col items-center bg-white border-t border-gray-200 z-30" style={{ maxWidth: 400, margin: '0 auto' }}>
        <div className="w-full px-4 py-3 flex flex-col items-center">
          <div className="text-sm text-gray-700 mb-2 text-center">
            {uploadedCount} of 4 documents uploaded - {percent}% complete
          </div>
          <ProgressBar 
            value={uploadedCount} 
            max={4} 
            color="blue" 
            showLabel={false}
            className="mb-3"
          />
          <button
            type="button"
            className={clsx(
              "w-full py-3 rounded-lg font-semibold text-white bg-ca-blue shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed",
              uploadedCount === 0 && "bg-ca-blue/60"
            )}
            disabled={uploadedCount === 0}
            onClick={handleContinueToAnalysis}
          >
            Continue with AI Analysis
          </button>
          <button
            type="button"
            className="mt-2 text-xs text-ca-blue underline hover:text-ca-blue/80 focus:outline-none"
            onClick={handleSkipUploads}
          >
            Skip uploads - I'll enter details manually
          </button>
        </div>
      </div>
    </div>
  )
} 