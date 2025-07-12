"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, AlertTriangle, Edit3, Download, FileText, FolderOpen, Loader2 } from "lucide-react"
import clsx from "clsx"
import { useQuery, useMutation } from "@tanstack/react-query"
import { getApplications, calculateApplicationStrength } from "@/actions/visa-actions"
import { getDocuments } from "@/actions/upload-actions"

// Types
interface StrengthCategory {
  name: string
  score: number
  color: "green" | "yellow" | "red"
}

interface DocumentStatus {
  name: string
  status: "completed" | "warning" | "missing"
  uploaded?: boolean
}

interface GeneratedDocument {
  name: string
  generated: boolean
  loading?: boolean
}

function ProgressBar({ score, color }: { score: number; color: string }) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "green": return "bg-green-500"
      case "yellow": return "bg-yellow-500"
      case "red": return "bg-red-500"
      default: return "bg-gray-300"
    }
  }

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={clsx("h-2 rounded-full transition-all duration-1000 ease-out", getColorClasses(color))}
        style={{ width: `${score}%` }}
      />
    </div>
  )
}

function StrengthDashboard({ applicationId }: { applicationId?: number }) {
  const [overallScore, setOverallScore] = useState(0)
  const [breakdown, setBreakdown] = useState({
    institutionQuality: 0,
    financialFit: 0,
    userProfile: 0,
    programFit: 0,
    documentCompleteness: 0,
  })

  const { data: strengthData } = useQuery({
    queryKey: ["application-strength", applicationId],
    queryFn: () => applicationId ? calculateApplicationStrength(applicationId) : Promise.resolve(undefined),
    enabled: !!applicationId
  })

  useEffect(() => {
    if (strengthData && typeof strengthData.totalScore === "number") {
      setOverallScore(strengthData.totalScore / 10)
      setBreakdown(strengthData.breakdown)
    }
  }, [strengthData])

  const strengthCategories: StrengthCategory[] = [
    { name: "Academic Fit", score: breakdown.institutionQuality, color: "green" },
    { name: "Financial Proof", score: breakdown.financialFit, color: breakdown.financialFit >= 80 ? "green" : breakdown.financialFit >= 60 ? "yellow" : "red" },
    { name: "Study Plan", score: breakdown.programFit, color: breakdown.programFit >= 80 ? "green" : breakdown.programFit >= 60 ? "yellow" : "red" },
    { name: "Home Ties", score: breakdown.userProfile, color: breakdown.userProfile >= 80 ? "green" : breakdown.userProfile >= 60 ? "yellow" : "red" },
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {overallScore.toFixed(1)}/10
        </div>
        <div className="text-sm text-gray-600">
          Stronger than 89% of successful student applicants
        </div>
      </div>
      <div className="space-y-3">
        {strengthCategories.map((category) => (
          <div key={category.name} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{category.name}</span>
            <div className="flex items-center gap-2 w-24">
              <ProgressBar score={category.score} color={category.color} />
              <span className="text-xs font-medium text-gray-600 w-8 text-right">
                {category.score}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StudyPlanGenerator({ applicationId }: { applicationId: number }) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/ai-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, type: "studyPlan" }),
      })
      const data = await res.json()
      setContent(data.template?.statementOfPurpose || "Failed to generate study plan.")
    } catch (e) {
      setContent("Failed to generate study plan.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">📝</span>
          <h3 className="text-base font-semibold text-gray-900">Study Plan Letter</h3>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1 text-ca-blue hover:text-ca-blue/80 text-xs"
        >
          <Edit3 className="w-3 h-3" />
          Edit
        </button>
      </div>
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ca-blue"
            placeholder="Enter your study plan..."
          />
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{content.length} characters</span>
            <span>Formatting tips: Use clear paragraphs</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs bg-ca-blue text-white rounded hover:bg-ca-blue/90"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed max-h-32 overflow-y-auto min-h-20">
            {loading ? "Generating..." : content || "Click 'Generate Study Plan Letter' to get started."}
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            className="w-full py-2 bg-ca-blue text-white text-sm font-medium rounded-lg hover:bg-ca-blue/90 transition-colors"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Study Plan Letter"}
          </button>
        </div>
      )}
    </div>
  )
}

function FinancialPlanGenerator({ applicationId }: { applicationId: number }) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/ai-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, type: "financialPlan" }),
      })
      const data = await res.json()
      setContent(data.template?.resumeTemplate || "Failed to generate financial plan.")
    } catch (e) {
      setContent("Failed to generate financial plan.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">💰</span>
          <h3 className="text-base font-semibold text-gray-900">Financial Plan Letter</h3>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1 text-ca-blue hover:text-ca-blue/80 text-xs"
        >
          <Edit3 className="w-3 h-3" />
          Edit
        </button>
      </div>
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-40 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ca-blue"
            placeholder="Enter your financial plan..."
          />
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{content.length} characters</span>
            <span>Formatting tips: Use clear sections</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-xs bg-ca-blue text-white rounded hover:bg-ca-blue/90"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed max-h-40 overflow-y-auto min-h-20">
            {loading ? "Generating..." : content || "Click 'Generate Financial Plan Letter' to get started."}
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            className="w-full py-2 bg-ca-blue text-white text-sm font-medium rounded-lg hover:bg-ca-blue/90 transition-colors"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Financial Plan Letter"}
          </button>
        </div>
      )}
    </div>
  )
}

export function BuilderContent() {
  const router = useRouter()
  const [documents, setDocuments] = useState<GeneratedDocument[]>([
    { name: "Study Plan Letter", generated: false },
    { name: "Financial Plan", generated: false },
    { name: "Sponsor Letter Template", generated: false },
  ])
  const [isGenerating, setIsGenerating] = useState(false)

  // Fetch data
  const { data: applications } = useQuery({
    queryKey: ["applications"],
    queryFn: () => getApplications()
  })

  const { data: uploadedDocuments } = useQuery({
    queryKey: ["documents"],
    queryFn: () => getDocuments()
  })

  const currentApplication = applications?.[0] // Get the most recent application

  const handleGenerateDocument = (index: number) => {
    setDocuments(prev => prev.map((doc, i) => 
      i === index ? { ...doc, loading: true } : doc
    ))

    // Mock generation delay
    setTimeout(() => {
      setDocuments(prev => prev.map((doc, i) => 
        i === index ? { ...doc, loading: false, generated: true } : doc
      ))
    }, 2000)
  }

  const handleGenerateCompletePackage = () => {
    setIsGenerating(true)
    
    // Generate all documents
    documents.forEach((_, index) => {
      setTimeout(() => {
        handleGenerateDocument(index)
      }, index * 1000)
    })

    // Complete after all documents
    setTimeout(() => {
      setIsGenerating(false)
    }, documents.length * 1000 + 2000)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start max-w-[400px] mx-auto pb-32 relative">
      {/* Subtitle and Progress */}
      <div className="w-full px-4 pt-5 pb-2">
        <div className="text-sm text-gray-700 font-medium mb-2 text-center">
          We'll generate your documents based on your profile
        </div>
        <div className="text-xs text-ca-blue font-medium text-center">
          Step 3 of 4
        </div>
      </div>

      {/* Application Strength Dashboard */}
      {currentApplication?.id && (
        <StrengthDashboard applicationId={currentApplication.id} />
      )}

      {/* Document Generators */}
      <div className="w-full px-4">
        <StudyPlanGenerator applicationId={currentApplication?.id ?? 0} />
        <FinancialPlanGenerator applicationId={currentApplication?.id ?? 0} />
        
        {/* Sponsor Letter Generator */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">📄</span>
            <h3 className="text-base font-semibold text-gray-900">Sponsor Letter Template</h3>
          </div>
          <div className="text-sm text-gray-600 mb-3">
            We'll generate a template for your family sponsor to complete and sign.
          </div>
          <button
            type="button"
            onClick={() => handleGenerateDocument(2)}
            className="w-full py-2 bg-ca-blue text-white text-sm font-medium rounded-lg hover:bg-ca-blue/90 transition-colors"
          >
            Generate Sponsor Letter Template
          </button>
        </div>
      </div>

      {/* Bottom Sticky Section */}
      <div className="fixed bottom-0 left-0 w-full flex flex-col items-center bg-white border-t border-gray-200 z-30" style={{ maxWidth: 400, margin: '0 auto' }}>
        <div className="w-full px-4 py-3 flex flex-col items-center">
          <div className="text-sm text-gray-700 mb-3 text-center">
            Ready to generate documents
          </div>
          <button
            type="button"
            className={clsx(
              "w-full py-3 rounded-lg font-semibold text-white shadow-md transition-colors",
              isGenerating 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-ca-blue hover:bg-ca-blue/90 active:bg-ca-blue/80"
            )}
            disabled={isGenerating}
            onClick={handleGenerateCompletePackage}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Complete Application Package...
              </div>
            ) : (
              "Generate Complete Application Package"
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 