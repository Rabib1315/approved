"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, AlertTriangle, Download, Mail, FolderOpen, FileText, Clock, Star, HelpCircle, ExternalLink, Loader2 } from "lucide-react"
import clsx from "clsx"

// Types
interface DocumentItem {
  name: string
  status: "completed" | "warning" | "missing"
  size?: string
}

interface PackageFolder {
  name: string
  documents: DocumentItem[]
}

interface NextStep {
  category: string
  items: { text: string; completed: boolean }[]
}

// Mock data
const packageFolders: PackageFolder[] = [
  {
    name: "01_Personal_Documents",
    documents: [
      { name: "passport_photo_page.pdf", status: "completed", size: "2.1 MB" },
      { name: "passport_photos.pdf", status: "completed", size: "1.8 MB" },
    ]
  },
  {
    name: "02_Academic_Documents",
    documents: [
      { name: "university_acceptance_letter.pdf", status: "completed", size: "1.2 MB" },
      { name: "official_transcripts.pdf", status: "warning" },
    ]
  },
  {
    name: "03_Financial_Documents",
    documents: [
      { name: "bank_statements.pdf", status: "completed", size: "3.5 MB" },
      { name: "sponsor_letter_template.pdf", status: "completed", size: "0.8 MB" },
    ]
  },
  {
    name: "04_Application_Letters",
    documents: [
      { name: "study_plan_letter.pdf", status: "completed", size: "1.1 MB" },
      { name: "purpose_of_visit_letter.pdf", status: "completed", size: "0.9 MB" },
      { name: "financial_explanation.pdf", status: "completed", size: "1.3 MB" },
    ]
  },
  {
    name: "05_Government_Forms",
    documents: [
      { name: "form_checklist.pdf", status: "completed", size: "0.5 MB" },
      { name: "submission_guide.pdf", status: "completed", size: "1.2 MB" },
    ]
  }
]

const nextSteps: NextStep[] = [
  {
    category: "🎯 Immediate Actions",
    items: [
      { text: "Download your application package", completed: false },
      { text: "Have parents sign the sponsor letter", completed: false },
      { text: "Get official sealed transcripts", completed: false },
      { text: "Review all documents one final time", completed: false },
    ]
  },
  {
    category: "🌐 Government Submission",
    items: [
      { text: "Create account on Canada.ca immigration portal", completed: false },
      { text: "Upload documents (we've organized them for you)", completed: false },
      { text: "Pay application fee (CAD $150)", completed: false },
      { text: "Submit application", completed: false },
    ]
  },
  {
    category: "📅 After Submission",
    items: [
      { text: "Book biometrics appointment", completed: false },
      { text: "Track application status", completed: false },
      { text: "Prepare for potential interview", completed: false },
    ]
  }
]

function DocumentItem({ document }: { document: DocumentItem }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        {document.status === "completed" && <CheckCircle className="w-3 h-3 text-green-500" />}
        {document.status === "warning" && <AlertTriangle className="w-3 h-3 text-yellow-500" />}
        {document.status === "missing" && <div className="w-3 h-3 border-2 border-red-300 rounded-full" />}
        <FileText className="w-3 h-3 text-gray-400" />
        <span className={clsx(
          "text-xs",
          document.status === "completed" && "text-green-700",
          document.status === "warning" && "text-yellow-700",
          document.status === "missing" && "text-red-700"
        )}>
          {document.name}
        </span>
      </div>
      {document.size && (
        <span className="text-xs text-gray-500">{document.size}</span>
      )}
    </div>
  )
}

function PackageFolder({ folder }: { folder: PackageFolder }) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-2">
        <FolderOpen className="w-4 h-4 text-ca-blue" />
        <span className="text-sm font-medium text-gray-900">{folder.name}/</span>
      </div>
      <div className="ml-4 space-y-0">
        {folder.documents.map((doc) => (
          <DocumentItem key={doc.name} document={doc} />
        ))}
      </div>
    </div>
  )
}

function NextStepsChecklist() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="text-base font-semibold text-gray-900 mb-3">Next Steps Checklist</h3>
      <div className="space-y-4">
        {nextSteps.map((step) => (
          <div key={step.category}>
            <button
              type="button"
              onClick={() => setExpandedCategory(expandedCategory === step.category ? null : step.category)}
              className="w-full flex items-center justify-between text-left"
            >
              <span className="text-sm font-medium text-gray-900">{step.category}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {step.items.filter(item => item.completed).length}/{step.items.length}
                </span>
                <div className={clsx(
                  "w-4 h-4 transition-transform",
                  expandedCategory === step.category && "rotate-180"
                )}>
                  ▼
                </div>
              </div>
            </button>
            {expandedCategory === step.category && (
              <div className="mt-2 space-y-1">
                {step.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 ml-4">
                    <div className={clsx(
                      "w-3 h-3 rounded-full border",
                      item.completed ? "bg-green-500 border-green-500" : "border-gray-300"
                    )}>
                      {item.completed && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className={clsx(
                      "text-xs",
                      item.completed ? "text-green-700 line-through" : "text-gray-700"
                    )}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function SubmissionTimeline() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="text-base font-semibold text-gray-900 mb-3">Submission Timeline</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">1</span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Today</div>
            <div className="text-xs text-gray-600">Download package</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-ca-blue rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">2</span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Day 1-2</div>
            <div className="text-xs text-gray-600">Get missing documents</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-xs font-bold">3</span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Day 3</div>
            <div className="text-xs text-gray-600">Submit online application</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-xs font-bold">4</span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Week 1</div>
            <div className="text-xs text-gray-600">Biometrics appointment</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-xs font-bold">5</span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Week 4-6</div>
            <div className="text-xs text-gray-600">Decision received</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SuccessTips() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="text-base font-semibold text-gray-900 mb-3">Success Tips</h3>
      <div className="space-y-3">
        <div>
          <div className="text-sm font-medium text-gray-900 mb-1">📋 Before you submit:</div>
          <ul className="text-xs text-gray-600 space-y-1 ml-4">
            <li>• Double-check all names match your passport exactly</li>
            <li>• Ensure all documents are high quality and readable</li>
            <li>• Keep copies of everything you submit</li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900 mb-1">🚨 Common mistakes to avoid:</div>
          <ul className="text-xs text-gray-600 space-y-1 ml-4">
            <li>• Don't submit unofficial transcripts</li>
            <li>• Ensure sponsor letter is properly signed and dated</li>
            <li>• Book biometrics within 30 days of submission</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function SupportSection() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-ca-blue" />
          <span className="text-sm font-medium text-gray-900">Need help?</span>
        </div>
        <div className={clsx("w-4 h-4 transition-transform", isExpanded && "rotate-180")}>
          ▼
        </div>
      </button>
      {isExpanded && (
        <div className="mt-3 space-y-2">
          <a href="#" className="flex items-center gap-2 text-xs text-ca-blue hover:underline">
            <ExternalLink className="w-3 h-3" />
            Government resources
          </a>
          <a href="#" className="flex items-center gap-2 text-xs text-ca-blue hover:underline">
            <ExternalLink className="w-3 h-3" />
            FAQ for common questions
          </a>
          <a href="#" className="flex items-center gap-2 text-xs text-ca-blue hover:underline">
            <ExternalLink className="w-3 h-3" />
            Track your application
          </a>
        </div>
      )}
    </div>
  )
}

export default function PackagePage() {
  const router = useRouter()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isEmailing, setIsEmailing] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)

  const handleDownload = () => {
    setIsDownloading(true)
    setTimeout(() => {
      setIsDownloading(false)
      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 3000)
    }, 2000)
  }

  const handleEmail = () => {
    setIsEmailing(true)
    setTimeout(() => {
      setIsEmailing(false)
      setEmailSuccess(true)
      setTimeout(() => setEmailSuccess(false), 3000)
    }, 1500)
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
        <h1 className="text-base font-semibold text-gray-900 flex-1 text-center ml-[-2.5rem]">Your Complete Application</h1>
      </header>

      {/* Subtitle and Success Banner */}
      <div className="w-full px-4 pt-5 pb-2">
        <div className="text-sm text-gray-700 font-medium mb-2 text-center">
          Ready to submit to Canadian immigration
        </div>
        <div className="bg-green-50 text-green-700 text-xs rounded-lg px-3 py-2 flex items-center gap-2 mb-4">
          <span className="text-lg">🎉</span>
          <span>Application package complete! You're ready to apply.</span>
        </div>
      </div>

      {/* Final Application Strength Summary */}
      <div className="w-full px-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="text-center mb-3">
            <div className="text-3xl font-bold text-gray-900 mb-1">9.4/10</div>
            <div className="text-sm text-gray-600 mb-2">
              Your application is stronger than 94% of successful applicants
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-700">96% approval likelihood</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-ca-blue" />
              <span className="text-gray-700">4-6 weeks typical processing time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Document Package */}
      <div className="w-full px-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Download className="w-5 h-5 text-ca-blue" />
            <h3 className="text-base font-semibold text-gray-900">Complete Document Package</h3>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="text-sm font-medium text-gray-900 mb-2">
              📦 Maria_Santos_Student_Visa_Package.zip (12.3 MB)
            </div>
            <div className="space-y-2">
              {packageFolders.map((folder) => (
                <PackageFolder key={folder.name} folder={folder} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps Checklist */}
      <div className="w-full px-4">
        <NextStepsChecklist />
        <SubmissionTimeline />
        <SuccessTips />
        <SupportSection />
      </div>

      {/* Bottom Sticky Section */}
      <div className="fixed bottom-0 left-0 w-full flex flex-col items-center bg-white border-t border-gray-200 z-30" style={{ maxWidth: 400, margin: '0 auto' }}>
        <div className="w-full px-4 py-3 flex flex-col items-center">
          {/* Success Messages */}
          {downloadSuccess && (
            <div className="w-full bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
              <div className="text-xs text-green-700 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                ✓ Package downloaded successfully!
              </div>
            </div>
          )}
          {emailSuccess && (
            <div className="w-full bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
              <div className="text-xs text-green-700 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                ✓ Sent to maria@example.com
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <button
            type="button"
            className={clsx(
              "w-full py-3 rounded-lg font-semibold text-white shadow-md transition-colors mb-2",
              isDownloading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-ca-blue hover:bg-ca-blue/90 active:bg-ca-blue/80"
            )}
            disabled={isDownloading}
            onClick={handleDownload}
          >
            {isDownloading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Downloading Package...
              </div>
            ) : (
              "Download Complete Package"
            )}
          </button>
          
          <button
            type="button"
            className={clsx(
              "w-full py-2 rounded-lg font-medium border transition-colors mb-2",
              isEmailing
                ? "border-gray-300 text-gray-400 cursor-not-allowed"
                : "border-ca-blue text-ca-blue hover:bg-ca-blue/5 active:bg-ca-blue/10"
            )}
            disabled={isEmailing}
            onClick={handleEmail}
          >
            {isEmailing ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                Email Package to Me
              </div>
            )}
          </button>
          
          <button
            type="button"
            className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            onClick={() => router.push("/")}
          >
            Start New Application
          </button>
        </div>
      </div>
    </div>
  )
} 