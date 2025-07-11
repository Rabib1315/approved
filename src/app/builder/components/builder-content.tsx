"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, AlertTriangle, Edit3, Download, FileText, FolderOpen, Loader2 } from "lucide-react"
import clsx from "clsx"
import { useQuery, useMutation } from "@tanstack/react-query"
import { getApplications, getApplicationStrength } from "@/actions/visa-actions"
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
  
  const { data: strengthScore } = useQuery({
    queryKey: ["application-strength", applicationId],
    queryFn: () => applicationId ? getApplicationStrength(applicationId) : Promise.resolve(0),
    enabled: !!applicationId
  })
  
  useEffect(() => {
    if (strengthScore !== undefined) {
      setOverallScore(strengthScore / 10) // Convert to 0-10 scale
    }
  }, [strengthScore])

  // Calculate category scores based on application data
  const strengthCategories: StrengthCategory[] = [
    { name: "Academic Fit", score: 95, color: "green" },
    { name: "Financial Proof", score: 78, color: "yellow" },
    { name: "Study Plan", score: 98, color: "green" },
    { name: "Home Ties", score: 85, color: "green" },
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

function StudyPlanGenerator({ onGenerate }: { onGenerate: () => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(`I am applying to pursue a Master of Computer Science at University of Toronto, starting September 2025. My academic background in computer science has prepared me for advanced study in computer science.

My financial situation shows CAD $42,000 in savings with family support of CAD $56,800 to cover the total program cost of CAD $98,800.

Upon completion, I plan to return to Brazil where the technology sector is growing rapidly and my specialized skills will be in high demand.`)

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
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed max-h-32 overflow-y-auto">
            {content}
          </div>
          <button
            type="button"
            onClick={onGenerate}
            className="w-full py-2 bg-ca-blue text-white text-sm font-medium rounded-lg hover:bg-ca-blue/90 transition-colors"
          >
            Generate Study Plan Letter
          </button>
        </div>
      )}
    </div>
  )
}

function FinancialPlanGenerator({ onGenerate }: { onGenerate: () => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(`I, Maria Santos, hereby declare my financial capacity to support my studies in Canada.

PROGRAM DETAILS:
- Institution: University of Toronto
- Program: Master of Computer Science
- Duration: 2 years (September 2025 - August 2027)
- Total Program Cost: CAD $98,800

BREAKDOWN OF COSTS:
- Tuition Fees (2 years): CAD $70,000
- Living Expenses (Toronto, 24 months): CAD $28,800
- Total Required: CAD $98,800

FUNDING SOURCES:
1. Personal Savings: CAD $42,000
   - Bank statements provided as proof
   - Funds available in Brazilian Real (R$) equivalent

2. Family Support: CAD $56,800
   - Sponsor: [Parent/Guardian Name]
   - Relationship: [Relationship]
   - Sponsor letter and financial documents provided

I confirm that all funds are readily available and will be accessible throughout my studies. I understand the financial requirements and commit to maintaining adequate funding for the duration of my program.

Signed: Maria Santos
Date: [Current Date]`)

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
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed max-h-40 overflow-y-auto">
            {content}
          </div>
          <button
            type="button"
            onClick={onGenerate}
            className="w-full py-2 bg-ca-blue text-white text-sm font-medium rounded-lg hover:bg-ca-blue/90 transition-colors"
          >
            Generate Financial Plan Letter
          </button>
        </div>
      )}
    </div>
  )
}

function DocumentChecklist({ documents }: { documents: any[] }) {
  // Map uploaded documents to checklist status
  const documentChecklist: DocumentStatus[] = [
    { name: "Acceptance Letter", status: "completed", uploaded: documents.some(d => d.type === "acceptanceLetter") },
    { name: "Bank Statements", status: "completed", uploaded: documents.some(d => d.type === "bankStatements") },
    { name: "Passport", status: "completed", uploaded: documents.some(d => d.type === "passport") },
    { name: "Official Transcripts", status: "warning", uploaded: documents.some(d => d.type === "transcripts") },
    { name: "Sponsor Letter", status: "warning" },
    { name: "Biometrics", status: "missing" },
  ]

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="text-base font-semibold text-gray-900 mb-3">Missing Documents Checklist</h3>
      <div className="space-y-2">
        {documentChecklist.map((doc) => (
          <div key={doc.name} className="flex items-center gap-2">
            {doc.status === "completed" && <CheckCircle className="w-4 h-4 text-green-500" />}
            {doc.status === "warning" && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
            {doc.status === "missing" && <div className="w-4 h-4 border-2 border-red-300 rounded-full" />}
            <span className={clsx(
              "text-sm",
              doc.status === "completed" && "text-green-700",
              doc.status === "warning" && "text-yellow-700",
              doc.status === "missing" && "text-red-700"
            )}>
              {doc.name}
              {doc.status === "warning" && " (sealed/official version needed)"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DocumentPackagePreview({ documents }: { documents: GeneratedDocument[] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="text-base font-semibold text-gray-900 mb-3">Document Package Preview</h3>
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-sm font-medium text-gray-900 mb-2">📁 Maria_Santos_Student_Visa_Application/</div>
        <div className="space-y-1 text-xs text-gray-600 ml-4">
          {documents.map((doc, index) => (
            <div key={doc.name} className="flex items-center gap-2">
              <FileText className="w-3 h-3" />
              <span className={doc.generated ? "text-green-700" : "text-gray-500"}>
                {String(index + 1).padStart(2, '0')}_{doc.name.replace(/\s+/g, '_')}.pdf
              </span>
              {doc.loading && <Loader2 className="w-3 h-3 animate-spin text-ca-blue" />}
              {doc.generated && <CheckCircle className="w-3 h-3 text-green-500" />}
            </div>
          ))}
          <div className="flex items-center gap-2">
            <FolderOpen className="w-3 h-3" />
            <span>04_Supporting_Documents/</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-3 h-3" />
            <span>05_Government_Forms_Checklist.pdf</span>
          </div>
        </div>
      </div>
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
      <div className="w-full px-4 mb-4">
        <StrengthDashboard applicationId={currentApplication?.id} />
      </div>

      {/* Document Generators */}
      <div className="w-full px-4">
        <StudyPlanGenerator onGenerate={() => handleGenerateDocument(0)} />
        <FinancialPlanGenerator onGenerate={() => handleGenerateDocument(1)} />
        
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

        <DocumentChecklist documents={uploadedDocuments || []} />
        <DocumentPackagePreview documents={documents} />
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