"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { CheckCircle, ArrowLeft, Camera, UploadCloud } from "lucide-react"
import clsx from "clsx"

// Types
interface UploadCardProps {
  icon: string
  title: string
  description: string
  uploadedFile?: File | null
  onDrop: (files: File[]) => void
  onTakePhoto: () => void
}

const uploadCards = [
  {
    key: "acceptanceLetter",
    icon: "📄",
    title: "Acceptance Letter",
    description: "From your Canadian school",
  },
  {
    key: "bankStatements",
    icon: "💳",
    title: "Bank Statements",
    description: "Last 3-4 months of statements",
  },
  {
    key: "transcripts",
    icon: "🎓",
    title: "Academic Transcripts",
    description: "All previous education records",
  },
  {
    key: "passport",
    icon: "🛂",
    title: "Passport Photo Page",
    description: "Clear photo of your passport details",
  },
] as const

type UploadKey = typeof uploadCards[number]["key"]

type UploadState = {
  [K in UploadKey]: File | null
}

function UploadCard({ icon, title, description, uploadedFile, onDrop, onTakePhoto }: UploadCardProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) onDrop(acceptedFiles)
    },
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".jpg", ".jpeg", ".png", ".heic", ".webp"]
    },
    noClick: true,
  })

  return (
    <div
      {...getRootProps()}
      className={clsx(
        "rounded-xl p-4 mb-4 flex items-center border-2 transition-colors",
        uploadedFile
          ? "border-green-500 bg-green-50"
          : "border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 active:bg-gray-200",
        isDragActive && !uploadedFile && "border-ca-blue bg-blue-50"
      )}
      style={{ minHeight: 90 }}
    >
      <input {...getInputProps()} />
      <div className="flex-shrink-0 text-2xl mr-4 select-none">{icon}</div>
      <div className="flex-1">
        <div className="font-medium text-gray-900 flex items-center gap-1">
          {title}
          {uploadedFile && <CheckCircle className="w-4 h-4 text-green-500 ml-1" />}
        </div>
        <div className="text-xs text-gray-600 mb-2">{description}</div>
        {uploadedFile ? (
          <div className="text-xs text-green-700 font-medium truncate" title={uploadedFile.name}>
            {uploadedFile.name}
          </div>
        ) : (
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-ca-blue text-white text-xs font-semibold shadow hover:bg-ca-blue/90 active:bg-ca-blue/80 focus:outline-none focus:ring-2 focus:ring-ca-blue"
              onClick={e => {
                e.stopPropagation()
                // Open file dialog
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.pdf,image/*'
                input.onchange = (ev: any) => {
                  if (ev.target.files && ev.target.files[0]) {
                    onDrop([ev.target.files[0]])
                  }
                }
                input.click()
              }}
            >
              <UploadCloud className="w-4 h-4 mr-1" /> Upload Files
            </button>
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-1.5 rounded border border-ca-blue text-ca-blue text-xs font-semibold bg-white hover:bg-blue-50 active:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-ca-blue"
              onClick={e => {
                e.stopPropagation()
                onTakePhoto()
              }}
            >
              <Camera className="w-4 h-4 mr-1" /> Take Photo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function UploadPage() {
  const router = useRouter()
  const [uploads, setUploads] = useState<UploadState>({
    acceptanceLetter: null,
    bankStatements: null,
    transcripts: null,
    passport: null,
  })

  // Count uploaded
  const uploadedCount = Object.values(uploads).filter(Boolean).length
  const percent = Math.round((uploadedCount / 4) * 100)

  // Handlers
  const handleDrop = (key: UploadKey) => (files: File[]) => {
    setUploads(prev => ({ ...prev, [key]: files[0] }))
  }
  const handleTakePhoto = (key: UploadKey) => () => {
    // Mock: just open file dialog for image
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (ev: any) => {
      if (ev.target.files && ev.target.files[0]) {
        setUploads(prev => ({ ...prev, [key]: ev.target.files[0] }))
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
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 w-full bg-white border-b border-gray-200 flex items-center px-4 py-3" style={{ maxWidth: 400 }}>
        <button
          type="button"
          className="mr-2 p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 focus:outline-none"
          onClick={() => router.back()}
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-ca-blue" />
        </button>
        <h1 className="text-base font-semibold text-gray-900 flex-1 text-center ml-[-2.5rem]">Upload Your Documents</h1>
      </header>

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
            uploadedFile={uploads[card.key as UploadKey]}
            onDrop={handleDrop(card.key as UploadKey)}
            onTakePhoto={handleTakePhoto(card.key as UploadKey)}
          />
        ))}
      </div>

      {/* Bottom Sticky Section */}
      <div className="fixed bottom-0 left-0 w-full flex flex-col items-center bg-white border-t border-gray-200 z-30" style={{ maxWidth: 400, margin: '0 auto' }}>
        <div className="w-full px-4 py-3 flex flex-col items-center">
          <div className="text-sm text-gray-700 mb-2 text-center">
            {uploadedCount} of 4 documents uploaded - {percent}% complete
          </div>
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